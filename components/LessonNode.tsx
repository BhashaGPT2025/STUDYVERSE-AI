import React from 'react';
import { motion } from 'framer-motion';
import { Lesson, LessonStatus } from '../types';

interface LessonNodeProps {
  lesson: Lesson;
  xOffset: number;
  onClick: (id: string) => void;
}

export const LessonNode: React.FC<LessonNodeProps> = ({ lesson, xOffset, onClick }) => {
  const isLocked = lesson.status === LessonStatus.LOCKED;
  const isDone = lesson.status === LessonStatus.DONE;
  const isOpen = lesson.status === LessonStatus.OPEN;

  const bgClass = isDone 
    ? "bg-[#ffc800] border-[#e5b400]" 
    : isOpen 
      ? "bg-[#58cc02] border-[#46a302]" 
      : "bg-[#374151] border-[#1f2937]";

  return (
    <div className="relative flex justify-center py-6">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ x: xOffset }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Active Ping Animation */}
        {isOpen && (
          <div className="absolute top-0 left-0 w-full h-full">
             <div className="w-20 h-20 bg-[#58cc02] rounded-full animate-ping opacity-20"></div>
          </div>
        )}

        {isOpen && (
           <motion.div 
             animate={{ y: [0, -8, 0] }}
             transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
             className="absolute -top-12 bg-white text-[#58cc02] font-black text-xs px-3 py-1.5 rounded-xl border-b-4 border-gray-200 shadow-sm z-20 whitespace-nowrap"
           >
             START
           </motion.div>
        )}
        
        <button
          onClick={() => !isLocked && onClick(lesson.id)}
          disabled={isLocked}
          className={`w-20 h-20 rounded-full border-b-[6px] flex items-center justify-center transition-all active:border-b-0 active:translate-y-[6px] shadow-lg ${bgClass}`}
        >
          {isDone ? (
             <svg className="w-10 h-10 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
          ) : isLocked ? (
             <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          ) : (
             <svg className="w-10 h-10 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 19h20L12 2zm0 3l6 11H6l6-11z"/></svg>
          )}
        </button>

        <span className={`mt-3 font-bold text-xs max-w-[120px] text-center bg-[#131f24]/90 backdrop-blur px-3 py-1 rounded-lg border border-gray-700 ${isLocked ? 'text-gray-500' : 'text-white'}`}>
            {lesson.title}
        </span>
      </motion.div>
    </div>
  );
};
