import React, { useEffect, useState, useRef } from 'react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { FloatingNova } from '../components/FloatingNova';
import { Celebration } from '../components/Celebration';
import { completeLesson, getLessons, getUser, updateUserXP } from '../services/db';
import { Lesson, User } from '../types';
import { motion } from 'framer-motion';

interface LessonPageProps {
  lessonId: string;
  onExit: () => void;
}

export const LessonPage: React.FC<LessonPageProps> = ({ lessonId, onExit }) => {
  const [lesson, setLesson] = useState<Lesson | undefined>(undefined);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); 
  const [initialTime, setInitialTime] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef<number>();

  // Initialize Lesson and Calculate Timer Duration
  useEffect(() => {
    const init = async () => {
      const [allLessons, user] = await Promise.all([getLessons(), getUser()]);
      const l = allLessons.find(i => i.id === lessonId);
      
      if (l) setLesson(l);

      if (user) {
        // Calculate session length: Daily Goal / 3 sessions. Min 10m, Max 60m.
        const dailyMinutes = user.dailyGoalHours * 60;
        const calculatedMinutes = Math.max(10, Math.min(60, Math.floor(dailyMinutes / 3)));
        const seconds = calculatedMinutes * 60;
        setTimeLeft(seconds);
        setInitialTime(seconds);
      }
    };
    init();

    return () => clearInterval(timerRef.current);
  }, [lessonId]);

  // Timer Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const handleFinish = async () => {
    setIsActive(false);
    if (lesson) {
      await completeLesson(lesson.id);
      await updateUserXP(50);
      setShowCelebration(true);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!lesson) return <div className="text-white p-10 flex justify-center">Loading Mission...</div>;

  if (showCelebration) {
    return <Celebration onComplete={onExit} title={lesson.title} xp={50} />;
  }

  const progress = ((initialTime - timeLeft) / initialTime) * 100;
  const isUrgent = timeLeft < 60 && isActive;

  return (
    <Layout className="bg-[#0b101b]">
      {/* Header */}
      <div className="p-4 flex items-center justify-between z-20 relative">
        <button onClick={onExit} className="text-gray-400 hover:text-white font-bold text-lg flex items-center gap-2 bg-[#1f2937]/50 px-3 py-1.5 rounded-lg border border-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          ABORT
        </button>
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-colors ${isActive ? 'bg-red-500/10 border-red-500/50' : 'bg-[#1f2937] border-gray-700'}`}>
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <span className={`text-xs font-black uppercase tracking-wider ${isActive ? 'text-red-400' : 'text-gray-400'}`}>
            {isActive ? "Focus Mode Active" : "Session Paused"}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-10 relative z-10">
        
        <div className="text-center space-y-2">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#1cb0f6] font-black uppercase tracking-widest text-xs"
          >
            Current Objective
          </motion.div>
          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mx-auto max-w-xs drop-shadow-lg">
            {lesson.title}
          </h1>
        </div>

        {/* Countdown Timer with Gradient Ring */}
        <div className="relative w-72 h-72 flex items-center justify-center">
           {/* Pulsing Backglow */}
           {isActive && (
              <div className="absolute inset-0 bg-[#58cc02] rounded-full blur-[60px] opacity-20 animate-pulse"></div>
           )}

           <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
             <defs>
               <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#58cc02" />
                 <stop offset="100%" stopColor="#2db502" />
               </linearGradient>
             </defs>
             {/* Track */}
             <circle
               cx="144" cy="144" r="120"
               stroke="#1f2937" strokeWidth="16" fill="transparent"
             />
             {/* Progress */}
             <motion.circle
               cx="144" cy="144" r="120"
               stroke={isUrgent ? "#ef4444" : "url(#progressGradient)"}
               strokeWidth="16"
               fill="transparent"
               strokeDasharray="753.98" // 2 * pi * 120
               strokeDashoffset={753.98 - (753.98 * progress) / 100}
               strokeLinecap="round"
               className="transition-all duration-1000 ease-linear"
             />
           </svg>

           <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-6xl font-mono font-bold tracking-tighter tabular-nums transition-colors drop-shadow-md ${isUrgent ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-gray-400 text-xs font-bold uppercase mt-2 tracking-widest">
                 {isActive ? "Stay Focused" : "Ready?"}
              </div>
           </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-xs space-y-4">
           {timeLeft === initialTime && !isActive ? (
              <Button fullWidth onClick={toggleTimer} className="text-xl py-4 shadow-[0_4px_14px_0_rgba(88,204,2,0.39)] hover:shadow-[0_6px_20px_rgba(88,204,2,0.23)]">
                 START SESSION
              </Button>
           ) : (
             <div className="flex gap-4">
                <Button 
                  fullWidth 
                  variant={isActive ? "secondary" : "primary"}
                  onClick={toggleTimer}
                  className="border-b-4"
                >
                  {isActive ? "PAUSE" : "RESUME"}
                </Button>
                <Button 
                  fullWidth 
                  variant="ghost" 
                  onClick={handleFinish}
                  className="text-gray-400 hover:text-white border-2 border-transparent hover:border-gray-700"
                >
                  COMPLETE
                </Button>
             </div>
           )}
        </div>
      </div>

      <FloatingNova currentLesson={lesson.title} />
    </Layout>
  );
};
