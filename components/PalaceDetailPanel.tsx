'use client';
import type { Palace, Star, ZiweiChart } from '@/lib/ziwei/types';
import { VI_BRANCH, VI_BRIGHTNESS, VI_PALACE, VI_SIHUA, VI_STAR } from '@/lib/ziwei/vi-names';
import { BRANCHES } from '@/lib/ziwei/constants';
import { PALACE_ROLES } from './InsightPanel';

// ─── Khung chi tiết cung (PalaceDetailPanel) ─────────────────────────────
// Hiển thị xác định từ chính lá số: ý nghĩa cung, sao chính + độ sáng,
// nhóm Cát tinh / Sát tinh, tự Hóa, tam phương tứ chính. KHÔNG gọi AI.
// Khẩu quyết Thiên Kỷ: bản mở chưa có dữ liệu (STAR_DB rỗng) nên khung
// ghi rõ là chưa có — không trích dẫn tạm từ nguồn khác.

function StarLine({ s }: { s: Star }) {
  return (
    <span>
      <strong style={{ color: 'var(--t-text)' }}>{VI_STAR[s.name] ?? s.name}</strong>
      {s.brightnessRaw && (
        <span style={{ color: 'var(--t-faint)' }}> [{VI_BRIGHTNESS[s.brightnessRaw] ?? s.brightnessRaw}]</span>
      )}
      {s.siHua && (
        <span style={{ color: 'var(--t-gold)' }}> Hóa {VI_SIHUA[s.siHua] ?? s.siHua}</span>
      )}
    </span>
  );
}

function StarGroup({ title, stars, emptyText, tone }: {
  title: string; stars: Star[]; emptyText: string; tone: string;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="text-[11px] font-medium mb-1" style={{ color: tone }}>{title} ({stars.length})</div>
      {stars.length === 0 ? (
        <div className="text-[12px]" style={{ color: 'var(--t-faint)', fontStyle: 'italic' }}>{emptyText}</div>
      ) : (
        <div className="text-[12px] leading-relaxed" style={{ color: 'var(--t-text2)' }}>
          {stars.map((s, i) => (
            <span key={s.name}>
              {i > 0 && ' · '}
              <StarLine s={s} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PalaceDetailPanel({ palace, chart }: { palace: Palace | null; chart: ZiweiChart }) {
  if (!palace) {
    return (
      <div className="card-glass rounded-xl p-5 text-center">
        <div className="text-[12px]" style={{ color: 'var(--t-faint)' }}>
          Bấm vào một cung trên bàn cờ để xem chi tiết: sao chính, cát tinh / sát tinh và tam phương tứ chính của cung đó.
        </div>
      </div>
    );
  }

  const palaceMap: Record<number, Palace> = {};
  chart.palaces.forEach(p => { palaceMap[p.branch] = p; });
  const majors = palace.stars.filter(s => s.type === 'major');
  const lucky = palace.stars.filter(s => s.type === 'lucky');
  const sha = palace.stars.filter(s => s.type === 'sha');
  const others = palace.stars.filter(s => s.type === 'minor');
  const relatedBranches = [
    palace.branch,
    (palace.branch + 6) % 12,
    (palace.branch + 4) % 12,
    (palace.branch + 8) % 12,
  ];
  const relatedLabels = ['Bản cung', 'Xung chiếu (đối cung)', 'Tam hợp 1', 'Tam hợp 2'];

  return (
    <div className="card-glass rounded-xl p-5">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className="text-[13px] font-medium" style={{ color: 'var(--t-gold)' }}>
          {VI_PALACE[palace.name] ?? palace.name}
        </span>
        <span className="text-[10px] font-mono" style={{ color: 'var(--t-faint)' }}>
          {VI_BRANCH[BRANCHES[palace.branch]] ?? BRANCHES[palace.branch]}
        </span>
        {palace.isMingGong && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-amber-500/30 text-amber-500">Cung Mệnh</span>
        )}
        {palace.isShenGong && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-sky-500/30 text-sky-500">Cung Thân</span>
        )}
        {palace.daXianAge && (
          <span className="text-[9px] ml-auto" style={{ color: 'var(--t-faint)' }}>
            Đại hạn {palace.daXianAge[0]}–{palace.daXianAge[1]} tuổi
            {palace.isCurrentDaXian ? ' · Đang trong đại hạn này' : ''}
          </span>
        )}
      </div>
      <p className="text-[12px] leading-relaxed mb-3" style={{ color: 'var(--t-text2)' }}>
        {PALACE_ROLES[palace.name] ?? ''}
      </p>

      <StarGroup title="🌟 Sao chính" stars={majors} emptyText="Cung trống — mượn sao chính cung đối để luận (xem mục Tam phương tứ chính)." tone="var(--t-gold)" />
      <StarGroup title="🌿 Cát tinh & Quý nhân" stars={lucky} emptyText="Không có cát tinh trong cung này." tone="#4ade80" />
      <StarGroup title="⚡ Sát tinh & Thách thức" stars={sha} emptyText="Không có sát tinh trong cung này." tone="#f87171" />
      {others.length > 0 && (
        <StarGroup title="✦ Sao phụ khác" stars={others} emptyText="" tone="var(--t-faint)" />
      )}

      {palace.selfSihua && palace.selfSihua.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div className="text-[11px] font-medium mb-1" style={{ color: 'var(--t-gold)' }}>Tự Hóa (cung tự hóa)</div>
          <div className="text-[12px]" style={{ color: 'var(--t-text2)' }}>
            {palace.selfSihua.map(m => (
              <span key={m.starName + m.siHua} style={{ marginRight: 10 }}>
                {VI_STAR[m.starName] ?? m.starName} tự Hóa {VI_SIHUA[m.siHua] ?? m.siHua}
              </span>
            ))}
          </div>
        </div>
      )}

      {palace.isEmpty && palace.borrowedStars && palace.borrowedStars.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div className="text-[11px] font-medium mb-1" style={{ color: 'var(--t-faint)' }}>Cung trống — mượn sao</div>
          <div className="text-[12px]" style={{ color: 'var(--t-text2)' }}>
            Mượn từ {palace.borrowedFromName ? (VI_PALACE[palace.borrowedFromName] ?? palace.borrowedFromName) : 'cung đối'}: {palace.borrowedStars.map(s => VI_STAR[s] ?? s).join(', ')}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 10 }}>
        <div className="text-[11px] font-medium mb-1" style={{ color: 'var(--t-gold)' }}>Tam phương tứ chính</div>
        {relatedBranches.map((b, i) => {
          const p = palaceMap[b];
          if (!p) return null;
          const pMajors = p.stars.filter(s => s.type === 'major');
          return (
            <div key={b} className="text-[12px] leading-relaxed" style={{ color: 'var(--t-text2)', marginBottom: 2 }}>
              <span style={{ color: 'var(--t-faint)' }}>{relatedLabels[i]}: </span>
              <strong style={{ color: 'var(--t-text)' }}>{VI_PALACE[p.name] ?? p.name}</strong>
              {' '}— {pMajors.length > 0 ? pMajors.map(s => VI_STAR[s.name] ?? s.name).join(', ') : 'cung trống'}
            </div>
          );
        })}
      </div>

      <div
        className="text-[10px] leading-relaxed pt-3"
        style={{ borderTop: '1px solid var(--t-border)', color: 'var(--t-faint)', opacity: 0.75 }}
      >
        Khẩu quyết Thiên Kỷ cho sao × cung này chưa có trong bản mở (kho câu luận STAR_DB đang rỗng) —
        sẽ bổ sung sau khi dịch xong 1.848 trích dẫn. Khung này không trích dẫn tạm từ nguồn khác.
      </div>
    </div>
  );
}
