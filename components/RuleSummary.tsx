'use client';
import { useState } from 'react';
import type { Palace, Star, ZiweiChart } from '@/lib/ziwei/types';
import { getMingGongSummary } from '@/lib/ziwei/ming-summary';
import { detectDingGui } from '@/lib/ziwei/patterns-dinggui';
import { detectDingFu } from '@/lib/ziwei/patterns-dingfu';
import { detectDingPin } from '@/lib/ziwei/patterns-dingpin';
import { CAREER_HINTS } from '@/lib/ziwei/career-hints';
import {
  VI_BRIGHTNESS, VI_JU, VI_KEYWORD, VI_NATURE, VI_PALACE,
  VI_SIHUA, VI_STAR,
} from '@/lib/ziwei/vi-names';

// ─── Tóm lược theo quy tắc cổ thư (RuleSummary) ──────────────────────────
// Trích xuất xác định (deterministic) từ chính lá số đã an: sao chính +
// độ sáng + Tứ Hóa + cách cục đã kiểm chứng + đại hạn. KHÔNG gọi AI,
// KHÔNG gọi /api/interpret, chạy được offline. Mọi câu chữ trong file này
// chỉ mô tả lại yếu tố đã có trên lá số (hoặc ghi rõ là gợi ý quy ước),
// không bịa thêm luận giải, không thay thế phần luận AI ở InsightPanel.

type TabId = 'overview' | 'career' | 'wealth' | 'love' | 'patterns' | 'dayun';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Tổng Quan' },
  { id: 'career', label: 'Công Danh' },
  { id: 'wealth', label: 'Tiền Tài' },
  { id: 'love', label: 'Tình Duyên' },
  { id: 'patterns', label: 'Cách Cục' },
  { id: 'dayun', label: 'Đại Vận & Năm Xem' },
];

const PALACE_CN = {
  ming: '命宫', quan: '官禄宫', tai: '财帛宫', phu: '夫妻宫',
} as const;

function palaceByName(chart: ZiweiChart, name: string): Palace | undefined {
  return chart.palaces.find(p => p.name === name);
}

function majorStars(palace?: Palace): Star[] {
  return palace?.stars.filter(s => s.type === 'major') ?? [];
}

function starLabel(s: Star): string {
  const name = VI_STAR[s.name] ?? s.name;
  const bright = s.brightnessRaw ? ` [${VI_BRIGHTNESS[s.brightnessRaw] ?? s.brightnessRaw}]` : '';
  const hua = s.siHua ? ` Hóa ${VI_SIHUA[s.siHua] ?? s.siHua}` : '';
  return `${name}${bright}${hua}`;
}

/** Cung có sao đào hoa nào thì ghi rõ cung đó (chỉ tra vị trí, không luận). */
function findStarPalaces(chart: ZiweiChart, starName: string): Palace[] {
  return chart.palaces.filter(p => p.stars.some(s => s.name === starName));
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--t-gold)' }}>{title}</div>
      <div className="text-[12px] leading-relaxed" style={{ color: 'var(--t-text2)' }}>{children}</div>
    </div>
  );
}

function StarList({ stars, emptyText }: { stars: Star[]; emptyText: string }) {
  if (stars.length === 0) return <span style={{ color: 'var(--t-faint)', fontStyle: 'italic' }}>{emptyText}</span>;
  return (
    <span>
      {stars.map((s, i) => (
        <span key={s.name}>
          {i > 0 && ' · '}
          <strong style={{ color: 'var(--t-text)' }}>{starLabel(s)}</strong>
        </span>
      ))}
    </span>
  );
}

export default function RuleSummary({ chart }: { chart: ZiweiChart }) {
  const [tab, setTab] = useState<TabId>('overview');
  // Cách cục: ba bảng Định Quý / Định Phú / Định Bần Tiện (《Tử Vi Đẩu Số
  // Toàn Thư》卷一, đã dịch vòng 2). Các file ding* không import
  // 'server-only' nên dùng được ở component client — khác với
  // lib/ziwei/patterns.ts (server-only) nên tab này không dùng detectPatterns.
  const patterns = [
    ...detectDingGui(chart).map(h => ({ ...h, group: 'Định Quý' })),
    ...detectDingFu(chart).map(h => ({ ...h, group: 'Định Phú' })),
    ...detectDingPin(chart).map(h => ({ ...h, group: 'Định Bần Tiện' })),
  ];
  const ming = palaceByName(chart, PALACE_CN.ming);
  const quan = palaceByName(chart, PALACE_CN.quan);
  const tai = palaceByName(chart, PALACE_CN.tai);
  const phu = palaceByName(chart, PALACE_CN.phu);
  const { keywords, nature } = getMingGongSummary(chart);
  const currentDx = chart.daXians[chart.currentDaXianIndex];
  const shenPalace = chart.palaces.find(p => p.branch === chart.shenGongBranch);

  // Tứ Hóa bản mệnh: sao nào hóa gì, ở cung nào.
  const siHuaList: { star: Star; palace: Palace }[] = [];
  for (const palace of chart.palaces) {
    for (const star of palace.stars) {
      if (star.siHua) siHuaList.push({ star, palace });
    }
  }

  const hongLoan = findStarPalaces(chart, '红鸾');
  const tianXi = findStarPalaces(chart, '天喜');
  const luCun = findStarPalaces(chart, '禄存');

  return (
    <div className="card-glass rounded-xl p-5">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className="text-[10px] tracking-widest" style={{ color: 'var(--t-faint)' }}>
          <span style={{ color: 'var(--t-gold)', opacity: 0.6 }}>📜</span> Tóm lược theo quy tắc cổ thư
        </span>
        <span
          className="text-[9px] px-2 py-0.5 rounded-full border"
          style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.06)' }}
        >
          Trích xuất tự động · Không qua AI
        </span>
        {patterns.length > 0 && (
          <span className="text-[9px] ml-auto" style={{ color: 'var(--t-faint)', opacity: 0.75 }}>
            {patterns.length} cách cục
          </span>
        )}
      </div>

      {/* Tab lọc */}
      <div className="flex gap-1.5 flex-wrap my-3">
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                padding: '5px 11px', borderRadius: 999, fontSize: 11, cursor: 'pointer',
                border: `1px solid ${active ? 'rgba(212,168,67,0.6)' : 'var(--t-border)'}`,
                background: active ? 'rgba(212,168,67,0.12)' : 'transparent',
                color: active ? 'var(--t-gold)' : 'var(--t-faint)',
              }}
            >
              {t.label}{t.id === 'patterns' && patterns.length > 0 ? ` (${patterns.length})` : ''}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
        <div>
          <Section title="Cốt cách — sao chính cung Mệnh">
            <StarList stars={majorStars(ming)} emptyText="Cung Mệnh trống — mượn sao chính cung đối (Thiên Di) để luận, xem khung chi tiết cung." />
            {nature && (
              <span> · Tính chất: {VI_NATURE[nature] ?? nature}</span>
            )}
            {ming?.isEmpty && ming.borrowedStars && ming.borrowedStars.length > 0 && (
              <span> · Mượn từ cung đối: {ming.borrowedStars.map(s => VI_STAR[s] ?? s).join(', ')}</span>
            )}
          </Section>
          {keywords.length > 0 && (
            <Section title="Đặc điểm tính cách (từ sao Mệnh)">
              {keywords.map(k => VI_KEYWORD[k] ?? k).join(' · ')}
            </Section>
          )}
          <Section title="Cục & Thân">
            {VI_JU[chart.wuxingJuName] ?? chart.wuxingJuName}
            {shenPalace && (
              <span> · Thân cư {VI_PALACE[shenPalace.name] ?? shenPalace.name}</span>
            )}
            {chart.mingZhu && (
              <span> · Chủ Mệnh {VI_STAR[chart.mingZhu] ?? chart.mingZhu}</span>
            )}
            {chart.shenZhu && (
              <span> · Chủ Thân {VI_STAR[chart.shenZhu] ?? chart.shenZhu}</span>
            )}
          </Section>
          {siHuaList.length > 0 && (
            <Section title="Tứ Hóa bản mệnh">
              {siHuaList.map(({ star, palace }, i) => (
                <span key={star.name + star.siHua}>
                  {i > 0 && ' · '}
                  <strong style={{ color: 'var(--t-text)' }}>{VI_STAR[star.name] ?? star.name}</strong>
                  {' '}Hóa {VI_SIHUA[star.siHua!] ?? star.siHua} tại {VI_PALACE[palace.name] ?? palace.name}
                </span>
              ))}
            </Section>
          )}
        </div>
      )}

      {tab === 'career' && (
        <div>
          <Section title="Sao chính cung Quan Lộc">
            <StarList stars={majorStars(quan)} emptyText="Cung Quan Lộc trống — mượn sao chính cung đối (Phu Thê) để luận." />
          </Section>
          <Section title="Sao chính cung Mệnh (nền tảng)">
            <StarList stars={majorStars(ming)} emptyText="Cung Mệnh trống." />
          </Section>
          {majorStars(quan).length > 0 && (
            <Section title="Hướng gợi ý theo sao chủ Quan Lộc (bảng quy ước sách cổ, chỉ tham khảo)">
              {majorStars(quan).map(s => (
                <div key={s.name} style={{ marginBottom: 4 }}>
                  <strong style={{ color: 'var(--t-text)' }}>{VI_STAR[s.name] ?? s.name}</strong>
                  {': '}{(CAREER_HINTS[s.name] ?? []).join(' · ') || '—'}
                </div>
              ))}
            </Section>
          )}
        </div>
      )}

      {tab === 'wealth' && (
        <div>
          <Section title="Sao chính cung Tài Bạch">
            <StarList stars={majorStars(tai)} emptyText="Cung Tài Bạch trống — mượn sao chính cung đối (Phúc Đức) để luận." />
          </Section>
          <Section title="Dấu hiệu tụ tài trên lá số">
            {siHuaList.filter(({ star }) => star.siHua === '禄').length > 0 ? (
              siHuaList.filter(({ star }) => star.siHua === '禄').map(({ star, palace }, i) => (
                <span key={star.name}>
                  {i > 0 && ' · '}
                  <strong style={{ color: 'var(--t-text)' }}>{VI_STAR[star.name] ?? star.name}</strong>
                  {' '}Hóa Lộc tại {VI_PALACE[palace.name] ?? palace.name}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--t-faint)', fontStyle: 'italic' }}>Không có sao Hóa Lộc bản mệnh.</span>
            )}
            {luCun.length > 0 && (
              <span>
                {' · '}Lộc Tồn tại {luCun.map(p => VI_PALACE[p.name] ?? p.name).join(', ')}
              </span>
            )}
          </Section>
        </div>
      )}

      {tab === 'love' && (
        <div>
          <Section title="Sao chính cung Phu Thê">
            <StarList stars={majorStars(phu)} emptyText="Cung Phu Thê trống — mượn sao chính cung đối (Quan Lộc) để luận." />
          </Section>
          <Section title="Sao đào hoa">
            {hongLoan.length > 0 ? (
              <span>Hồng Loan tại {hongLoan.map(p => VI_PALACE[p.name] ?? p.name).join(', ')}</span>
            ) : (
              <span style={{ color: 'var(--t-faint)', fontStyle: 'italic' }}>Không có Hồng Loan trên lá số. </span>
            )}
            {tianXi.length > 0 ? (
              <span> · Thiên Hỉ tại {tianXi.map(p => VI_PALACE[p.name] ?? p.name).join(', ')}</span>
            ) : (
              <span> · Không có Thiên Hỉ trên lá số.</span>
            )}
          </Section>
        </div>
      )}

      {tab === 'patterns' && (
        <div>
          {patterns.length === 0 ? (
            <p style={{ color: 'var(--t-faint)', fontStyle: 'italic' }}>
              Không phát hiện cách cục nào theo ba bảng Định Quý / Định Phú / Định Bần Tiện
              (《Tử Vi Đẩu Số Toàn Thư》卷一, 41 điều đã dịch và kiểm chứng).
            </p>
          ) : (
            patterns.map((p, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div className="text-[12px] font-medium" style={{ color: 'var(--t-gold)' }}>
                  {p.name}{' '}
                  <span style={{ color: 'var(--t-faint)', fontWeight: 400 }}>
                    · {p.group} #{p.no}
                    {p.status === 'disputed' ? ' · Cách đọc còn tranh luận' : ''}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--t-text2)' }}>{p.note}</p>
                <div className="text-[10px]" style={{ color: 'var(--t-faint)', opacity: 0.6 }}>
                  Nguồn · 《Tử Vi Đẩu Số Toàn Thư》卷一 — {p.group}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'dayun' && (
        <div>
          {currentDx ? (
            <Section title={`Đại hạn hiện tại — ${currentDx.startAge}–${currentDx.endAge} tuổi`}>
              Cung {VI_PALACE[currentDx.palaceName] ?? currentDx.palaceName}
              {(() => {
                const p = chart.palaces.find(pp => pp.branch === currentDx.palaceBranch);
                const majors = majorStars(p);
                return majors.length > 0 ? (
                  <span>: <StarList stars={majors} emptyText="" /></span>
                ) : null;
              })()}
              {currentDx.siHua && (
                <span>
                  {' · '}Tứ Hóa đại hạn: {VI_STAR[currentDx.siHua.lu] ?? currentDx.siHua.lu} Hóa Lộc,{' '}
                  {VI_STAR[currentDx.siHua.quan] ?? currentDx.siHua.quan} Hóa Quyền,{' '}
                  {VI_STAR[currentDx.siHua.ke] ?? currentDx.siHua.ke} Hóa Khoa,{' '}
                  {VI_STAR[currentDx.siHua.ji] ?? currentDx.siHua.ji} Hóa Kỵ
                </span>
              )}
            </Section>
          ) : (
            <p style={{ color: 'var(--t-faint)', fontStyle: 'italic' }}>Chưa xác định được đại hạn hiện tại.</p>
          )}
          <Section title="Các đại hạn kế tiếp">
            {chart.daXians.slice(chart.currentDaXianIndex + 1, chart.currentDaXianIndex + 3).map(dx => (
              <div key={dx.startAge} style={{ marginBottom: 4 }}>
                {dx.startAge}–{dx.endAge} tuổi · {VI_PALACE[dx.palaceName] ?? dx.palaceName}
              </div>
            ))}
            {chart.daXians.slice(chart.currentDaXianIndex + 1, chart.currentDaXianIndex + 3).length === 0 && (
              <span style={{ color: 'var(--t-faint)', fontStyle: 'italic' }}>Không còn đại hạn kế tiếp trong bảng.</span>
            )}
          </Section>
          <Section title="Năm xem">
            Năm {new Date().getFullYear()} · Tuổi {chart.currentAge} · Xem lưu niên bằng thanh thời gian phía trên bàn cờ (chuyển sang chế độ Lưu niên).
          </Section>
        </div>
      )}

      <div
        className="text-[10px] leading-relaxed pt-3 mt-1"
        style={{ borderTop: '1px solid var(--t-border)', color: 'var(--t-faint)', opacity: 0.75 }}
      >
        Tóm lược này chỉ trích xuất các yếu tố đã an trên lá số theo quy tắc cổ thư (Tử Vi Đẩu Số Toàn Thư)
        và kho cách cục đã kiểm chứng — không phải luận giải AI, chỉ mang tính tham khảo.
        Sao chính hiển thị kèm độ sáng trong [ ]: Miếu · Vượng · Đắc · Lợi · Bình · Bất · Nhàn · Hãm · Địa.
      </div>
    </div>
  );
}
