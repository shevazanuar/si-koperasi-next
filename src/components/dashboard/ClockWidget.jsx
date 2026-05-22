'use client';

import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return <div className="h-[90px] w-[240px] opacity-0"></div>; // Placeholder layout shift
  }

  const day = time.getDate().toString().padStart(2, '0');
  const month = time.toLocaleDateString('en-US', { month: 'short' });
  const year = time.getFullYear();
  
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');

  return (
    <div className={`flex items-center justify-center gap-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20 text-white shadow-sm ${inter.className}`}>
      <div className="flex flex-col items-center">
        <span className="text-xl font-bold leading-none tracking-tight">{day}</span>
        <span className="text-[10px] font-medium tracking-wide text-white/90">{month}, {year}</span>
      </div>
      
      <div className="w-[1px] h-8 bg-white/40 rounded-full"></div>
      
      <div className="flex flex-col items-center">
        <span className="text-xl font-bold leading-none tracking-tight">{hours}.{minutes}</span>
        <span className="text-[10px] font-medium tracking-widest text-white/90">WIB</span>
      </div>
    </div>
  );
}
