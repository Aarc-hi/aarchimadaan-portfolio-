import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Loader: React.FC = () => {
  const [count, setCount] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  
  const words = ["INITIALIZING", "LOADING ASSETS", "BREWING CHAOS", "ALIGNING PIXELS", "READY TO LAUNCH"];

  useEffect(() => {
    // Counter logic
    const duration = 2000; // 2 seconds
    const interval = 20;
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
     // Word cycling logic
     if (count < 100) {
         const wordTimer = setInterval(() => {
             setTextIndex(prev => (prev + 1) % words.length);
         }, 350);
         return () => clearInterval(wordTimer);
     } else {
        setTextIndex(words.length - 1);
     }
  }, [count]);

  return (
    <motion.div 
      initial={{ y: 0 }}
      exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
      className="fixed inset-0 z-[100] bg-[#1a1a1a] text-[#f0f0f0] flex flex-col justify-between p-6 md:p-12 cursor-wait"
    >
      {/* Top Bar */}
      <div className="flex justify-between font-mono text-xs md:text-sm uppercase tracking-widest opacity-60">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cobalt rounded-full animate-pulse"/>
            <span>Aarchi Madaan</span>
        </div>
        <span>Portfolio © 2025</span>
      </div>

      {/* Center Kinetic Content */}
      <div className="flex flex-col items-center justify-center w-full relative">
         <div className="relative overflow-hidden w-full text-center">
            <motion.h1 
                className="text-[25vw] leading-[0.8] font-display font-black tracking-tighter tabular-nums select-none mix-blend-difference"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {Math.round(count)}%
            </motion.h1>
         </div>
         
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[1px] bg-white/10 mix-blend-exclusion" />
         
         <div className="mt-8 md:mt-12 h-8 flex flex-col items-center overflow-hidden">
             <AnimatePresence mode='wait'>
                 <motion.span 
                    key={textIndex}
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "backOut" }}
                    className="font-mono text-cobalt font-bold uppercase tracking-[0.2em] md:text-xl"
                 >
                    {words[textIndex]}
                 </motion.span>
             </AnimatePresence>
         </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end font-mono text-xs md:text-sm uppercase tracking-widest opacity-60">
        <span className="hidden md:block">Interaction Designer</span>
        <div className="flex gap-4 items-center">
           <div className="w-full max-w-[100px] h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-cobalt"
                    style={{ width: `${count}%` }}
                />
           </div>
           <span>v2.0</span>
        </div>
      </div>
    </motion.div>
  );
};