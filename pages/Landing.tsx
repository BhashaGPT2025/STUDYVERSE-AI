import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { Layout } from '../components/Layout';

interface LandingProps {
  onStart: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <Layout className="items-center">
      <div className="flex flex-col items-center justify-center h-full px-6 text-center space-y-8">
        <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="w-48 h-48 relative"
        >
             <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 blur-2xl animate-pulse"></div>
             <img 
               src="https://picsum.photos/400/400" 
               alt="StudyVerse World" 
               className="relative z-10 w-full h-full rounded-full object-cover border-4 border-white/10 shadow-2xl"
             />
        </motion.div>

        <div className="space-y-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-extrabold text-[#58cc02] tracking-wide"
          >
            StudyVerse
          </motion.h1>
          <p className="text-gray-400 text-lg max-w-xs mx-auto leading-relaxed">
            Turn your boring syllabus into an epic adventure. Level up, earn XP, and master your exams.
          </p>
        </div>

        <div className="w-full max-w-xs space-y-4 pt-8">
          <Button fullWidth onClick={onStart} className="text-lg uppercase tracking-wider">
            Start My Study World
          </Button>
          <Button fullWidth variant="ghost" className="uppercase tracking-wider">
            I already have an account
          </Button>
        </div>
      </div>
    </Layout>
  );
};
