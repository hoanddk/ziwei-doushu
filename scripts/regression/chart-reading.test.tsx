/**
 * Luận giải theo quy tắc (ChartReading) — kiểm chứng render, 10/11/2026.
 *
 * Khóa các tính chất đã kiểm chứng bằng tay:
 * - Lá số anh Hoàn (05/09/1977, giờ Sửu, Hà Nội): Mệnh tại chi 7 (Mùi),
 *   Thiên Đồng + Cự Môn, Đồng Hóa Quyền + Cự Hóa Kỵ, đại vận 42–51 tại Tài
 *   Bạch, lưu niên 2026 Bính Ngọ. Lưu niên Mệnh 2026 tại Ngọ (Huynh Đệ),
 *   KHÔNG trùng cung Mệnh gốc — bài học 10/11: đọc nhầm chi 7 thành Ngọ.
 * - Không còn cụm lặp "có sao chính không có sao chính" ở cung trống
 *   (lỗi câu dẫn đã sửa cùng đợt).
 * - Ba lá số khác nhau đều render đủ 9 mục, không ném lỗi.
 */
import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ChartReading from '../../components/ChartReading';
import { generateChart } from '../../lib/ziwei/algorithm';
import { formToBirthInfo } from '../../lib/ziwei/share';

// The repository preserves JSX for Next; tsx's standalone runner uses the
// classic JSX transform, which expects React as a global during SSR.
Object.assign(globalThis, { React });

function renderText(form: Parameters<typeof formToBirthInfo>[0], year: number): string {
  const chart = generateChart(formToBirthInfo(form));
  const html = renderToStaticMarkup(React.createElement(ChartReading, { chart, liunianYear: year }));
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

const HOAN = {
  name: 'Vũ Minh Hoàn', year: '1977', month: '9', day: '5',
  clockHour: '2', clockMinute: '0', unknownTime: false,
  province: 'Việt Nam', city: 'Hà Nội', longitude: 105.85, gender: 'male' as const,
};

// ── 1) Lá số anh Hoàn, lưu niên 2026 ─────────────────────────────────────
const t1 = renderText(HOAN, 2026);
for (const s of [
  'Luận giải theo quy tắc', 'Thiên Đồng', 'Cự Môn', 'Hóa Quyền', 'Hóa Kỵ',
  '42–51', 'Tài Bạch', 'Bính Ngọ', 'Lưu niên 2026', 'Dương Nhận nhập miếu',
  'Thân cư Phúc Đức', 'Không qua AI', 'Thiên Cơ', 'Hóa Khoa', 'Lộc Tồn', 'Hồng Loan',
]) {
  assert.ok(t1.includes(s), `ChartReading (anh Hoàn) thiếu chuỗi: ${s}`);
}
// Mệnh tại chi 7 = Mùi, không phải Ngọ; lưu niên Mệnh 2026 tại Ngọ nên
// không trùng Mệnh gốc.
const chartHoan = generateChart(formToBirthInfo(HOAN));
assert.equal(chartHoan.mingGongBranch, 7, 'Mệnh anh Hoàn tại chi 7 (Mùi)');
assert.ok(!t1.includes('trùng đúng cung Mệnh gốc'), '2026 lưu niên Mệnh không trùng Mệnh gốc');
assert.ok(!t1.includes('có sao chính không có sao chính'), 'Không còn cụm lặp ở cung trống');
// Tài Bạch trống, mượn từ Phúc Đức.
assert.ok(t1.includes('cung trống, mượn sao chính cung đối'), 'Tài Bạch trống phải ghi rõ mượn từ cung đối');

// ── 2) Hai lá số khác: đủ 9 mục, không lỗi ─────────────────────────────
const others: [Parameters<typeof formToBirthInfo>[0], number][] = [
  [{ name: 'Test Nữ', year: '1990', month: '3', day: '15', clockHour: '14', clockMinute: '0', unknownTime: false, province: 'Việt Nam', city: 'TP.HCM', longitude: 106.7, gender: 'female' }, 2026],
  [{ name: 'Test 2000', year: '2000', month: '11', day: '11', clockHour: '23', clockMinute: '30', unknownTime: false, province: 'Việt Nam', city: 'Hà Nội', longitude: 105.85, gender: 'male' }, 2026],
];
for (const [form, year] of others) {
  const t = renderText(form, year);
  assert.ok(t.includes('Luận giải theo quy tắc'), 'Thiếu tiêu đề luận giải');
  for (let i = 1; i <= 9; i++) {
    assert.ok(t.includes(`${i} · `), `Thiếu mục ${i}`);
  }
  assert.ok(!t.includes('có sao chính không có sao chính'), 'Không còn cụm lặp ở cung trống');
}

console.log('ChartReading regression passed');
