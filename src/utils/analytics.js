// Yengil voqea yuboruvchi (POST /analytics/events). Xato ilovaga ta'sir qilmaydi: yuborilmasa jimgina tashlanadi.
// `visit_id` — ilova ochilganda bir marta yaratiladigan 32 belgili hex; voqealar shu bilan bir tashrifga bog'lanadi.

import { ENDPOINTS } from '../constants/config';
import { request } from './request';

const FLUSH_DELAY_MS = 1500;
const MAX_BATCH = 20;

function makeVisitId() {
  let id = '';
  for (let i = 0; i < 32; i++) id += Math.floor(Math.random() * 16).toString(16);
  return id;
}

const visitId = makeVisitId();
let queue = [];
let timer = null;

async function flush() {
  timer = null;
  if (queue.length === 0) return;
  const events = queue.slice(0, MAX_BATCH);
  queue = queue.slice(MAX_BATCH);
  try {
    await request(ENDPOINTS.ANALYTICS_EVENTS, { method: 'POST', body: { events }, auth: false });
  } catch {
    // Tahlil voqeasi yo'qolsa zarar yo'q.
  }
  if (queue.length > 0) timer = setTimeout(flush, FLUSH_DELAY_MS);
}

// `step` faqat wizard_step_viewed uchun (1–6).
export function trackEvent(name, step) {
  const event = { name, visit_id: visitId };
  if (step != null) event.step = step;
  queue.push(event);
  if (!timer) timer = setTimeout(flush, FLUSH_DELAY_MS);
}
