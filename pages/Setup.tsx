import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { createUser } from '../services/db';
import { generateSyllabus } from '../services/gemini';
import { saveLessons } from '../services/db';

interface SetupProps {
  onComplete: () => void;
}

export const Setup: React.FC<SetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    syllabus: '',
    days: 30,
    hours: '2',
    hardest: '',
    favorite: ''
  });

  const nextStep = () => setStep(s => s + 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Create User
      await createUser({
        hardestSubject: formData.hardest,
        favoriteSubject: formData.favorite,
        dailyGoalHours: parseFloat(formData.hours) || 1
      });

      // 2. Generate Lessons using Gemini with the full syllabus
      const lessons = await generateSyllabus(formData.syllabus, formData.days, formData.hardest);
      await saveLessons(lessons);

      onComplete();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Paste your Exam Syllabus</h2>
            <p className="text-gray-400 text-sm">Copy the list of topics from your textbook or PDF.</p>
            <textarea 
              placeholder="e.g. 
1. Introduction to Anatomy
2. The Nervous System
3. ..."
              className="w-full h-48 bg-[#1f2937] p-4 rounded-xl text-white text-sm border-2 border-transparent focus:border-[#58cc02] focus:outline-none resize-none"
              value={formData.syllabus}
              onChange={e => setFormData({...formData, syllabus: e.target.value})}
            />
            <Button fullWidth onClick={nextStep} disabled={!formData.syllabus.trim()}>CONTINUE</Button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Days until exam?</h2>
            <div className="flex justify-center text-5xl font-black text-[#1cb0f6] py-8">
              {formData.days}
            </div>
            <input 
              type="range" 
              min="1" max="120" 
              value={formData.days}
              onChange={e => setFormData({...formData, days: parseInt(e.target.value)})}
              className="w-full accent-[#58cc02] h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <Button fullWidth onClick={nextStep}>CONTINUE</Button>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">How many hours per day?</h2>
            <p className="text-gray-400">Be realistic!</p>
            <div className="flex items-center bg-[#1f2937] rounded-xl border-2 border-gray-700 focus-within:border-[#58cc02] overflow-hidden">
                <input 
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={formData.hours}
                  onChange={e => setFormData({...formData, hours: e.target.value})}
                  className="w-full bg-transparent p-4 text-3xl font-bold text-center focus:outline-none"
                />
                <span className="pr-6 text-gray-500 font-bold">HRS</span>
            </div>
            <Button fullWidth onClick={nextStep} disabled={!formData.hours}>CONTINUE</Button>
          </div>
        );
      case 4:
         return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">What scares you most?</h2>
            <p className="text-gray-400">We'll tackle this topic carefully.</p>
            <input 
              type="text" 
              placeholder="e.g. Quantum Physics, Organic Chemistry"
              className="w-full bg-[#1f2937] p-4 rounded-xl text-white text-lg focus:border-[#58cc02] border-2 border-transparent focus:outline-none"
              value={formData.hardest}
              onChange={e => setFormData({...formData, hardest: e.target.value})}
            />
            <Button fullWidth onClick={handleSubmit} disabled={loading}>
              {loading ? "BUILDING ADVENTURE..." : "GENERATE WORLD"}
            </Button>
          </div>
         );
    }
  }

  return (
    <Layout className="pt-20 px-6">
      <motion.div
        key={step}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
      >
        {renderStep()}
      </motion.div>
    </Layout>
  );
};
