'use client';
import type { Palace, Star, ZiweiChart } from '@/lib/ziwei/types';
import { BRANCHES, STEMS } from '@/lib/ziwei/constants';
import { getMingGongSummary } from '@/lib/ziwei/ming-summary';
import { detectDingGui } from '@/lib/ziwei/patterns-dinggui';
import { detectDingFu } from '@/lib/ziwei/patterns-dingfu';
import { detectDingPin } from '@/lib/ziwei/patterns-dingpin';
import { CAREER_HINTS } from '@/lib/ziwei/career-hints';
import { buildSiHuaOverlay, getYearStemIndex } from '@/components/TimeNav';
import { getLiuYueMonths } from '@/lib/ziwei/liuyue';
import { Solar } from 'lunar-javascript';
import {
  VI_BRANCH, VI_BRIGHTNESS, VI_JU, VI_KEYWORD, VI_NATURE, VI_PALACE,
  VI_SHICHEN, VI_SIHUA, VI_STAR, VI_STEM,
} from '@/lib/ziwei/vi-names';

// ─── Luận giải theo quy tắc cổ thư (ChartReading) ─────────────────────────
// Ráp bản luận đầy đủ từ chính lá số đã an: sao chính + độ sáng + Tứ Hóa
// + Lục Cát/Lục Sát + đại hạn + lưu niên + lưu nguyệt + cách cục đã kiểm chứng.
// KHÔNG gọi AI, KHÔNG gọi /api/interpret, chạy được offline.
//
// Mọi câu luận đều là câu mẫu cố định, mỗi câu gắn với đúng một điều kiện
// trên lá số (ví dụ: "Hóa Kỵ tại Mệnh", "Tài Bạch trống", "Thân cư Phúc
// Đức"). Câu nào không có điều kiện tương ứng thì không hiện. Phần nào là
// dữ liệu trích ra, phần nào là câu mẫu theo quy tắc, đều ghi rõ trong bài.
// Bản luận chỉ mang tính tham khảo; bài luận chi tiết từng sao từng cung
// (STAR_DB) vẫn đang trống, trừ 1 mục mẫu Tử Vi ở Mệnh.

const LUC_CAT = ['左辅', '右弼', '文昌', '文曲', '天魁', '天钺'];
const LUC_SAT = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫'];
const WEAK_BRIGHT = ['陷', '不', '闲', '地'];
const STRONG_BRIGHT = ['庙', '旺'];

const YINYANG_VI: Record<string, string> = {
  '阳男': 'Dương Nam', '阴男': 'Âm Nam', '阳女': 'Dương Nữ', '阴女': 'Âm Nữ',
};

// Câu mẫu cố định cho Thân cư từng cung (quy tắc chung trong sách cổ).
const SHEN_SENTENCES: Record<string, string> = {
  '命宫': 'Thân cư Mệnh, chủ cả đời lấy bản thân làm trọng tâm, tính cách và lựa chọn cá nhân quyết định hậu vận.',
  '兄弟宫': 'Thân cư Huynh Đệ, chủ hậu vận gắn nhiều với anh em, bạn bè và các mối hợp tác.',
  '夫妻宫': 'Thân cư Phu Thê, chủ hậu vận gắn nhiều với vợ chồng, hôn nhân là chỗ dựa tinh thần lớn nhất.',
  '子女宫': 'Thân cư Tử Nữ, chủ hậu vận gắn nhiều với con cái và học trò, lớp sau.',
  '财帛宫': 'Thân cư Tài Bạch, chủ hậu vận đặt nặng tiền bạc, thu nhập là thước đo an tâm.',
  '疾厄宫': 'Thân cư Tật Ách, chủ hậu vận cần chú ý sức khỏe hơn cả, thân thể an thì mọi sự an.',
  '迁移宫': 'Thân cư Thiên Di, chủ hậu vận gắn với đi lại, ra ngoài, xa quê mới phát.',
  '仆役宫': 'Thân cư Nô Bộc, chủ hậu vận gắn với bạn bè, cấp dưới và các mối quan hệ xã hội.',
  '官禄宫': 'Thân cư Quan Lộc, chủ hậu vận gửi gắm vào sự nghiệp, càng làm càng vững.',
  '田宅宫': 'Thân cư Điền Trạch, chủ hậu vận gắn với nhà cửa, đất đai, gia đình là gốc.',
  '福德宫': 'Thân cư Phúc Đức, chủ hậu vận dựa vào phúc đức, tinh thần an nhàn, được quý nhân phù trợ.',
  '父母宫': 'Thân cư Phụ Mẫu, chủ hậu vận gắn nhiều với cha mẹ, bậc trên và gia phong.',
};

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

function viPalace(p?: Palace): string {
  return p ? (VI_PALACE[p.name] ?? p.name) : '—';
}

function findStarPalaces(chart: ZiweiChart, starName: string): Palace[] {
  return chart.palaces.filter(p => p.stars.some(s => s.name === starName));
}

function palaceOfStar(chart: ZiweiChart, starName: string): Palace | undefined {
  return chart.palaces.find(p => p.stars.some(s => s.name === starName));
}

/** Các sao Hóa (Lộc/Quyền/Khoa/Kỵ) của bản mệnh: sao nào hóa gì, ở cung nào. */
function siHuaPlacements(chart: ZiweiChart): { star: Star; palace: Palace }[] {
  const out: { star: Star; palace: Palace }[] = [];
  for (const palace of chart.palaces) {
    for (const star of palace.stars) {
      if (star.siHua) out.push({ star, palace });
    }
  }
  return out;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 20 }}>
      <h3
        className="text-[13px] font-semibold mb-2"
        style={{ color: 'var(--t-gold)', letterSpacing: '0.04em' }}
      >
        {title}
      </h3>
      <div className="text-[13px] leading-[1.9]" style={{ color: 'var(--t-text2)' }}>
        {children}
      </div>
    </section>
  );
}

function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ marginBottom: 8, ...style }}>{children}</p>;
}

function Stars({ stars, emptyText }: { stars: Star[]; emptyText: string }) {
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

export default function ChartReading({ chart, liunianYear }: { chart: ZiweiChart; liunianYear: number }) {
  const ming = palaceByName(chart, '命宫');
  const quan = palaceByName(chart, '官禄宫');
  const tai = palaceByName(chart, '财帛宫');
  const phu = palaceByName(chart, '夫妻宫');
  const fuDe = palaceByName(chart, '福德宫');
  const tianDi = palaceByName(chart, '迁移宫');
  const dienTrach = palaceByName(chart, '田宅宫');
  const shenPalace = chart.palaces.find(p => p.branch === chart.shenGongBranch);
  const { keywords, nature } = getMingGongSummary(chart);

  const siHua = siHuaPlacements(chart);
  const siHuaAt = (palace?: Palace) => siHua.filter(x => x.palace === palace);
  const mingMajors = majorStars(ming);
  const mingAllWeak = mingMajors.length > 0 && mingMajors.every(s => s.brightnessRaw && WEAK_BRIGHT.includes(s.brightnessRaw));
  const mingAnyStrong = mingMajors.some(s => s.brightnessRaw && STRONG_BRIGHT.includes(s.brightnessRaw));
  const mingCat = ming?.stars.filter(s => LUC_CAT.includes(s.name)) ?? [];
  const mingSat = ming?.stars.filter(s => LUC_SAT.includes(s.name)) ?? [];
  // Cung nào có đồng thời một sao Hóa Quyền và một sao Hóa Kỵ.
  const quanKyPalaces = chart.palaces.filter(p => {
    const hua = p.stars.map(s => s.siHua).filter(Boolean);
    return hua.includes('权') && hua.includes('忌');
  });

  const patterns = [
    ...detectDingGui(chart).map(h => ({ ...h, group: 'Định Quý' })),
    ...detectDingFu(chart).map(h => ({ ...h, group: 'Định Phú' })),
    ...detectDingPin(chart).map(h => ({ ...h, group: 'Định Bần Tiện' })),
  ];

  const currentDx = chart.daXians[chart.currentDaXianIndex];
  const nextDx = chart.daXians[chart.currentDaXianIndex + 1];
  const currentDxPalace = currentDx ? chart.palaces.find(p => p.branch === currentDx.palaceBranch) : undefined;

  // Lưu niên năm xem: can chi + cung Lưu niên Mệnh + Tứ Hóa của năm.
  const lnStemIdx = getYearStemIndex(liunianYear);
  const lnBranchIdx = ((liunianYear - 4) % 12 + 12) % 12;
  const lnCanChi = `${VI_STEM[STEMS[lnStemIdx]] ?? STEMS[lnStemIdx]} ${VI_BRANCH[BRANCHES[lnBranchIdx]] ?? BRANCHES[lnBranchIdx]}`;
  const lnMingPalace = chart.palaces.find(p => p.branch === lnBranchIdx);
  const lnOverlay = buildSiHuaOverlay(lnStemIdx);
  const lnPlacements = (['禄', '权', '科', '忌'] as const).map(sh => {
    const starName = Object.keys(lnOverlay).find(k => lnOverlay[k] === sh);
    if (!starName) return null;
    return { sh, starName, palace: palaceOfStar(chart, starName) };
  }).filter(Boolean) as { sh: string; starName: string; palace?: Palace }[];

  // Lưu nguyệt năm xem: 12 tháng âm lịch (+ tháng nhuận nếu có).
  const liuYueMonths = getLiuYueMonths(chart, liunianYear);
  // Tháng âm lịch hiện tại (để đánh dấu dòng "tháng này").
  let currentLunarMonth: number | null = null;
  try {
    const now = new Date();
    const nowLunar = Solar.fromYmd(now.getFullYear(), now.getMonth() + 1, now.getDate()).getLunar();
    if (nowLunar.getYear() === liunianYear) currentLunarMonth = Math.abs(nowLunar.getMonth());
  } catch {
    currentLunarMonth = null;
  }

  const hongLoan = findStarPalaces(chart, '红鸾');
  const tianXi = findStarPalaces(chart, '天喜');
  const tianYao = findStarPalaces(chart, '天姚');
  const luCun = findStarPalaces(chart, '禄存');
  const kyPlacements = siHua.filter(x => x.star.siHua === '忌');
  const emptyKeys = [
    { palace: ming, label: 'Mệnh' },
    { palace: quan, label: 'Quan Lộc' },
    { palace: tai, label: 'Tài Bạch' },
    { palace: phu, label: 'Phu Thê' },
  ].filter(x => majorStars(x.palace).length === 0);

  const b = chart.birthInfo;
  const lunar = chart.lunarInfo;
  const birthLine = [
    b.name ? b.name : null,
    `dương lịch ${String(b.day).padStart(2, '0')}/${String(b.month).padStart(2, '0')}/${b.year}`,
    `âm lịch ${lunar.lunarDay}/${Math.abs(lunar.lunarMonth)}/${lunar.lunarYear}${lunar.isLeapMonth ? ' (nhuận)' : ''}`,
    `giờ ${VI_SHICHEN[b.hour] ?? ''}${b.trueSolarClock ? ` (giờ chân thái dương ${b.trueSolarClock})` : ''}`,
    chart.yinYangGender ? YINYANG_VI[chart.yinYangGender] ?? chart.yinYangGender : null,
    VI_JU[chart.wuxingJuName] ?? chart.wuxingJuName,
  ].filter(Boolean).join(' · ');

  return (
    <div className="card-glass rounded-xl p-5">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className="text-[10px] tracking-widest" style={{ color: 'var(--t-faint)' }}>
          <span style={{ color: 'var(--t-gold)', opacity: 0.6 }}>📖</span> Luận giải theo quy tắc cổ thư
        </span>
        <span
          className="text-[9px] px-2 py-0.5 rounded-full border"
          style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.06)' }}
        >
          Trích xuất tự động · Không qua AI
        </span>
      </div>
      <p className="text-[11px] leading-relaxed mb-4" style={{ color: 'var(--t-faint)' }}>
        {birthLine}
        {lunar.fourPillars && (
          <span> · Tứ Trụ {lunar.fourPillars.join(' / ')}</span>
        )}
      </p>

      <Section title="1 · Mệnh cách tổng quan">
        <P>
          Cung Mệnh tại {viPalace(ming)}:{' '}
          <Stars stars={mingMajors} emptyText="Không có sao chính — cung trống" />
          {ming?.isEmpty && ming.borrowedStars && ming.borrowedStars.length > 0 && (
            <span>, mượn từ cung đối: {ming.borrowedStars.map(s => VI_STAR[s] ?? s).join(', ')}</span>
          )}
          .
          {nature && (
            <span> Tính chất sao Mệnh: {VI_NATURE[nature] ?? nature}.</span>
          )}
          {keywords.length > 0 && (
            <span> Đặc điểm: {keywords.map(k => VI_KEYWORD[k] ?? k).join(' · ')}.</span>
          )}
        </P>
        {mingAnyStrong && (
          <P>
            Sao chính ở Mệnh miếu vượng, chủ có ưu thế bẩm sinh, làm việc được nửa công gấp bội
            (theo Toàn Thư, chương Mệnh cung).
          </P>
        )}
        {mingAllWeak && (
          <P>
            Sao chính ở Mệnh đều ở độ sáng yếu (hãm). Theo Toàn Thư, chương Mệnh cung, sao chính
            lạc hãm chủ có bất lợi bẩm sinh, nhưng ngược lại chủ nên việc lớn — người lạc hãm có
            hai chữ “không cam chịu” thúc đẩy, ngược lại có thể làm nên điều mà mệnh cách miếu
            vượng không làm được.
          </P>
        )}
        {siHuaAt(ming).length > 0 && (
          <P>
            Tứ Hóa tại Mệnh:{' '}
            {siHuaAt(ming).map(({ star }, i) => (
              <span key={star.name}>
                {i > 0 && ' · '}
                <strong style={{ color: 'var(--t-text)' }}>{VI_STAR[star.name] ?? star.name}</strong>
                {' '}Hóa {VI_SIHUA[star.siHua!] ?? star.siHua}
              </span>
            ))}
            .
          </P>
        )}
        {quanKyPalaces.some(p => p === ming) && (
          <P>
            Mệnh có đồng thời sao Hóa Quyền và sao Hóa Kỵ: có quyền, có tiếng nói, nhưng lời nói
            cũng dễ sinh thị phi; càng có vị trí càng bị soi xét, nên thận trọng lời ăn tiếng nói.
          </P>
        )}
        {mingCat.length > 0 && (
          <P>
            Mệnh gặp cát tinh {mingCat.map(s => VI_STAR[s.name] ?? s.name).join(', ')}, chủ cả đời
            quý nhân không dứt (theo Toàn Thư, chương Mệnh cung).
          </P>
        )}
        {mingSat.length > 0 && (
          <P>
            Mệnh gặp sát tinh {mingSat.map(s => VI_STAR[s.name] ?? s.name).join(', ')}, chủ nhiều
            sóng gió mài giũa, nhưng nếu nhẫn được qua, ngược lại thành đại khí
            (theo Toàn Thư, chương Mệnh cung).
          </P>
        )}
        <P>
          Tam phương tứ chính của Mệnh: Quan Lộc{' '}
          <Stars stars={majorStars(quan)} emptyText="trống" />
          {' · '}Tài Bạch{' '}
          <Stars stars={majorStars(tai)} emptyText="trống" />
          {' · '}Thiên Di{' '}
          <Stars stars={majorStars(tianDi)} emptyText="trống" />.
        </P>
      </Section>

      <Section title="2 · Công danh — cung Quan Lộc">
        <P>
          Cung Quan Lộc:{' '}
          <Stars stars={majorStars(quan)} emptyText="Không có sao chính — cung trống" />
          {quan?.isEmpty && quan.borrowedStars && quan.borrowedStars.length > 0 && (
            <span>, mượn từ cung đối: {quan.borrowedStars.map(s => VI_STAR[s] ?? s).join(', ')}</span>
          )}
          .
        </P>
        {siHuaAt(quan).length > 0 && (
          <P>
            Tứ Hóa tại Quan Lộc:{' '}
            {siHuaAt(quan).map(({ star }, i) => (
              <span key={star.name}>
                {i > 0 && ' · '}
                <strong style={{ color: 'var(--t-text)' }}>{VI_STAR[star.name] ?? star.name}</strong>
                {' '}Hóa {VI_SIHUA[star.siHua!] ?? star.siHua}
              </span>
            ))}
            {siHuaAt(quan).some(({ star }) => star.siHua === '科') && (
              <span> — Hóa Khoa tại Quan Lộc chủ danh tiếng nghề nghiệp tốt.</span>
            )}
            .
          </P>
        )}
        {quan?.stars.some(s => s.name === '天魁' || s.name === '天钺') && (
          <P>
            Quan Lộc có {quan.stars.filter(s => s.name === '天魁' || s.name === '天钺').map(s => VI_STAR[s.name] ?? s.name).join(', ')},
            chủ trong sự nghiệp hay gặp quý nhân nâng đỡ.
          </P>
        )}
        {quan?.stars.some(s => s.name === '天马') && (
          <P>Quan Lộc có Thiên Mã, chủ công việc hay đi lại, biến động, hợp làm việc linh hoạt.</P>
        )}
        {majorStars(quan).length > 0 && (
          <P>
            Hướng gợi ý theo sao chủ Quan Lộc (bảng quy ước sách cổ, chỉ tham khảo):{' '}
            {majorStars(quan).map(s => (
              <span key={s.name} style={{ display: 'block' }}>
                <strong style={{ color: 'var(--t-text)' }}>{VI_STAR[s.name] ?? s.name}</strong>
                {': '}{(CAREER_HINTS[s.name] ?? []).join(' · ') || '—'}
              </span>
            ))}
          </P>
        )}
      </Section>

      <Section title="3 · Tài lộc — cung Tài Bạch">
        <P>
          Cung Tài Bạch:{' '}
          <Stars stars={majorStars(tai)} emptyText="" />
          {majorStars(tai).length === 0 && (
            <span>
              Không có sao chính — cung trống, mượn sao chính cung đối ({viPalace(fuDe)}):{' '}
              <Stars stars={majorStars(fuDe)} emptyText="cung đối cũng trống" />
              . Tiền bạc vì vậy chịu ảnh hưởng nhiều từ cung {viPalace(fuDe)}.
            </span>
          )}
        </P>
        {siHua.filter(({ star }) => star.siHua === '禄').length > 0 && (
          <P>
            Dấu hiệu tụ tài: {' '}
            {siHua.filter(({ star }) => star.siHua === '禄').map(({ star, palace }, i) => (
              <span key={star.name}>
                {i > 0 && ' · '}
                <strong style={{ color: 'var(--t-text)' }}>{VI_STAR[star.name] ?? star.name}</strong>
                {' '}Hóa Lộc tại {viPalace(palace)}
              </span>
            ))}
            .
          </P>
        )}
        {luCun.length > 0 && (
          <P>Lộc Tồn tại {luCun.map(p => viPalace(p)).join(', ')}, chủ có của để dành, giữ được tiền.</P>
        )}
        <P>
          Cung Điền Trạch:{' '}
          <Stars stars={majorStars(dienTrach)} emptyText="Không có sao chính" />
          {' '}— xem cung này để biết về nhà cửa, đất đai.
        </P>
        {tai?.stars.some(s => s.name === '天刑' || s.name === '截空' || s.name === '旬空') && (
          <P>
            Tài Bạch có {tai.stars.filter(s => s.name === '天刑' || s.name === '截空' || s.name === '旬空').map(s => VI_STAR[s.name] ?? s.name).join(', ')},
            chủ tiền bạc cần cẩn trọng giấy tờ, pháp lý, thu nhập có lúc gián đoạn.
          </P>
        )}
      </Section>

      <Section title="4 · Tình duyên — cung Phu Thê">
        <P>
          Cung Phu Thê:{' '}
          <Stars stars={majorStars(phu)} emptyText="Không có sao chính — cung trống" />
          {phu?.isEmpty && phu.borrowedStars && phu.borrowedStars.length > 0 && (
            <span>, mượn từ cung đối: {phu.borrowedStars.map(s => VI_STAR[s] ?? s).join(', ')}</span>
          )}
          .
        </P>
        {siHuaAt(phu).length > 0 && (
          <P>
            Tứ Hóa tại Phu Thê:{' '}
            {siHuaAt(phu).map(({ star }, i) => (
              <span key={star.name}>
                {i > 0 && ' · '}
                <strong style={{ color: 'var(--t-text)' }}>{VI_STAR[star.name] ?? star.name}</strong>
                {' '}Hóa {VI_SIHUA[star.siHua!] ?? star.siHua}
              </span>
            ))}
            .
          </P>
        )}
        <P>
          Sao đào hoa: {hongLoan.length > 0 ? `Hồng Loan tại ${hongLoan.map(p => viPalace(p)).join(', ')}` : 'không có Hồng Loan trên lá số'}
          {tianXi.length > 0 ? ` · Thiên Hỉ tại ${tianXi.map(p => viPalace(p)).join(', ')}` : ' · không có Thiên Hỉ trên lá số'}
          {tianYao.length > 0 ? ` · Thiên Diêu tại ${tianYao.map(p => viPalace(p)).join(', ')}` : ''}.
        </P>
        {phu?.stars.some(s => s.name === '陀罗' || s.name === '擎羊') && (
          <P>
            Phu Thê gặp {phu.stars.filter(s => s.name === '陀罗' || s.name === '擎羊').map(s => VI_STAR[s.name] ?? s.name).join(', ')},
            chủ tình cảm cần vun đắp, dễ có sóng gió ngầm, hiểu lầm dai dẳng nếu không nói rõ với nhau.
          </P>
        )}
      </Section>

      <Section title="5 · Thân cư & hậu vận">
        <P>
          Thân cư {viPalace(shenPalace)}:{' '}
          <Stars stars={majorStars(shenPalace)} emptyText="Không có sao chính" />
          .
        </P>
        {shenPalace && SHEN_SENTENCES[shenPalace.name] && (
          <P>{SHEN_SENTENCES[shenPalace.name]}</P>
        )}
      </Section>

      <Section title="6 · Đại vận hiện tại">
        {currentDx ? (
          <>
            <P>
              Đại vận {currentDx.startAge}–{currentDx.endAge} tuổi, tại cung {VI_PALACE[currentDx.palaceName] ?? currentDx.palaceName}
              {currentDxPalace && majorStars(currentDxPalace).length > 0 && (
                <span>
                  , sao chính: <Stars stars={majorStars(currentDxPalace)} emptyText="" />
                </span>
              )}
              .
            </P>
            {currentDx.siHua && (
              <P>
                Tứ Hóa của đại vận này: {VI_STAR[currentDx.siHua.lu] ?? currentDx.siHua.lu} Hóa Lộc
                {palaceOfStar(chart, currentDx.siHua.lu) ? ` tại ${viPalace(palaceOfStar(chart, currentDx.siHua.lu))}` : ''},{' '}
                {VI_STAR[currentDx.siHua.quan] ?? currentDx.siHua.quan} Hóa Quyền
                {palaceOfStar(chart, currentDx.siHua.quan) ? ` tại ${viPalace(palaceOfStar(chart, currentDx.siHua.quan))}` : ''},{' '}
                {VI_STAR[currentDx.siHua.ke] ?? currentDx.siHua.ke} Hóa Khoa
                {palaceOfStar(chart, currentDx.siHua.ke) ? ` tại ${viPalace(palaceOfStar(chart, currentDx.siHua.ke))}` : ''},{' '}
                {VI_STAR[currentDx.siHua.ji] ?? currentDx.siHua.ji} Hóa Kỵ
                {palaceOfStar(chart, currentDx.siHua.ji) ? ` tại ${viPalace(palaceOfStar(chart, currentDx.siHua.ji))}` : ''}.
              </P>
            )}
            {nextDx && (
              <P>
                Đại vận kế tiếp {nextDx.startAge}–{nextDx.endAge} tuổi, tại cung {VI_PALACE[nextDx.palaceName] ?? nextDx.palaceName}.
              </P>
            )}
          </>
        ) : (
          <P style={{ color: 'var(--t-faint)', fontStyle: 'italic' }}>Chưa xác định được đại hạn hiện tại.</P>
        )}
      </Section>

      <Section title={`7 · Lưu niên ${liunianYear} (${lnCanChi})`}>
        <P>
          Năm {liunianYear} là năm {lnCanChi}. Lưu niên Mệnh tại cung {viPalace(lnMingPalace)}
          {lnMingPalace && majorStars(lnMingPalace).length > 0 && (
            <span>
              , sao chính: <Stars stars={majorStars(lnMingPalace)} emptyText="" />
            </span>
          )}
          {lnMingPalace && ming && lnMingPalace.branch === ming.branch && (
            <span> — trùng đúng cung Mệnh gốc, là năm “về lại” chính mình.</span>
          )}
          .
        </P>
        <P>
          Tứ Hóa lưu niên năm {lnCanChi}:{' '}
          {lnPlacements.map(({ sh, starName, palace }, i) => (
            <span key={sh}>
              {i > 0 && ' · '}
              <strong style={{ color: 'var(--t-text)' }}>{VI_STAR[starName] ?? starName}</strong>
              {' '}Hóa {VI_SIHUA[sh] ?? sh}
              {palace ? ` tại ${viPalace(palace)}` : ''}
            </span>
          ))}
          .
        </P>
      </Section>

      <Section title="8 · Cách cục">
        {patterns.length === 0 ? (
          <P style={{ color: 'var(--t-faint)', fontStyle: 'italic' }}>
            Không phát hiện cách cục nào theo ba bảng Định Quý / Định Phú / Định Bần Tiện
            (《Tử Vi Đẩu Số Toàn Thư》卷一, 41 điều đã dịch và kiểm chứng).
          </P>
        ) : (
          patterns.map((p, i) => (
            <P key={i}>
              <strong style={{ color: 'var(--t-text)' }}>{p.name}</strong>
              {' '}· {p.group} #{p.no}
              {p.status === 'disputed' ? ' · Cách đọc còn tranh luận' : ''} — {p.note}
            </P>
          ))
        )}
      </Section>

      <Section title="9 · Điểm cần lưu ý">
        {kyPlacements.length > 0 && (
          <P>
            Hóa Kỵ bản mệnh:{' '}
            {kyPlacements.map(({ star, palace }, i) => (
              <span key={star.name}>
                {i > 0 && ' · '}
                <strong style={{ color: 'var(--t-text)' }}>{VI_STAR[star.name] ?? star.name}</strong>
                {' '}Hóa Kỵ tại {viPalace(palace)}
              </span>
            ))}
            {' '}— cung có Hóa Kỵ là nơi cần thận trọng nhất trên lá số.
          </P>
        )}
        {quanKyPalaces.filter(p => p !== ming).length > 0 && (
          <P>
            Có cung vừa có sao Hóa Quyền vừa có sao Hóa Kỵ:{' '}
            {quanKyPalaces.filter(p => p !== ming).map(p => viPalace(p)).join(', ')} — nơi có quyền
            cũng là nơi dễ sinh thị phi.
          </P>
        )}
        {mingSat.length >= 2 && (
          <P>
            Cung Mệnh có {mingSat.length} sát tinh ({mingSat.map(s => VI_STAR[s.name] ?? s.name).join(', ')}),
            chủ đời nhiều thử thách, cần nhẫn nại và giữ kỷ luật.
          </P>
        )}
        {emptyKeys.length > 0 && (
          <P>
            Cung trống (không có sao chính) trong bốn cung trọng yếu: {emptyKeys.map(x => x.label).join(', ')} —
            luận theo sao chính mượn từ cung đối, xem khung chi tiết cung.
          </P>
        )}
        {kyPlacements.length === 0 && mingSat.length < 2 && emptyKeys.length === 0 && (
          <P style={{ color: 'var(--t-faint)', fontStyle: 'italic' }}>
            Không có điểm nào đặc biệt cần lưu ý theo các quy tắc trên.
          </P>
        )}
      </Section>

      <Section title={`10 · Lưu nguyệt ${liunianYear} — vận từng tháng`}>
        <P>
          Mỗi tháng âm lịch có Can Chi tháng riêng và một cung Lưu nguyệt Mệnh riêng.
          Cung Mệnh tháng tính theo công thức của engine iztro: chi năm lưu niên
          trừ tháng sinh âm lịch, cộng giờ sinh, cộng tháng tính. Tháng nào Mệnh
          tháng trùng cung Mệnh gốc thì tháng đó vận khí “về lại” chính mình.
          {currentLunarMonth !== null && (
            <span> Tháng âm lịch hiện tại: tháng {currentLunarMonth}.</span>
          )}
        </P>
        {liuYueMonths.map((m) => {
          const majors = majorStars(m.mingPalace);
          const isCurrent = currentLunarMonth === m.lunarMonth && !m.isLeap;
          return (
            <P key={`${m.lunarMonth}-${m.isLeap ? 'nhuan' : 'chinh'}`}>
              <strong style={{ color: 'var(--t-text)' }}>
                Tháng {m.lunarMonth}{m.isLeap ? ' nhuận' : ''} ({VI_STEM[STEMS[m.stem]] ?? STEMS[m.stem]} {VI_BRANCH[BRANCHES[m.branch]] ?? BRANCHES[m.branch]})
              </strong>
              {' '}· {m.solarStart}–{m.solarEnd}
              {isCurrent && <span> · tháng này</span>}
              {m.isLeap && <span> · nửa đầu theo tháng chính, nửa sau theo tháng sau</span>}
              <br />
              Mệnh tháng tại {viPalace(m.mingPalace)}
              {m.mingPalace && ming && m.mingBranch === ming.branch && (
                <span> — trùng cung Mệnh gốc</span>
              )}
              {majors.length > 0 ? (
                <span>, sao chính: <Stars stars={majors} emptyText="" /></span>
              ) : (
                <span>, cung trống — luận theo sao chính mượn từ cung đối</span>
              )}
              .
              <br />
              Tứ Hóa tháng:{' '}
              {m.sihua.map(({ kind, star, palace }, i) => (
                <span key={kind}>
                  {i > 0 && ' · '}
                  <strong style={{ color: 'var(--t-text)' }}>{VI_STAR[star] ?? star}</strong>
                  {' '}Hóa {VI_SIHUA[kind] ?? kind}
                  {palace ? ` tại ${viPalace(palace)}` : ''}
                </span>
              ))}
              .
            </P>
          );
        })}
        <P style={{ color: 'var(--t-faint)', fontStyle: 'italic' }}>
          Lưu ý: luận tháng chỉ nói cung nào động và sao nào hóa trong tháng đó;
          cổ thư viết ít về từng tháng nên không có bài luận dài như luận năm.
        </P>
      </Section>

      <div
        className="text-[10px] leading-relaxed pt-3 mt-1"
        style={{ borderTop: '1px solid var(--t-border)', color: 'var(--t-faint)', opacity: 0.75 }}
      >
        Cách đọc bản luận này: mỗi đoạn gồm (1) dữ liệu trích trực tiếp từ lá số đã an — sao, độ sáng,
        Tứ Hóa, đại hạn, lưu niên, lưu nguyệt; (2) câu mẫu cố định theo quy tắc cổ thư, mỗi câu chỉ hiện khi lá số
        có đúng điều kiện đó (ví dụ “Hóa Kỵ tại Mệnh”, “Tài Bạch trống”, “Thân cư Phúc Đức”). Không có
        câu nào do AI tự suy diễn thêm. Bản luận chỉ mang tính tham khảo; bài luận chi tiết từng sao
        từng cung (kho STAR_DB) vẫn đang trống, trừ 1 mục mẫu Tử Vi ở Mệnh.
      </div>
    </div>
  );
}
