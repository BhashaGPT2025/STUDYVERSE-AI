import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/Layout';
import { LessonNode } from '../components/LessonNode';
import { AvatarEditor } from '../components/AvatarEditor';
import { getLessons, getUser, updateUserAvatar } from '../services/db';
import { Lesson, User, AvatarConfig } from '../types';

interface MapProps {
  onLessonSelect: (id: string) => void;
}

type Tab = 'map' | 'rank' | 'quests';

export const MapPage: React.FC<MapProps> = ({ onLessonSelect }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('map');
  const [showEditor, setShowEditor] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      setLessons(await getLessons());
      const u = await getUser();
      setUser(u);
    };
    load();
  }, []);

  const handleSaveAvatar = async (config: AvatarConfig) => {
    const updated = await updateUserAvatar(config);
    setUser(updated);
    setShowEditor(false);
  };

  const getAvatarUrl = (c?: AvatarConfig) => {
    if (!c) return `https://api.dicebear.com/9.x/avataaars/svg?seed=felix`;
    const params = new URLSearchParams();
    Object.entries(c).forEach(([key, value]) => {
      if (value && value !== 'none') params.append(key, value as string);
    });
    return `https://api.dicebear.com/9.x/avataaars/svg?${params.toString()}`;
  };

  // Center node x-coordinate logic matching the SVG curve
  const getNodeX = (i: number) => Math.sin(i * 1.5) * 80;

  // SVG Path Generator
  const generatePath = () => {
    if (lessons.length === 0) return "";
    let path = `M 200 40`;
    lessons.forEach((_, i) => {
        const x = 200 + getNodeX(i);
        const y = 80 + i * 140;
        const prevX = 200 + getNodeX(i - 1);
        const prevY = 80 + (i - 1) * 140;
        if (i > 0) {
            const cp1x = prevX;
            const cp1y = prevY + 70;
            const cp2x = x;
            const cp2y = y - 70;
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
        }
    });
    return path;
  };

  // Views
  const renderMap = () => (
    <div 
        className="flex-1 overflow-y-auto no-scrollbar relative bg-[#111827]" 
        ref={scrollRef}
        style={{
            paddingBottom: '100px', // Space for bottom nav
            backgroundImage: `radial-gradient(#1f2937 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
        }}
    >
        <div className="relative min-h-[1000px] w-full pt-10 flex flex-col items-center">
        <svg 
            className="absolute top-0 left-0 w-full pointer-events-none" 
            style={{ height: Math.max(1000, (lessons.length + 1) * 150) }}
        >
            <path d={generatePath()} fill="none" stroke="#1f2937" strokeWidth="18" strokeLinecap="round"/>
            <path d={generatePath()} fill="none" stroke="#374151" strokeWidth="8" strokeLinecap="round"/>
            <path d={generatePath()} fill="none" stroke="#4b5563" strokeWidth="2" strokeDasharray="12 12" strokeLinecap="round" className="opacity-50"/>
        </svg>

        {lessons.map((lesson, idx) => (
            <div key={lesson.id} className="mb-8 w-full flex justify-center">
                <LessonNode lesson={lesson} xOffset={getNodeX(idx)} onClick={onLessonSelect} />
                {idx % 4 === 0 && (
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute text-2xl opacity-20 pointer-events-none" style={{ left: '15%', top: 80 + idx * 140 }}>🚀</motion.div>
                )}
            </div>
        ))}
        </div>
    </div>
  );

  const renderRank = () => (
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#111827] pb-32">
          <h2 className="text-2xl font-black text-[#ffc800] mb-6 text-center">LEADERBOARD</h2>
          {[
              { name: 'Marcus', xp: 4500, seed: 'felix' },
              { name: 'Sarah', xp: 3200, seed: 'aneka' },
              { name: 'You', xp: user?.xp || 0, config: user?.avatarConfig, highlight: true },
              { name: 'Jin', xp: 1200, seed: 'zack' }
          ].sort((a,b) => b.xp - a.xp).map((u, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center p-4 rounded-2xl border-2 ${u.highlight ? 'bg-[#1f2937] border-[#58cc02]' : 'bg-[#131f24] border-gray-800'}`}
              >
                  <div className="font-black text-xl w-8 text-gray-500">{i + 1}</div>
                  <img 
                    src={u.config ? getAvatarUrl(u.config) : `https://api.dicebear.com/9.x/avataaars/svg?seed=${u.seed}`} 
                    className="w-12 h-12 rounded-full border-2 border-gray-600 mr-4 bg-gray-800" 
                  />
                  <div className="flex-1">
                      <div className={`font-bold ${u.highlight ? 'text-[#58cc02]' : 'text-white'}`}>{u.name}</div>
                      <div className="text-xs text-gray-500">{u.xp} XP</div>
                  </div>
                  {i === 0 && <span className="text-2xl">👑</span>}
              </motion.div>
          ))}
      </div>
  );

  const renderQuests = () => (
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#111827] pb-32">
          <h2 className="text-2xl font-black text-[#1cb0f6] mb-6 text-center">DAILY QUESTS</h2>
          {[
              { title: 'Earn 50 XP', progress: Math.min(50, user?.xp || 0), total: 50, reward: '⚡ 10' },
              { title: 'Finish 1 Focus Session', progress: 0, total: 1, reward: '🎁 Chest' },
              { title: '7 Day Streak', progress: user?.streak || 0, total: 7, reward: '🔥 20' }
          ].map((q, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#1f2937] p-5 rounded-2xl border-b-4 border-gray-800"
              >
                  <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-lg">{q.title}</span>
                      <span className="font-black text-[#ffc800] bg-[#ffc800]/10 px-2 py-1 rounded text-sm">{q.reward}</span>
                  </div>
                  <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(q.progress / q.total) * 100}%` }}
                        className="h-full bg-[#1cb0f6]"
                      />
                  </div>
                  <div className="text-right text-xs text-gray-400 mt-1 font-bold">{q.progress} / {q.total}</div>
              </motion.div>
          ))}
      </div>
  );

  return (
    <Layout>
      {/* Top Bar */}
      <div className="flex-none bg-[#131f24]/90 backdrop-blur-md p-4 border-b border-gray-800 flex justify-between items-center shadow-lg h-16 z-10 relative">
        <div className="flex space-x-4">
          <div className="flex items-center space-x-1.5 text-[#ff9600]">
             <span className="text-xl">🔥</span>
             <span className="font-black text-lg">{user?.streak || 0}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[#ffc800]">
             <span className="text-xl">⭐</span>
             <span className="font-black text-lg">{user?.xp || 0}</span>
          </div>
        </div>
        
        {/* Avatar Button */}
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowEditor(true)}
          className="relative w-10 h-10 rounded-full bg-gray-700 overflow-hidden border-2 border-gray-600 focus:outline-none focus:border-[#58cc02]"
        >
          <img src={getAvatarUrl(user?.avatarConfig)} alt="User" className="w-full h-full object-cover"/>
        </motion.button>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && user && (
          <AvatarEditor 
            initialConfig={user.avatarConfig} 
            onSave={handleSaveAvatar} 
            onCancel={() => setShowEditor(false)} 
          />
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
         {activeTab === 'map' && renderMap()}
         {activeTab === 'rank' && renderRank()}
         {activeTab === 'quests' && renderQuests()}
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 left-0 w-full bg-[#131f24] border-t border-gray-800 flex justify-around items-center h-[80px] px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40">
         <NavButton 
            active={activeTab === 'map'} 
            onClick={() => setActiveTab('map')} 
            icon={<svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>}
            label="Map"
         />
         <NavButton 
            active={activeTab === 'rank'} 
            onClick={() => setActiveTab('rank')} 
            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            label="Rank"
         />
         <NavButton 
            active={activeTab === 'quests'} 
            onClick={() => setActiveTab('quests')} 
            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
            label="Quests"
         />
      </div>
    </Layout>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all w-24 h-full ${active ? 'text-[#58cc02]' : 'text-gray-500 hover:text-gray-300'}`}
    >
        <div className={`transition-transform duration-200 ${active ? 'scale-110 -translate-y-1' : ''}`}>
            {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-wide">{label}</span>
    </button>
);
