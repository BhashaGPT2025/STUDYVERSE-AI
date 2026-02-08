import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`fixed inset-0 bg-[#111827] text-white flex justify-center overflow-hidden ${className}`}>
      <div className="w-full max-w-md bg-[#131f24] h-full relative shadow-2xl flex flex-col">
        {children}
      </div>
    </div>
  );
};
