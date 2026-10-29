import { apiFetch } from './apiClient';
import { getApiLanguage } from './apiLanguage';
import { CLIENT_HEADERS } from '../constants/config';
import { devLog } from './log';

const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Backend so'rovlarining yagona xato turi.
 *  - status:  HTTP kodi (tarmoq yoki timeout xatosida 0)
 *  - code:    backend konvertidagi `code` ("token_revoked" kabi), bo'lmasa null
 *  - message: foydalanuvchiga ko'rsatsa bo'ladigan matn (backend xabari yoki zaxira matn)
 *  - details: backendning `detail` maydoni (masalan 422 validatsiya xatolari)
 *  - kind:    'http' | 'network' | 'timeout'
 *  - serverMessage: message backenddan kelgan (true) yoki zaxira matn (false)
 */
export class ApiError extends Error {
  constructor({
    status = 0,
    code = null,
    message,
    details = null,
    kind = 'http',
    serverMessage = false,
  }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.kind = kind;
    this.serverMessage = serverMessage;
  }

  get isNetwork() {
    return this.kind === 'network';
  }

  get isTimeout() {
    return this.kind === 'timeout';
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

// FastAPI validatsiya xatolari `detail` massivida keladi: [{ loc: [..., 'field'], msg }].
function describeDetail(detail) {
  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        const field = (d.loc || []).slice(-1)[0];
        return field != null && typeof field !== 'number' ? `${field}: ${d.msg}` : d.msg;
      })
      .join('; ');
  }
  return typeof detail === 'string' ? detail : null;
}

/**
 * Backendga so'rov yuboradi va konvertni ochib `response_data` ni qaytaradi.
 *  - body: obyekt bo'lsa JSON qilib yuboriladi (Content-Type o'zi qo'shiladi)
 *  - auth: false bo'lsa token qo'shilmaydi va 401 da yangilash urinilmaydi (login, parol tiklash)
 *  - timeout: millisekund; tugasa ApiError (kind: 'timeout')
 *  - fallbackMessage: backend xabar bermasa ko'rsatiladigan matn
 *  - envelope: true bo'lsa `response_data` emas, butun javob JSON qaytariladi
 * Muvaffaqiyatsiz holatda doim ApiError tashlanadi.
 */
export async function request(
  url,
  {
    method = 'GET',
    body,
    headers,
    timeout = DEFAULT_TIMEOUT_MS,
    auth = true,
    fallbackMessage,
    envelope = false,
  } = {}
) {
  const isJsonBody = body !== undefined && !(body instanceof FormData) && typeof body !== 'string';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const init = {
    method,
    signal: controller.signal,
    headers: {
      ...CLIENT_HEADERS,
      'Accept-Language': getApiLanguage(),
      ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...(headers || {}),
    },
    ...(body !== undefined ? { body: isJsonBody ? JSON.stringify(body) : body } : {}),
  };

  let res;
  try {
    res = await (auth ? apiFetch(url, init) : fetch(url, init));
  } catch (err) {
    // Aniq sabab (DNS, SSL, timeout) foydalanuvchi matnida yo'qoladi — Metro konsolida ko'rinadi.
    devLog(`[request] ✗ ${method} ${url} →`, err?.name, err?.message);
    if (err?.name === 'AbortError') {
      throw new ApiError({
        kind: 'timeout',
        code: 'timeout',
        message: "Server javob bermadi, qayta urinib ko'ring",
      });
    }
    throw new ApiError({
      kind: 'network',
      code: 'network_error',
      message: "Internet bilan aloqa yo'q",
    });
  } finally {
    clearTimeout(timer);
  }

  const json = await res.json().catch(() => null);

  if (!res.ok || json?.success === false) {
    const serverText = json?.message || describeDetail(json?.detail);
    throw new ApiError({
      serverMessage: Boolean(serverText),
      status: res.status,
      code: json?.code ?? null,
      message: serverText || fallbackMessage || `Xatolik (${res.status})`,
      details: json?.detail ?? null,
    });
  }

  return envelope ? json : json?.response_data;
}
