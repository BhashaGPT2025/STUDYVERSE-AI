import React from 'react';
import { motion } from 'framer-motion';

interface CelebrationProps {
  onComplete: () => void;
  title?: string;
  xp?: number;
}

export const Celebration: React.FC<CelebrationProps> = ({ onComplete, title = "MISSION ACCOMPLISHED", xp = 50 }) => {
  
  // Generate random particles with physics-like trajectories
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    angle: Math.random() * 360,
    velocity: Math.random() * 800 + 200, // Distance to travel
    size: Math.random() * 1.5 + 0.5,
    rotation: Math.random() * 360,
    delay: Math.random() * 0.2,
    emoji: ['⭐', '🎉', '⚡', '🚀', '🎓', '🔥'][Math.floor(Math.random() * 6)]
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b101b]/95 backdrop-blur-xl overflow-hidden">
      
      {/* Explosive Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ 
            x: Math.cos(p.angle * (Math.PI / 180)) * p.velocity, 
            y: Math.sin(p.angle * (Math.PI / 180)) * p.velocity, 
            opacity: 0,
            scale: p.size,
            rotate: p.rotation
          }}
          transition={{ duration: 1.5, ease: "easeOut", delay: p.delay }}
          className="absolute text-2xl"
          style={{ top: '50%', left: '50%' }}
        >
          {p.emoji}
        </motion.div>
      ))}

      {/* Main Content Card */}
      <div className="relative z-10 w-full max-w-sm p-8 text-center">
        <motion.div 
            initial={{ scale: 0.5, opacity: 0, rotateX: 90 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
            className="mb-8 relative"
        >
            <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
            <div className="text-[120px] leading-none drop-shadow-[0_10px_30px_rgba(255,200,0,0.5)] transform hover:scale-110 transition-transform cursor-pointer">
                🏆
            </div>
        </motion.div>

        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-2 mb-10"
        >
            <h2 className="text-[#58cc02] font-black tracking-widest text-sm uppercase">Mission Complete</h2>
            <h1 className="text-3xl font-black text-white leading-tight drop-shadow-md">
              {title}
            </h1>
            <div className="flex items-center justify-center gap-2 text-[#ffc800] font-black text-2xl mt-4 bg-[#ffc800]/10 py-2 rounded-xl border border-[#ffc800]/20">
                <span>+{xp}</span>
                <span>XP GAINED</span>
            </div>
        </motion.div>
        
        <motion.button 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onComplete}
          className="w-full bg-[#58cc02] text-white py-4 rounded-2xl font-black text-xl shadow-[0_6px_0_#46a302] active:shadow-none active:translate-y-[6px] transition-all"
        >
          CONTINUE JOURNEY
        </motion.button>
      </div>
    </div>
  );
};
