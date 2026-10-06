import { StyleSheet } from 'react-native';

// Barcha tahrirlash komponentlari shu uslublarni ishlatadi (ranglar esa mavzudan, inline beriladi).
export const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontWeight: '700', fontSize: 20 },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 9,
    paddingLeft: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },

  fieldLabel: { fontSize: 13, fontWeight: '600' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: 13,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  inputWrapMultiline: {
    height: 96,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  input: { flex: 1, fontSize: 14.5, fontWeight: '500', padding: 0 },
  inputMultiline: { height: '100%' },
  counter: { fontSize: 11, textAlign: 'right' },

  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 13,
    borderWidth: 1.5,
  },
  genderBtnText: { fontSize: 14, fontWeight: '700' },

  mapWrap: {
    borderRadius: 13,
    overflow: 'hidden',
  },

  saveBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(4,8,14,0.55)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingBottom: 24,
    maxHeight: '78%',
  },
  grabberRow: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  grabber: { width: 36, height: 4, borderRadius: 2 },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700' },
  sheetCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetEmpty: { textAlign: 'center', paddingVertical: 30, fontSize: 13 },
  sheetDivider: { height: 1, marginHorizontal: 20 },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sheetRowText: { fontSize: 15, fontWeight: '600' },

  dateWheelWrap: {
    flexDirection: 'row',
    height: 200,
    paddingHorizontal: 20,
    position: 'relative',
  },
  dateHighlight: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 80,
    height: 40,
    borderRadius: 10,
  },
  dateCell: { height: 40, alignItems: 'center', justifyContent: 'center' },
  dateCellText: { fontSize: 15 },

  confirmBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
