import React from 'react';

export default function LoadingSpinner({ fullScreen = true, size = 'md', className = '' }) {

  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-4'
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm animate-fade-in">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            {/* Outer Glow Ring */}
            <div className="absolute w-32 h-32 rounded-full border-4 border-brand-primary/10 animate-ping opacity-75"></div>

            {/* Rotating Rings */}
            <div className="relative w-24 h-24">
              <div className="absolute w-full h-full rounded-full border-[6px] border-[#F4F5F9]"></div>
              <div className="absolute w-full h-full rounded-full border-[6px] border-brand-primary border-t-transparent animate-spin"></div>

              {/* Inner Counter-Rotating Ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-4 border-[#FF754C] border-b-transparent animate-spin-reverse"></div>
            </div>

            {/* Center Dot */}
            <div className="absolute w-4 h-4 bg-brand-primary rounded-full animate-pulse"></div>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold text-[#11142D] tracking-wide">AmanPoll</h3>
            <p className="text-sm font-medium text-[#808191] animate-pulse">Memuat aplikasi...</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className={`flex justify-center items-center p-4 ${className}`}>
      <div className={`relative ${sizeClasses[size] || sizeClasses.md}`}>
        <div className="absolute w-full h-full rounded-full border-gray-200 border-inherit"></div>
        <div className="absolute w-full h-full rounded-full border-brand-primary border-t-transparent border-inherit animate-spin"></div>
      </div>
    </div>
  );
}
