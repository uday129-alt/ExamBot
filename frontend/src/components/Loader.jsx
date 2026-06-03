import React from 'react';

export default function Loader({ message = 'Analyzing context...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-16 h-16">
        {/* Glowing blur under spinner */}
        <div className="absolute inset-0 bg-accentPurple rounded-full blur-md opacity-30 animate-pulse"></div>
        {/* Ring 1 */}
        <div className="absolute inset-0 border-4 border-t-accentPurple border-r-accentPink border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        {/* Ring 2 */}
        <div className="absolute inset-2 border-4 border-t-transparent border-r-transparent border-b-accentPurple border-l-accentPink rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
      </div>
      <p className="text-sm font-semibold text-textMuted animate-pulse-subtle">{message}</p>
    </div>
  );
}
