import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AvatarConfig } from '../types';
import { Button } from './Button';
import { generateAvatarConfig } from '../services/gemini';

interface AvatarEditorProps {
  initialConfig: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
  onCancel: () => void;
}

// DiceBear Avataaars Options
const OPTIONS = {
  top: ['longHair', 'shortHair', 'eyepatch', 'hat', 'hijab', 'turban', 'winterHat1', 'winterHat2', 'bob', 'bun', 'curly', 'dreads', 'frida', 'fro', 'miaWallace', 'shavedSides', 'straight01', 'straight02'],
  accessories: ['none', 'kurt', 'prescription01', 'prescription02', 'round', 'sunglasses', 'wayfarers'],
  hairColor: ['auburn', 'black', 'blonde', 'brown', 'pastelPink', 'platinum', 'red', 'silverGray'],
  clothing: ['blazerAndShirt', 'blazerAndSweater', 'collarAndSweater', 'graphicShirt', 'hoodie', 'overall', 'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck'],
  eyes: ['close', 'cry', 'default', 'dizzy', 'eyeRoll', 'happy', 'hearts', 'side', 'squint', 'surprised', 'wink'],
  mouth: ['concerned', 'default', 'disbelief', 'eating', 'grimace', 'sad', 'scream', 'smile', 'tongue', 'twinkle'],
  skinColor: ['tanned', 'yellow', 'pale', 'light', 'brown', 'darkBrown', 'black']
};

export const AvatarEditor: React.FC<AvatarEditorProps> = ({ initialConfig, onSave, onCancel }) => {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig);
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  // Construct URL based on config
  const getAvatarUrl = (c: AvatarConfig) => {
    const params = new URLSearchParams();
    Object.entries(c).forEach(([key, value]) => {
      if (value && value !== 'none') params.append(key, value as string);
    });
    return `https://api.dicebear.com/9.x/avataaars/svg?${params.toString()}`;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const newConfig = await generateAvatarConfig(prompt);
      setConfig(prev => ({ ...prev, ...newConfig }));
    } finally {
      setLoading(false);
    }
  };

  const cycleOption = (category: keyof typeof OPTIONS, direction: 1 | -1) => {
    const current = config[category as keyof AvatarConfig] as string || OPTIONS[category][0];
    const list = OPTIONS[category];
    const idx = list.indexOf(current);
    let newIdx = idx + direction;
    if (newIdx < 0) newIdx = list.length - 1;
    if (newIdx >= list.length) newIdx = 0;
    
    setConfig(prev => ({ ...prev, [category]: list[newIdx] }));
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#111827] flex flex-col items-center">
      {/* Header */}
      <div className="w-full p-4 flex justify-between items-center border-b border-gray-800 bg-[#131f24]">
        <button onClick={onCancel} className="text-gray-400 font-bold hover:text-white">CANCEL</button>
        <h2 className="text-xl font-black text-white tracking-widest">STYLE STUDIO</h2>
        <button onClick={() => onSave(config)} className="text-[#58cc02] font-bold hover:text-[#61e002]">SAVE</button>
      </div>

      <div className="flex-1 w-full max-w-md overflow-y-auto pb-6">
        {/* Preview Area */}
        <div className="flex justify-center py-8 bg-gradient-to-b from-[#131f24] to-[#111827]">
           <motion.div 
             key={JSON.stringify(config)}
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="w-48 h-48 rounded-full border-4 border-white/10 shadow-2xl bg-gradient-to-tr from-blue-400 to-purple-500 overflow-hidden"
           >
             <img src={getAvatarUrl(config)} alt="Avatar" className="w-full h-full object-cover" />
           </motion.div>
        </div>

        {/* Tabs */}
        <div className="px-6 mb-6">
          <div className="flex bg-[#1f2937] p-1 rounded-xl">
            <button 
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'manual' ? 'bg-[#1cb0f6] text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              MANUAL
            </button>
            <button 
              onClick={() => setMode('ai')}
              className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'ai' ? 'bg-[#a855f7] text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
              AI MAGIC
            </button>
          </div>
        </div>

        {/* Manual Controls */}
        {mode === 'manual' && (
          <div className="px-6 space-y-4">
             {Object.keys(OPTIONS).map((key) => {
               const category = key as keyof typeof OPTIONS;
               const currentVal = config[category as keyof AvatarConfig] || OPTIONS[category][0];
               
               return (
                 <div key={key} className="bg-[#1f2937] p-3 rounded-xl flex items-center justify-between border border-gray-700">
                    <span className="text-xs font-bold text-gray-400 uppercase w-20">{key}</span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => cycleOption(category, -1)}
                        className="w-8 h-8 rounded-lg bg-[#374151] flex items-center justify-center text-white hover:bg-[#4b5563]"
                      >
                        ←
                      </button>
                      <span className="text-sm font-bold text-white w-32 text-center truncate">{currentVal}</span>
                      <button 
                        onClick={() => cycleOption(category, 1)}
                        className="w-8 h-8 rounded-lg bg-[#374151] flex items-center justify-center text-white hover:bg-[#4b5563]"
                      >
                        →
                      </button>
                    </div>
                 </div>
               );
             })}
          </div>
        )}

        {/* AI Controls */}
        {mode === 'ai' && (
          <div className="px-6 space-y-4">
            <div className="bg-[#1f2937] p-4 rounded-xl border border-gray-700">
              <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">Describe your look</label>
              <textarea 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. A cyberpunk hacker with pink hair and sunglasses..."
                className="w-full bg-[#111827] rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#a855f7] h-32 resize-none"
              />
            </div>
            <Button 
              fullWidth 
              onClick={handleGenerate} 
              disabled={loading || !prompt.trim()}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 border-none"
            >
              {loading ? "GENERATING..." : "MAGIC MAKE OVER ✨"}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Powered by Gemini. Describe any style you want!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
