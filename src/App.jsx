import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, Moon, Star, ArrowRight, RotateCcw, Loader2, Zap, BrainCircuit, TextQuote, History, Calendar, User, X, Globe, Heart, MessageCircle, Share2, Send } from 'lucide-react';

// --- API 配置 ---
// 我们通过环境变量读取 Key，这样更安全
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 

// --- 动画曲线配置 ---
const EASE_APPLE = "cubic-bezier(0.25, 0.1, 0.25, 1)";
const EASE_ELASTIC = "cubic-bezier(0.34, 1.56, 0.64, 1)";

// --- 数据配置 ---
const TAROT_DECK = [
  { id: 0, name: "愚者", nameEn: "The Fool", roman: "0", keywords: ["新的开始", "冒险", "纯真"], color: "from-yellow-100 to-amber-200", 
    meaning: "现在的你正站在悬崖边，准备通过信心的一跃进入未知。保持开放的心态。", 
    meaningRev: "鲁莽的冒险，或者因为恐惧而不敢踏出第一步。注意脚下的路。" },
  { id: 1, name: "魔术师", nameEn: "The Magician", roman: "I", keywords: ["创造力", "显化", "意志力"], color: "from-rose-400 to-orange-300", 
    meaning: "你拥有实现目标所需的所有工具。现在是将想法转化为现实的最佳时机。", 
    meaningRev: "才华被浪费，或者是被谎言和欺骗蒙蔽了双眼。由于缺乏计划而导致失败。" },
  { id: 2, name: "女祭司", nameEn: "The High Priestess", roman: "II", keywords: ["直觉", "神秘", "潜意识"], color: "from-indigo-300 to-blue-500", 
    meaning: "倾听你内心的声音。答案不在外面的世界，而在你深邃的内心深处。", 
    meaningRev: "忽视直觉，被表象迷惑。或许你正在逃避内心真实的感受。" },
  { id: 3, name: "女皇", nameEn: "The Empress", roman: "III", keywords: ["丰饶", "自然", "母性"], color: "from-emerald-300 to-teal-400", 
    meaning: "这是一个孕育和成长的时期。拥抱感官的享受，通过爱和美来滋养自己。", 
    meaningRev: "过度依赖他人，或者在感情中过于窒息。注意创造力的枯竭。" },
  { id: 4, name: "皇帝", nameEn: "The Emperor", roman: "IV", keywords: ["权威", "结构", "稳固"], color: "from-red-500 to-red-700", 
    meaning: "运用逻辑和纪律来建立秩序。现在需要的是坚定的领导力和清晰的界限。", 
    meaningRev: "固执己见，滥用权威，或者是缺乏自律导致的生活混乱。" },
  { id: 5, name: "教皇", nameEn: "The Hierophant", roman: "V", keywords: ["传统", "信仰", "学习"], color: "from-amber-500 to-orange-600", 
    meaning: "尊重传统智慧或寻求导师的指引。有时遵循既定的道路是通往智慧的捷径。", 
    meaningRev: "打破常规，挑战传统观念。这可能是一次叛逆的觉醒，也可能是盲从邪教。" },
  { id: 6, name: "恋人", nameEn: "The Lovers", roman: "VI", keywords: ["爱", "和谐", "选择"], color: "from-pink-300 to-rose-400", 
    meaning: "面临重要的道德或情感抉择。寻找那个能让你感到完整的另一半或价值观。", 
    meaningRev: "关系的不和谐，错误的选择，或者逃避责任。注意诱惑。" },
  { id: 7, name: "战车", nameEn: "The Chariot", roman: "VII", keywords: ["胜利", "决心", "行动"], color: "from-slate-300 to-slate-500", 
    meaning: "通过意志力克服障碍。不要放弃，胜利就在前方，但这需要你紧握缰绳。", 
    meaningRev: "失去控制，被情绪冲昏头脑。野心过大而导致翻车。" },
  { id: 8, name: "力量", nameEn: "Strength", roman: "VIII", keywords: ["勇气", "耐心", "同情"], color: "from-orange-200 to-amber-400", 
    meaning: "真正的力量不是蛮力，而是温柔的坚持。用耐心驯服内心的恐惧。", 
    meaningRev: "自我怀疑，软弱，或者被本能欲望所控制。需要找回内心的自信。" },
  { id: 9, name: "隐士", nameEn: "The Hermit", roman: "IX", keywords: ["内省", "孤独", "指引"], color: "from-violet-800 to-slate-800", 
    meaning: "暂时从喧嚣中撤退。在独处中，你会找到那盏照亮前路的的明灯。", 
    meaningRev: "过度的孤立，或者拒绝他人的帮助。在黑暗中迷失了方向。" },
  { id: 10, name: "命运之轮", nameEn: "Wheel of Fortune", roman: "X", keywords: ["循环", "命运", "转折点"], color: "from-cyan-500 to-blue-600", 
    meaning: "生活充满了起伏。接受变化，因为它是不可避免的。好运即将到来。", 
    meaningRev: "运势的低谷，或者是抗拒改变。坏运气只是暂时的循环。" },
  { id: 11, name: "正义", nameEn: "Justice", roman: "XI", keywords: ["公平", "真理", "因果"], color: "from-teal-500 to-emerald-600", 
    meaning: "客观地看待事实。你的每一个行动都有后果，现在是寻求平衡的时刻。", 
    meaningRev: "不公平的待遇，或者在逃避责任。需要诚实面对自己的错误。" },
  { id: 12, name: "倒吊人", nameEn: "The Hanged Man", roman: "XII", keywords: ["牺牲", "新视角", "等待"], color: "from-sky-300 to-indigo-400", 
    meaning: "换个角度看世界。有时候，暂停和放手是获得新领悟的唯一途径。", 
    meaningRev: "无谓的牺牲，或者是顽固不化。停滞不前让你感到痛苦。" },
  { id: 13, name: "死神", nameEn: "Death", roman: "XIII", keywords: ["结束", "转变", "重生"], color: "from-slate-800 to-black", 
    meaning: "不要害怕结束。它只是为新事物的诞生腾出空间。彻底的蜕变正在发生。", 
    meaningRev: "抗拒改变，沉溺于过去。无法放手只会延长痛苦。" },
  { id: 14, name: "节制", nameEn: "Temperance", roman: "XIV", keywords: ["平衡", "适度", "治愈"], color: "from-blue-200 to-rose-200", 
    meaning: "寻找中庸之道。将对立的力量融合在一起，创造出和谐的新事物。", 
    meaningRev: "失衡，极端，或者是缺乏耐心。需要重新调整生活的节奏。" },
  { id: 15, name: "恶魔", nameEn: "The Devil", roman: "XV", keywords: ["束缚", "物质", "诱惑"], color: "from-red-900 to-slate-900", 
    meaning: "审视那些让你感到被困住的习惯或欲望。打破锁链的钥匙其实就在你手中。", 
    meaningRev: "从束缚中解脱，打破成瘾的习惯。开始意识到真正的问题所在。" },
  { id: 16, name: "高塔", nameEn: "The Tower", roman: "XVI", keywords: ["突变", "混乱", "觉醒"], color: "from-orange-600 to-red-600", 
    meaning: "建立在虚假基础上的事物将会崩塌。虽然痛苦，但这将带来必要的启示和自由。", 
    meaningRev: "勉强维持现状，或者是一场灾难被侥幸避免。但根本问题仍未解决。" },
  { id: 17, name: "星星", nameEn: "The Star", roman: "XVII", keywords: ["希望", "灵感", "宁静"], color: "from-cyan-300 to-blue-400", 
    meaning: "风暴过后的平静。跟随你的北极星，保持信心，未来充满希望。", 
    meaningRev: "失去希望，感到沮丧。需要重新寻找内心的光芒。" },
  { id: 18, name: "月亮", nameEn: "The Moon", roman: "XVIII", keywords: ["幻觉", "恐惧", "潜意识"], color: "from-indigo-300 to-purple-400", 
    meaning: "事物并非表象那样。在迷雾中前行要小心，相信你的直觉而非眼睛。", 
    meaningRev: "迷雾散去，真相大白。或者是因为恐惧而产生了过度的焦虑。" },
  { id: 19, name: "太阳", nameEn: "The Sun", roman: "XIX", keywords: ["快乐", "成功", "活力"], color: "from-amber-200 to-yellow-400", 
    meaning: "无需多言的快乐和成功。一切都暴露在阳光下，享受这温暖的时刻。", 
    meaningRev: "暂时的乌云遮日，或者是过度乐观导致的盲目。成功可能会延迟。" },
  { id: 20, name: "审判", nameEn: "Judgement", roman: "XX", keywords: ["重生", "召唤", "宽恕"], color: "from-slate-400 to-stone-300", 
    meaning: "过去的业力已结。听从内心的召唤，做出决定，迈向新的生命阶段。", 
    meaningRev: "自我怀疑，无法原谅自己。忽视了改变的召唤。" },
  { id: 21, name: "世界", nameEn: "The World", roman: "XXI", keywords: ["完成", "整合", "成就"], color: "from-emerald-400 to-blue-500", 
    meaning: "一个周期的完美结束。你已经到达了目的地，享受这份圆满和成就感。", 
    meaningRev: "未完成的旅程，缺乏收尾。感觉还有什么是缺失的。" },
];

const POSITIONS = [
  { title: "过去", desc: "The Past" },
  { title: "现在", desc: "The Present" },
  { title: "未来", desc: "The Future" }
];

const SPREADS = {
  THREE_CARD: { id: 'three', name: "时空流转", count: 3, desc: "探索过去、现在与未来", positions: ["过去", "现在", "未来"] },
  DAILY: { id: 'daily', name: "每日指引", count: 1, desc: "获取今日的核心能量", positions: ["今日指引"] }
};

// --- 模拟社区数据 ---
const INITIAL_SOCIAL_FEED = [
  { id: 101, user: "迷途的猫", avatarColor: "bg-purple-500", time: "5分钟前", question: "最近工作压力很大，想知道该不该辞职...", spread: "three", likes: 12, comments: 3, cards: [TAROT_DECK[9], TAROT_DECK[16], TAROT_DECK[0]] },
  { id: 102, user: "StarGazer", avatarColor: "bg-blue-500", time: "12分钟前", question: "今日运势", spread: "daily", likes: 45, comments: 8, cards: [TAROT_DECK[19]] },
  { id: 103, user: "匿名旅人", avatarColor: "bg-indigo-500", time: "30分钟前", question: "和他的关系会如何发展？", spread: "three", likes: 2, comments: 0, cards: [TAROT_DECK[6], TAROT_DECK[15], TAROT_DECK[2]] },
];

// --- 魔法光标 ---
const MagicCursor = () => {
  const [trail, setTrail] = useState([]);
  useEffect(() => {
    const handleMouseMove = (e) => {
      const newPoint = { x: e.clientX, y: e.clientY, id: Date.now() };
      setTrail((prev) => [...prev, newPoint].slice(-25));
    };
    const interval = setInterval(() => {
        const now = Date.now();
        setTrail(prev => prev.filter(p => now - p.id < 500));
    }, 20);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        clearInterval(interval);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-[100]">
      {trail.map((point) => {
        const age = Date.now() - point.id;
        const life = Math.max(0, 1 - age / 500);
        return (
          <div key={point.id} className="absolute rounded-full bg-white mix-blend-overlay blur-[1px]"
            style={{ left: point.x, top: point.y, width: `${life * 8}px`, height: `${life * 8}px`, opacity: life * 0.6, transform: 'translate(-50%, -50%)', boxShadow: `0 0 ${life * 10}px rgba(200, 220, 255, 0.8)` }}
          />
        );
      })}
    </div>
  );
};

// --- 塔罗牌组件 ---
const TarotCard = ({ card, isRevealed, onClick, style, className = "", isReversed = false }) => {
  return (
    <div className={`relative cursor-pointer transition-all ${className}`} onClick={onClick} style={{ perspective: '1200px', transformStyle: 'preserve-3d', ...style }}>
      <div className={`w-full h-full relative transition-all duration-1000 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-xl ${isRevealed ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d', transitionTimingFunction: EASE_APPLE }}>
        {/* 背面 */}
        <div className="absolute w-full h-full backface-hidden rounded-xl bg-[#0f172a] overflow-hidden flex flex-col items-center justify-center group shadow-inner border border-slate-700/50">
            <div className="absolute inset-[6px] border-[1px] border-[#94a3b8] opacity-30 rounded-lg z-10"></div>
            <div className="absolute inset-[10px] border-[1px] border-[#fbbf24] opacity-20 rounded-lg z-10"></div>
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black"></div>
            <div className="relative z-20 w-24 h-24 flex items-center justify-center">
                 <div className="absolute inset-0 border border-indigo-400/20 rounded-full animate-spin-slow"></div>
                 <div className="absolute inset-2 border border-amber-200/10 rounded-full rotate-45"></div>
                 <Moon className="text-indigo-200/40 w-10 h-10 drop-shadow-[0_0_10px_rgba(165,180,252,0.3)]" />
                 <Star className="absolute -top-4 text-amber-100/30 w-4 h-4" />
                 <Star className="absolute -bottom-4 text-amber-100/30 w-4 h-4" />
            </div>
        </div>
        {/* 正面 */}
        <div className="absolute w-full h-full backface-hidden rounded-xl bg-[#e2e8f0] rotate-y-180 overflow-hidden flex flex-col shadow-inner" style={{ backfaceVisibility: 'hidden' }}>
          {card ? (
            <div className={`w-full h-full flex flex-col ${isReversed ? 'rotate-180' : ''} relative`}>
              <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply z-30 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
              <div className="absolute inset-0 border-[6px] border-[#cbd5e1] z-20 pointer-events-none"></div>
              <div className="absolute inset-[6px] border-[1px] border-[#94a3b8] z-20 pointer-events-none opacity-50"></div>
              <div className={`h-[72%] w-full bg-gradient-to-b ${card.color} relative p-4 flex flex-col items-center justify-center overflow-hidden`}>
                 <div className="absolute inset-0 bg-white/20 mix-blend-soft-light"></div>
                 <span className="text-7xl font-serif text-white/90 drop-shadow-md mix-blend-overlay tracking-tighter scale-y-110 opacity-90">{card.roman}</span>
                 <div className="absolute bottom-4 w-12 h-[1px] bg-white/40"></div>
              </div>
              <div className="h-[28%] bg-[#f1f5f9] flex flex-col items-center justify-center p-3 text-center relative z-10">
                 <h3 className="text-base font-bold text-slate-800 font-serif tracking-wide">{card.name}</h3>
                 <p className="text-[9px] text-slate-400 tracking-[0.2em] uppercase mt-1 font-medium">{card.nameEn}</p>
                 {isReversed && (
                   <div className="absolute top-2 right-2 flex items-center gap-1 opacity-60">
                     <RotateCcw className="w-3 h-3 text-red-800"/>
                   </div>
                 )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// --- 社交大厅 (Astral Hall) ---
const SocialHall = ({ isOpen, onClose }) => {
  const [feed, setFeed] = useState(INITIAL_SOCIAL_FEED);
  
  const handleLike = (id) => {
    setFeed(prev => prev.map(post => {
      if (post.id === id) {
        return { ...post, likes: post.likes + 1, liked: true };
      }
      return post;
    }));
  };

  useEffect(() => {
    const handleNewPost = (e) => {
      setFeed(prev => [e.detail, ...prev]);
    };
    window.addEventListener('astral-post', handleNewPost);
    return () => window.removeEventListener('astral-post', handleNewPost);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#02040a] overflow-hidden animate-fade-in flex flex-col">
       <div className="bg-[#0f111a] border-b border-white/10 p-4 flex justify-between items-center z-10 shadow-xl">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Globe className="w-5 h-5 text-indigo-400" />
             </div>
             <div>
               <h2 className="text-white font-serif text-lg tracking-wide">星界大厅</h2>
               <p className="text-[10px] text-slate-500 uppercase tracking-widest">Astral Hall · Community</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
             <X className="w-6 h-6" />
          </button>
       </div>

       <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
             <div className="text-center mb-8">
                <p className="text-indigo-200/60 text-sm font-light italic">"我们在星辰的倒影中，看见彼此的命运。"</p>
             </div>

             <div className="space-y-6">
                {feed.map((post) => (
                   <div key={post.id} className="bg-[#0a0a12] border border-white/5 rounded-2xl p-5 md:p-6 shadow-lg hover:border-indigo-500/20 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${post.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-inner`}>
                               {post.user[0]}
                            </div>
                            <div>
                               <h3 className="text-slate-200 font-medium text-sm">{post.user}</h3>
                               <p className="text-[10px] text-slate-500">{post.time} · {SPREADS[post.spread === 'three' ? 'THREE_CARD' : 'DAILY'].name}</p>
                            </div>
                         </div>
                         <button className="text-slate-600 hover:text-white transition-colors">
                            <Share2 className="w-4 h-4" />
                         </button>
                      </div>

                      <div className="mb-4 pl-13">
                         <h4 className="text-white font-serif text-lg mb-4 italic">"{post.question}"</h4>
                         
                         <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {post.cards.map((card, i) => (
                               <div key={i} className="flex flex-col items-center gap-2 min-w-[60px]">
                                  <div className={`w-14 h-24 rounded border border-white/10 bg-gradient-to-br ${card.color} shadow-md relative overflow-hidden group-hover:scale-105 transition-transform duration-500`}>
                                     {card.isReversed && <div className="absolute inset-0 bg-black/20"></div>}
                                     <div className="absolute bottom-1 right-1 text-[8px] font-bold opacity-50 text-black mix-blend-overlay">{card.roman}</div>
                                  </div>
                                  <span className="text-[9px] text-slate-400 text-center w-16 truncate">
                                    {card.name}{card.isReversed && '(逆)'}
                                  </span>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="flex items-center gap-6 border-t border-white/5 pt-4 mt-2">
                         <button 
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-2 text-xs transition-all ${post.liked ? 'text-pink-400' : 'text-slate-500 hover:text-pink-300'}`}
                         >
                            <Heart className={`w-4 h-4 ${post.liked ? 'fill-pink-400 animate-pulse' : ''}`} />
                            {post.liked ? '已发送祝福' : '发送能量'} ({post.likes})
                         </button>
                         <button className="flex items-center gap-2 text-xs text-slate-500 hover:text-indigo-300 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            共鸣 ({post.comments})
                         </button>
                      </div>
                   </div>
                ))}
             </div>
             <div className="text-center mt-12 text-slate-600 text-xs">
                没有更多回响了...
             </div>
          </div>
       </div>
    </div>
  );
};

// --- 本命牌计算器模态框 ---
const SoulCardModal = ({ onClose }) => {
  const [birthDate, setBirthDate] = useState('');
  const [soulCard, setSoulCard] = useState(null);

  const calculateSoulCard = () => {
    if (!birthDate) return;
    const digits = birthDate.replace(/-/g, '').split('').map(Number);
    let sum = digits.reduce((a, b) => a + b, 0);
    while (sum > 21) {
      sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
    }
    const foundCard = TAROT_DECK.find(c => c.id === sum) || TAROT_DECK[0];
    setSoulCard(foundCard);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-[#0f111a] border border-indigo-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X className="w-5 h-5"/></button>
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-indigo-900/30 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
             <User className="w-8 h-8 text-indigo-300" />
          </div>
          <h3 className="text-2xl font-serif text-white mb-2">本命牌计算器</h3>
          <p className="text-slate-400 text-sm mb-8">输入你的出生日期，揭示你的灵魂原型</p>
          {!soulCard ? (
            <div className="w-full space-y-6">
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-center focus:border-indigo-500 outline-none" />
              <button onClick={calculateSoulCard} disabled={!birthDate} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors">揭示命运</button>
            </div>
          ) : (
            <div className="animate-slide-up flex flex-col items-center">
               <p className="text-indigo-300 text-xs tracking-widest uppercase mb-4">YOUR SOUL CARD</p>
               <TarotCard card={soulCard} isRevealed={true} isSelectable={false} className="w-40 h-64 mb-6 shadow-xl" />
               <h4 className="text-xl font-serif text-white mb-2">{soulCard.name}</h4>
               <p className="text-slate-400 text-sm">{soulCard.keywords.join(' · ')}</p>
               <button onClick={() => setSoulCard(null)} className="mt-6 text-xs text-slate-500 hover:text-white underline">重新计算</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 历史记录侧边栏 ---
const HistoryPanel = ({ history, isOpen, onClose, onLoadReading }) => {
  return (
    <div className={`fixed inset-y-0 right-0 z-[60] w-full max-w-sm bg-[#0a0a12] border-l border-white/10 shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-serif text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400"/> 命运日志
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {history.length === 0 ? (
            <div className="text-center text-slate-600 mt-20"><History className="w-12 h-12 mx-auto mb-4 opacity-20"/><p className="text-sm">暂无记录</p></div>
          ) : (
            history.map((record) => (
              <div key={record.timestamp} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer group" onClick={() => onLoadReading(record)}>
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[10px] text-slate-500 uppercase tracking-wider">{new Date(record.timestamp).toLocaleDateString()}</span>
                   <span className="text-[10px] bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">{SPREADS[Object.keys(SPREADS).find(k => SPREADS[k].id === record.spreadId)]?.name || '未知牌阵'}</span>
                </div>
                <h4 className="text-slate-200 font-serif text-sm mb-3 line-clamp-2 group-hover:text-white transition-colors">"{record.question || '每日指引'}"</h4>
                <div className="flex gap-2">
                  {record.cards.map((c, i) => <div key={i} className={`w-8 h-12 rounded bg-gradient-to-br ${c.color} opacity-80`}></div>)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- 主应用组件 ---
export default function TarotApp() {
  const [gameState, setGameState] = useState('intro'); 
  const [question, setQuestion] = useState('');
  const [spreadType, setSpreadType] = useState('three'); 
  const [deck, setDeck] = useState([]); 
  const [selectedCards, setSelectedCards] = useState([]); 
  const [revealedIndices, setRevealedIndices] = useState([]); 
  const [readingMode, setReadingMode] = useState(null); 
  const [aiReading, setAiReading] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [basicReadingSummary, setBasicReadingSummary] = useState(null); 
  const [hoveredCardIndex, setHoveredCardIndex] = useState(null);
  const [showSoulCard, setShowSoulCard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [history, setHistory] = useState([]);
  const [isSharing, setIsSharing] = useState(false); 

  useEffect(() => {
    const saved = localStorage.getItem('tarot_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveToHistory = (cards, q, type, aiText = null, basicText = null) => {
    const newRecord = {
      timestamp: Date.now(),
      question: q,
      spreadId: type,
      cards: cards,
      aiReading: aiText,
      basicReading: basicText
    };
    const newHistory = [newRecord, ...history].slice(0, 50); 
    setHistory(newHistory);
    localStorage.setItem('tarot_history', JSON.stringify(newHistory));
  };

  const shareToSocial = () => {
    setIsSharing(true);
    setTimeout(() => {
        const newPost = {
            id: Date.now(),
            user: "神秘旅人" + Math.floor(Math.random() * 1000), 
            avatarColor: "bg-slate-700",
            time: "刚刚",
            question: question || "每日指引",
            spread: spreadType,
            likes: 0,
            comments: 0,
            cards: selectedCards,
            liked: false
        };
        const event = new CustomEvent('astral-post', { detail: newPost });
        window.dispatchEvent(event);
        setIsSharing(false);
        setShowSocial(true); 
    }, 1500);
  };

  const startReading = (type = 'three') => {
    if (type === 'three' && !question.trim()) {
      const input = document.getElementById('question-input');
      input?.classList.add('animate-shake');
      setTimeout(() => input?.classList.remove('animate-shake'), 500);
      return;
    }
    
    if (type === 'daily' && !question.trim()) {
      setQuestion("今日的宇宙指引");
    }

    setSpreadType(type);
    setGameState('shuffling');
    setSelectedCards([]);
    setRevealedIndices([]);
    setReadingMode(null);
    setAiReading(null);
    setAiError(null);
    setBasicReadingSummary(null);
    
    const fullDeck = [...TAROT_DECK]
      .sort(() => Math.random() - 0.5)
      .map(card => ({
        ...card,
        isReversed: Math.random() < 0.3
      }));
    setDeck(fullDeck);

    setTimeout(() => {
      setGameState('selecting');
    }, 2500);
  };

  const handleSelectCard = (card, index) => {
    const targetCount = SPREADS[spreadType === 'daily' ? 'DAILY' : 'THREE_CARD'].count;
    if (selectedCards.length >= targetCount) return;
    if (selectedCards.find(c => c.deckIndex === index)) return;
    const newSelection = [...selectedCards, { ...card, deckIndex: index }];
    setSelectedCards(newSelection);
    if (newSelection.length === targetCount) {
      setTimeout(() => {
        setGameState('reading');
      }, 1200);
    }
  };

  const revealCard = (index) => {
    if (!revealedIndices.includes(index)) {
      setRevealedIndices(prev => [...prev, index]);
    }
  };

  const targetCount = SPREADS[spreadType === 'daily' ? 'DAILY' : 'THREE_CARD'].count;
  const allRevealed = revealedIndices.length === targetCount;

  const generateGeminiReading = async () => {
    if (!selectedCards) return;
    setIsAiLoading(true);
    setAiError(null);
    setReadingMode('ai');

    try {
      const posNames = spreadType === 'daily' ? ["今日指引"] : POSITIONS.map(p => p.title);
      const cardDescriptions = selectedCards.map((c, i) => 
        `${posNames[i] || `位置${i+1}`}: ${c.name} (${c.isReversed ? '逆位' : '正位'}, 含义: ${c.keywords.join(',')})`
      ).join('\n');

      const systemPrompt = `你是一位神秘、睿智且富有同理心的塔罗牌大师。请解读用户的牌阵。
      模式：${spreadType === 'daily' ? '每日一牌指引' : '三张牌时间流占卜'}。
      解读要求：语气优雅、神秘、治愈。结合正逆位。给出具体建议。Markdown格式。`;

      const userPrompt = `用户问题: "${question}"\n\n牌阵:\n${cardDescriptions}\n\n请解读。`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
          }),
        }
      );

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (text) {
        setAiReading(text);
        saveToHistory(selectedCards, question, spreadType, text, null);
      } else {
        throw new Error("No text generated");
      }
    } catch (error) {
      setAiError("星界信号受到干扰，请稍后重试。");
    } finally {
      setIsAiLoading(false);
    }
  };

  const generateBasicReading = () => {
    setReadingMode('basic');
    let summary = "";
    if (spreadType === 'daily') {
       const card = selectedCards[0];
       summary = `**今日核心能量**\n【${card.name}${card.isReversed ? '(逆位)' : ''}】来到你的生命中。\n\n这意味着你今天可能会经历与${card.keywords.join('、')}相关的事情。${card.isReversed ? '请注意不要过于激进或消极，寻找内心的平衡。' : '顺应这股能量，大胆地去表达和行动吧。'}`;
    } else {
       const [past, present, future] = selectedCards;
       summary = `**过去之因**\n根基深受【${past.name}${past.isReversed ? '(逆位)' : ''}】的影响，${past.keywords[0]}是你经历的核心主题。\n\n**当下之镜**\n【${present.name}${present.isReversed ? '(逆位)' : ''}】显现，提示你目前正处于${present.keywords[0]}的状态。\n\n**未来之果**\n【${future.name}${future.isReversed ? '(逆位)' : ''}】指引着方向，${future.keywords[0]}与${future.keywords[2]}的能量将逐渐显化。`;
    }
    setBasicReadingSummary(summary);
    saveToHistory(selectedCards, question, spreadType, null, summary);
  };

  const loadHistoryRecord = (record) => {
     setQuestion(record.question);
     setSpreadType(record.spreadId || 'three');
     setSelectedCards(record.cards);
     setRevealedIndices(record.cards.map((_, i) => i)); 
     setAiReading(record.aiReading);
     setBasicReadingSummary(record.basicReading);
     setReadingMode(record.aiReading ? 'ai' : (record.basicReading ? 'basic' : null));
     setGameState('reading');
     setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden cursor-none">
      <MagicCursor />
      {showSoulCard && <SoulCardModal onClose={() => setShowSoulCard(false)} />}
      <HistoryPanel history={history} isOpen={showHistory} onClose={() => setShowHistory(false)} onLoadReading={loadHistoryRecord} />
      <SocialHall isOpen={showSocial} onClose={() => setShowSocial(false)} />

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-b from-[#050511] via-[#0f1025] to-[#020205]"></div>
         <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.08),transparent_50%)] animate-slow-spin opacity-60"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8 min-h-screen flex flex-col max-w-6xl">
        
        <header className="flex justify-between items-center mb-6 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setGameState('intro')}>
            <div className="relative p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-indigo-400/30 transition-colors">
                <Sparkles className="text-indigo-300 w-4 h-4 animate-spin-slow" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-serif tracking-[0.15em] text-indigo-100/90 group-hover:text-white transition-colors">ASTRAL ECHOES</h1>
            </div>
          </div>
          
          <div className="flex gap-4">
             <button onClick={() => setShowSoulCard(true)} className="text-slate-500 hover:text-indigo-300 transition-colors" title="本命牌"><User className="w-5 h-5"/></button>
             <button onClick={() => setShowHistory(true)} className="text-slate-500 hover:text-indigo-300 transition-colors" title="历史记录"><History className="w-5 h-5"/></button>
             <button onClick={() => setShowSocial(true)} className="text-slate-500 hover:text-indigo-300 transition-colors" title="星界大厅"><Globe className="w-5 h-5"/></button>
             {gameState !== 'intro' && (
               <button onClick={() => { setGameState('intro'); setQuestion(''); }} className="text-slate-500 hover:text-white transition-colors"><RefreshCw className="w-5 h-5"/></button>
             )}
          </div>
        </header>

        {gameState === 'intro' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in z-20 -mt-10">
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full animate-pulse-slow"></div>
                <Moon className="w-16 h-16 text-indigo-200" />
            </div>
            
            <h2 className="text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white via-indigo-100 to-slate-400 mb-6 tracking-wide">
              命运的回响
            </h2>
            
            <div className="w-full max-w-lg mb-8 group">
              <input 
                id="question-input"
                type="text" 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="在此输入你的困惑..."
                className="w-full bg-[#0a0a16] border border-white/10 focus:border-indigo-400/50 rounded-xl px-8 py-5 text-center text-white placeholder-slate-600 outline-none transition-all shadow-2xl"
                onKeyDown={(e) => e.key === 'Enter' && startReading('three')}
              />
            </div>

            <div className="flex gap-6">
              <button onClick={() => startReading('three')} className="group relative px-8 py-4 bg-indigo-600 rounded-xl overflow-hidden hover:scale-105 transition-transform">
                 <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                 <span className="relative font-bold text-sm tracking-widest text-white flex items-center gap-2">
                   时空流转 (3张) <ArrowRight className="w-4 h-4"/>
                 </span>
              </button>
              
              <button onClick={() => startReading('daily')} className="group relative px-8 py-4 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-amber-400/30 transition-colors">
                 <span className="relative font-bold text-sm tracking-widest text-slate-300 group-hover:text-amber-200 flex items-center gap-2">
                   <Calendar className="w-4 h-4"/> 每日指引 (1张)
                 </span>
              </button>
            </div>
          </div>
        )}

        {gameState === 'shuffling' && (
          <div className="flex-1 flex flex-col items-center justify-center z-20">
             <div className="relative w-40 h-64">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="absolute inset-0 bg-[#0f172a] border border-indigo-400/30 rounded-xl shadow-2xl" 
                       style={{ animation: `shuffleComplex 1s infinite ${EASE_ELASTIC}`, animationDelay: `${i * 0.1}s`, zIndex: 10 - i }}></div>
                ))}
             </div>
             <p className="mt-8 text-indigo-300/50 animate-pulse tracking-widest text-xs uppercase">Connecting...</p>
          </div>
        )}

        {gameState === 'selecting' && (
          <div className="flex-1 flex flex-col items-center justify-center z-20 relative w-full">
            <h3 className="text-2xl font-serif text-white mb-12 font-light animate-fade-in tracking-wider">
              请抽取 <span className="text-amber-300 font-bold mx-2">{targetCount - selectedCards.length}</span> 张牌
            </h3>
            
            <div className="relative w-full h-64 flex justify-center items-end perspective-1000">
              {deck.slice(0, 24).map((card, index) => {
                 const isSelected = selectedCards.find(c => c.deckIndex === index);
                 if (isSelected) return null; 
                 const middleIndex = 11.5;
                 const offset = index - middleIndex;
                 const rotate = offset * 4; 
                 const translateX = offset * 22; 
                 const translateY = Math.abs(offset) * 4;
                 const isHovered = hoveredCardIndex === index;
                 
                 return (
                   <div key={index}
                     className="absolute w-28 h-44 rounded-lg shadow-2xl cursor-pointer transition-all duration-300 origin-bottom border border-slate-700/50 bg-[#1e293b]"
                     style={{
                        transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg) ${isHovered ? 'translateY(-60px) scale(1.15) rotate(0deg)' : ''}`,
                        zIndex: isHovered ? 100 : index,
                        bottom: '-20px'
                     }}
                     onMouseEnter={() => setHoveredCardIndex(index)}
                     onMouseLeave={() => setHoveredCardIndex(null)}
                     onClick={() => handleSelectCard(card, index)}
                   >
                      <div className="w-full h-full bg-[#0f172a] rounded-lg overflow-hidden relative">
                         <div className="absolute inset-0 bg-indigo-900/30"></div>
                         <div className="absolute inset-1 border border-white/10 rounded-md"></div>
                      </div>
                   </div>
                 );
              })}
            </div>
          </div>
        )}

        {gameState === 'reading' && (
          <div className="flex-1 flex flex-col items-center animate-fade-in pb-10 z-20 w-full">
             <div className="mb-10 text-center border-b border-white/5 pb-4">
               <span className="text-indigo-400 text-[9px] tracking-[0.4em] uppercase block mb-2">Query</span>
               <h2 className="text-xl font-serif text-white italic">"{question}"</h2>
             </div>

            <div className={`grid gap-8 md:gap-16 w-full max-w-6xl mb-12 px-4 ${spreadType === 'daily' ? 'grid-cols-1 place-items-center' : 'grid-cols-1 md:grid-cols-3'}`}>
              {selectedCards.map((card, index) => (
                <div key={index} className="flex flex-col items-center group relative perspective-1000">
                  <div className="mb-6 text-center">
                     <span className="text-lg text-white font-serif block tracking-wider border-b border-white/10 pb-1 px-4">
                        {spreadType === 'daily' ? '今日指引' : POSITIONS[index].title}
                     </span>
                  </div>
                  
                  <TarotCard 
                    card={card} isRevealed={revealedIndices.includes(index)} isReversed={card.isReversed} onClick={() => revealCard(index)}
                    className="w-56 h-96 hover:-translate-y-4 transition-transform duration-500 mb-8"
                  />

                  <div className={`w-full text-center transition-all duration-700 ${revealedIndices.includes(index) ? 'opacity-100' : 'opacity-0'}`}>
                     {revealedIndices.includes(index) && (
                        <div className="bg-slate-900/40 border border-white/10 rounded-xl p-4 backdrop-blur-md">
                           <div className="text-indigo-200 text-xs font-bold uppercase mb-2">
                              {card.name} {card.isReversed && '(逆位)'}
                           </div>
                           <p className="text-slate-300 text-sm opacity-90">{card.isReversed ? card.meaningRev : card.meaning}</p>
                        </div>
                     )}
                  </div>
                </div>
              ))}
            </div>

            {allRevealed && !readingMode && (
              <div className="flex flex-col gap-6 animate-slide-up mt-8 items-center">
                 <div className="flex gap-6">
                    <button onClick={generateBasicReading} className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-600 hover:bg-slate-700 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400" /> 快速概览
                    </button>
                    <button onClick={generateGeminiReading} className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2 text-white">
                        <BrainCircuit className="w-4 h-4" /> AI 大师解读
                    </button>
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-white/5 w-full flex justify-center">
                    <button 
                       onClick={shareToSocial} 
                       disabled={isSharing}
                       className="text-sm text-slate-400 hover:text-indigo-300 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                       {isSharing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                       {isSharing ? '正在发送星界讯号...' : '匿名发布到星界大厅，寻求共鸣'}
                    </button>
                 </div>
              </div>
            )}

            {(readingMode === 'basic' || readingMode === 'ai') && (
               <div className="w-full max-w-3xl mt-12 animate-fade-in bg-[#0b0c15] border border-indigo-500/20 p-10 rounded-2xl relative">
                  {isAiLoading ? (
                     <div className="flex justify-center items-center gap-3 py-10"><Loader2 className="animate-spin text-indigo-400"/><span className="text-sm text-indigo-300">正在连结宇宙智慧...</span></div>
                  ) : (
                     <div className="prose prose-invert max-w-none text-slate-300 leading-8 font-serif">
                        {(readingMode === 'ai' ? aiReading : basicReadingSummary)?.split('\n').map((line, i) => line.trim() && <p key={i}>{line}</p>)}
                     </div>
                  )}
                  <div className="mt-8 pt-4 border-t border-white/5 text-center flex flex-col gap-4">
                     <button 
                        onClick={shareToSocial}
                        disabled={isSharing} 
                        className="text-sm text-indigo-300 hover:text-white flex items-center justify-center gap-2"
                     >
                        <Globe className="w-4 h-4"/> 将此解读分享到大厅
                     </button>
                     <button onClick={() => setReadingMode(null)} className="text-xs text-slate-500 hover:text-white flex items-center justify-center gap-2"><RotateCcw className="w-3 h-3"/> 返回</button>
                  </div>
               </div>
            )}
          </div>
        )}
      </div>
      <style>{`
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { bg: #334155; border-radius: 2px; }
        .perspective-1000 { perspective: 1000px; } .transform-style-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-y-180 { transform: rotateY(180deg); }
        .scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes shuffleComplex { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(10px) rotate(2deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 1s ${EASE_APPLE} forwards; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-slide-up { animation: slide-up 0.8s ${EASE_APPLE} forwards; }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } .animate-slide-down { animation: slide-down 0.5s ${EASE_APPLE} forwards; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } } .animate-pulse-slow { animation: pulse-slow 5s infinite ease-in-out; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin-slow { animation: spin-slow 15s linear infinite; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } } .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}