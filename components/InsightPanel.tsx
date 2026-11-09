'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ZiweiChart, Palace } from '@/lib/ziwei/types';
import type { TimeView } from './TimeNav';
import { VI_STAR, VI_SIHUA, VI_PALACE } from '@/lib/ziwei/vi-names';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  hidden?: boolean; // don't show user bubble for auto/topic messages
}

interface SelectedSiHua {
  starName: string;
  siHua: string;
  view: TimeView;
}

interface InsightPanelProps {
  chart: ZiweiChart;
  selectedPalace?: Palace | null;
  selectedSiHua?: SelectedSiHua | null;
}

const TOPICS = [
  { key: 'overview',     label: 'Mệnh cách' },
  { key: 'love',        label: 'Tình cảm' },
  { key: 'career',      label: 'Sự nghiệp' },
  { key: 'wealth',      label: 'Tài vận' },
  { key: 'health',      label: 'Sức khỏe' },
  { key: 'personality', label: 'Tính cách' },
] as const;

const TOPIC_PROMPTS: Record<string, string> = {
  overview: `Hãy tạo bản tổng quan mệnh cách, trình bày theo cấu trúc sau:

**【Định tính mệnh cách】**
Một câu khái quát cục diện cốt lõi của lá số và khí chất của mệnh chủ.

**【Đọc sao chính】**
Đặc điểm cốt lõi của sao chính cung Mệnh, trích dẫn lời gốc hoặc quan điểm của Nghê Hải Hạ.

**【Tam phương tứ chính】**
Phân tích liên động của ba cung Tài, Quan, Thiên Di và cục diện tổng thể.

**【Đại hạn hiện tại】**
Hướng vận của đại hạn hiện tại và những điều đáng lưu tâm nhất.

**【Ưu thế và lưu ý】**
Ưu thế thiên phú của lá số, cùng những rủi ro hoặc bài học cần chú ý.`,

  love: `Hãy phân tích chuyên sâu vận tình cảm hôn nhân, trình bày theo cấu trúc sau:

**【Cục diện tình cảm】**
Một câu định tính mệnh cách tình cảm.

**【Phân tích cung Phu Thê】**
Sao chính cung Phu Thê, Tứ Hóa, cùng luận giải cụ thể theo hệ Nghê Hải Hạ.

**【Liên động tam phương】**
Ảnh hưởng của các cung liên quan đến tình cảm.

**【Vận tình cảm đại hạn hiện tại】**
Hướng đi tình cảm 10 năm hiện tại và những nút thắt quan trọng.

**【Gợi ý thực tế】**
Gợi ý tình cảm cụ thể, khả thi.`,

  career: `Hãy phân tích chuyên sâu vận sự nghiệp, trình bày theo cấu trúc sau:

**【Cục diện sự nghiệp】**
Một câu định tính mệnh cách sự nghiệp: hợp làm thuê hay hợp khởi nghiệp.

**【Phân tích cung Quan Lộc】**
Sao chính cung Quan Lộc, Tứ Hóa, cùng nhận định của thầy Nghê về cách cục này.

**【Liên động cung Tài Bạch】**
Quan hệ giữa tài vận và sự nghiệp, phân tích nguồn tài lộ.

**【Vận sự nghiệp đại hạn hiện tại】**
Hướng đi sự nghiệp 10 năm hiện tại.

**【Gợi ý thực tế】**
Hướng đi, ngành nghề và chiến lược phù hợp.`,

  wealth: `Hãy phân tích chuyên sâu tài vận, trình bày theo cấu trúc sau:

**【Cục diện tài vận】**
Một câu định tính kiểu tài vận: tài chủ động hay tài bị động.

**【Phân tích cung Tài Bạch】**
Sao chính cung Tài Bạch, Tứ Hóa, nguồn gốc tài phú và kiểu lưu chuyển.

**【Cung Điền Trạch (kho tài)】**
Phân tích khả năng tích lũy và vận bất động sản.

**【Tài vận đại hạn hiện tại】**
Hướng đi tài vận hiện tại và những điều cần lưu ý.

**【Gợi ý quản lý tài chính】**
Gợi ý tài chính cụ thể.`,

  health: `Hãy phân tích vận sức khỏe, trình bày theo cấu trúc sau:

**【Sao chính cung Tật Ách】**
Sao ở cung Tật Ách và ý nghĩa sức khỏe.

**【Rủi ro chính】**
Kết hợp lý luận Tý Ngọ lưu chú của Nghê Hải Hạ, phân tích những nguy cơ sức khỏe chính và bộ phận cần lưu tâm.

**【Xu hướng sức khỏe đại hạn】**
Xu hướng sức khỏe hiện tại và những khoảng thời gian then chốt.

**【Gợi ý phòng ngừa】**
Lưu ý cụ thể và hướng dưỡng sinh.`,

  personality: `Hãy phân tích chuyên sâu đặc điểm tính cách, trình bày theo cấu trúc sau:

**【Tính cách sao chính cung Mệnh】**
Đặc điểm tính cách cốt lõi của sao chính cung Mệnh, trích dẫn lời gốc của thầy Nghê.

**【Tính cách tổng hợp tam phương】**
Ảnh hưởng của ba cung Tài, Quan, Thiên Di đến tính cách, phác họa toàn cảnh.

**【Kiểu quan hệ với người khác】**
Cách tương tác với người khác, phong cách đối nhân xử thế.

**【Ưu thế và bài học đời người】**
Ưu thế thiên phú, cùng những bài học đời người cần đối mặt.`,
};

const PALACE_ROLES: Record<string, string> = {
  '命宫':   'Bản thân, tính cách, cục diện tiên thiên',
  '兄弟宫': 'Quan hệ anh em, đối tác',
  '夫妻宫': 'Quan hệ tình cảm, tình trạng hôn nhân',
  '子女宫': 'Duyên con cái, quan hệ cấp dưới',
  '财帛宫': 'Nguồn tài vận, cách thu nhập',
  '疾厄宫': 'Sức khỏe, tai nạn bất ngờ',
  '迁移宫': 'Cơ hội khi ra ngoài, cục diện quan hệ',
  '交友宫': 'Vòng bạn bè, quý nhân, tiểu nhân',
  '官禄宫': 'Thành tựu sự nghiệp, địa vị xã hội',
  '田宅宫': 'Bất động sản, môi trường gia đình',
  '福德宫': 'Hưởng thụ tinh thần, phúc phần nội tâm',
  '父母宫': 'Quan hệ cha mẹ, văn thư khế ước',
};

/** Render AI markdown: **【Title】** → gold header, **bold** → strong */
function AiContent({ text, streaming }: { text: string; streaming?: boolean }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        const sectionMatch = line.match(/^\*\*【(.+?)】\*\*$/);
        if (sectionMatch) {
          return (
            <div key={i} className="pt-3 pb-0.5 first:pt-0">
              <span className="text-[11px] font-semibold tracking-wide" style={{ color: 'var(--t-gold)' }}>
                【{sectionMatch[1]}】
              </span>
            </div>
          );
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        const parts = line.split(/\*\*(.+?)\*\*/);
        return (
          <div key={i} className="text-[11px] leading-relaxed" style={{ color: 'var(--t-text2)' }}>
            {parts.map((part, j) =>
              j % 2 === 0
                ? part
                : <strong key={j} className="font-medium" style={{ color: 'var(--t-text)' }}>{part}</strong>
            )}
          </div>
        );
      })}
      {streaming && (
        <span
          className="inline-block w-1.5 h-3 ml-0.5 animate-pulse rounded-sm align-middle"
          style={{ background: 'var(--t-gold)', opacity: 0.6 }}
        />
      )}
    </div>
  );
}

export default function InsightPanel({ chart, selectedPalace, selectedSiHua }: InsightPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string>('overview');
  const messagesRef = useRef<Message[]>([]); // always-current copy for closures
  const loadingRef = useRef(false);
  const autoLoaded = useRef(false);
  const lastPalaceBranch = useRef<number | undefined>(undefined);
  const lastSiHuaKey = useRef<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep refs in sync
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-generate 命格总览 on mount
  useEffect(() => {
    if (autoLoaded.current) return;
    autoLoaded.current = true;
    sendMessage(TOPIC_PROMPTS.overview, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Inject palace analysis when palace selected
  useEffect(() => {
    if (!selectedPalace || selectedPalace.branch === lastPalaceBranch.current) return;
    lastPalaceBranch.current = selectedPalace.branch;

    const majorStars = selectedPalace.stars.filter(s => s.type === 'major');
    const starDesc = majorStars.length > 0
      ? majorStars.map(s => `${VI_STAR[s.name] ?? s.name}${s.siHua ? ' hóa ' + (VI_SIHUA[s.siHua] ?? s.siHua) : ''}`).join('、')
      : 'Cung trống (mượn cung đối)';
    const role = PALACE_ROLES[selectedPalace.name] ?? '';

    const prompt = `Hãy phân tích trọng điểm 【${VI_PALACE[selectedPalace.name] ?? selectedPalace.name}】 (chủ quản: ${role}), sao chính của cung này là ${starDesc}, trình bày theo cấu trúc sau:

**【Định tính cung】**
Ý nghĩa của ${VI_PALACE[selectedPalace.name] ?? selectedPalace.name} trong lá số, cùng nhận định tổng thể về cách bố trí sao này.

**【Đọc sao chính】**
Luận giải sao chính tại cung này theo hệ Nghê Hải Hạ, trích dẫn quan điểm cụ thể.

**【Liên động tam phương tứ chính】**
Ảnh hưởng của các cung tam phương tứ chính đến cung này.

**【Gợi ý thực tế】**
Gợi ý cụ thể dựa trên cung này.`;

    sendMessage(prompt, true);
  }, [selectedPalace]); // eslint-disable-line react-hooks/exhaustive-deps

  // 注入四化飞化分析
  useEffect(() => {
    if (!selectedSiHua) return;
    const key = `${selectedSiHua.starName}-${selectedSiHua.siHua}-${selectedSiHua.view}`;
    if (key === lastSiHuaKey.current) return;
    lastSiHuaKey.current = key;

    // 找出该星所在宫位
    const palaceOfStar = chart.palaces.find(p =>
      p.stars.some(s => s.name === selectedSiHua.starName)
    );
    const palaceName = palaceOfStar?.name ?? 'Cung chưa rõ';
    const viewLabel = selectedSiHua.view === 'daxian' ? 'Đại hạn' : 'Lưu niên';

    const prompt = `Hãy phân tích ảnh hưởng phi hóa của 【${viewLabel} ${VI_STAR[selectedSiHua.starName] ?? selectedSiHua.starName} hóa ${VI_SIHUA[selectedSiHua.siHua] ?? selectedSiHua.siHua}】, trình bày theo cấu trúc sau:

**【Ý nghĩa cơ bản của Hóa ${VI_SIHUA[selectedSiHua.siHua] ?? selectedSiHua.siHua}】**
Ý nghĩa cốt lõi của Hóa ${VI_SIHUA[selectedSiHua.siHua] ?? selectedSiHua.siHua} trong hệ Nghê Hải Hạ, cùng ý nghĩa đặc biệt của ${VI_STAR[selectedSiHua.starName] ?? selectedSiHua.starName} hóa ${VI_SIHUA[selectedSiHua.siHua] ?? selectedSiHua.siHua}.

**【Ảnh hưởng khi nhập cung】**
${VI_STAR[selectedSiHua.starName] ?? selectedSiHua.starName} hóa ${VI_SIHUA[selectedSiHua.siHua] ?? selectedSiHua.siHua} rơi vào 【${VI_PALACE[palaceName] ?? palaceName}】, lĩnh vực do cung này chủ quản chịu ảnh hưởng ra sao, thầy Nghê luận thế nào.

**【Đường phi hóa tam phương tứ chính】**
Hóa ${VI_SIHUA[selectedSiHua.siHua] ?? selectedSiHua.siHua} nhập ${VI_PALACE[palaceName] ?? palaceName} rồi tác động liên động đến tam phương tứ chính của nó (cung đối, hai cung tam hợp).

**【Ảnh hưởng vận hiện tại】**
Trong chiều thời gian ${viewLabel}, Hóa ${VI_SIHUA[selectedSiHua.siHua] ?? selectedSiHua.siHua} này ảnh hưởng cụ thể ra sao đến vận gần đây của mệnh chủ.

**【Gợi ý thực tế】**
Gợi ý cụ thể, có thể thực hiện được, dựa trên Tứ Hóa này.`;

    sendMessage(prompt, true);
  }, [selectedSiHua]); // eslint-disable-line react-hooks/exhaustive-deps

  const streamResponse = async (apiMessages: { role: 'user' | 'assistant'; content: string }[]) => {
    try {
      const res = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart, messages: apiMessages }),
      });
      if (res.status === 404) throw new Error('api-missing');
      if (!res.ok) throw new Error('Yêu cầu thất bại');
      if (!res.body) throw new Error('Không có luồng phản hồi');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const delta = JSON.parse(data).delta?.text ?? '';
            assistantText += delta;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'assistant', content: assistantText };
              return updated;
            });
          } catch { /* skip */ }
        }
      }
    } catch (e) {
      const missing = e instanceof Error && e.message === 'api-missing';
      setMessages(prev => [...prev, { role: 'assistant', content: missing ? 'Bản mã nguồn mở không có giao diện AI đọc giải (/api/interpret), bạn cần tự triển khai mới dùng được, xem README mục "Bắt đầu nhanh". Bản thân việc lập lá số không cần bất kỳ API Key nào.' : 'Đọc giải thất bại, xin thử lại sau.' }]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const sendMessage = (text: string, hidden = false) => {
    if (!text.trim() || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const userMsg: Message = { role: 'user', content: text, hidden };
    // Capture current messages synchronously via ref (avoids stale closure)
    const apiMessages = [...messagesRef.current, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    streamResponse(apiMessages);
  };

  const handleTopicClick = (topicKey: string) => {
    if (loadingRef.current) return;
    setActiveTopic(topicKey);
    sendMessage(TOPIC_PROMPTS[topicKey], true);
  };

  const handleSend = () => {
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden card-glass">

      {/* ── Topic buttons ── */}
      <div className="flex-shrink-0 px-2 pt-2.5 pb-2" style={{ borderBottom: '1px solid var(--t-border)' }}>
        <div className="grid grid-cols-6 gap-1">
          {TOPICS.map(t => {
            const isActive = activeTopic === t.key;
            return (
              <button
                key={t.key}
                onClick={() => handleTopicClick(t.key)}
                disabled={loading}
                className="py-1.5 text-[10px] font-medium rounded-lg transition-all duration-150 disabled:opacity-40"
                style={{
                  background: isActive ? 'rgba(212,168,67,0.12)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(212,168,67,0.3)' : 'var(--t-border)'}`,
                  color: isActive ? 'var(--t-gold)' : 'var(--t-faint)',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">

        {/* Loading state before first message */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3" style={{ color: 'var(--t-gold)', opacity: 0.1 }}>✦</div>
            <p className="text-[10px] animate-pulse" style={{ color: 'var(--t-faint)' }}>Đang tạo bản đọc mệnh cách…</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            if (msg.role === 'user' && msg.hidden) return null;

            if (msg.role === 'user') {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                  <div
                    className="max-w-[85%] rounded-xl px-3 py-2 text-[11px]"
                    style={{
                      background: 'rgba(212,168,67,0.08)',
                      border: '1px solid rgba(212,168,67,0.18)',
                      color: 'var(--t-gold)',
                    }}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              );
            }

            // Assistant message
            const isLastMsg = i === messages.length - 1;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className="text-[9px] tracking-widest mb-2 flex items-center gap-1.5"
                  style={{ color: 'var(--t-faint)' }}
                >
                  <span style={{ color: 'var(--t-gold)', opacity: 0.4 }}>✦</span>
                  Đọc giải mệnh lý
                </div>
                <AiContent text={msg.content} streaming={loading && isLastMsg} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0 px-3 pb-3 pt-2" style={{ borderTop: '1px solid var(--t-border)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Hỏi tiếp, ví dụ: năm nay có nên đổi việc không?"
            disabled={loading}
            className="flex-1 rounded-lg px-3 py-2 text-[11px] focus:outline-none transition-colors"
            style={{
              background: 'var(--t-card)',
              border: '1px solid var(--t-border)',
              color: 'var(--t-text)',
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-3 py-2 rounded-lg text-[11px] font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(212,168,67,0.15)',
              border: '1px solid rgba(212,168,67,0.25)',
              color: 'var(--t-gold)',
            }}
          >
            {loading ? '…' : 'Hỏi tiếp'}
          </button>
        </div>
      </div>

    </div>
  );
}
