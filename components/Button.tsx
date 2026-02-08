import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const baseStyles = "font-bold rounded-2xl py-3 px-6 transition-all border-b-4 active:border-b-0 active:translate-y-1";
  
  const variants = {
    primary: "bg-[#58cc02] border-[#46a302] text-white hover:bg-[#61e002]",
    secondary: "bg-[#1cb0f6] border-[#1899d6] text-white hover:bg-[#20bdff]",
    danger: "bg-[#ff4b4b] border-[#d42c2c] text-white hover:bg-[#ff5f5f]",
    ghost: "bg-transparent border-transparent text-gray-400 hover:bg-gray-800",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
