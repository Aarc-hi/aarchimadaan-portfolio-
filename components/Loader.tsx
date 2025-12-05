import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const Loader: React.FC = () => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // Smooth counter
    const duration = 2200; 
    const interval = 20;
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + increment;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex pointer-events-none">
        {/* The Staggered Blinds (Background) - Light Theme */}
        {[0, 1, 2, 3, 4].map((index) => (
            <motion.div
                key={index}
                initial={{ height: "100%" }}
                exit={{ 
                    height: "0%",
                    transition: { 
                        duration: 0.8, 
                        ease: [0.76, 0, 0.24, 1], 
                        delay: index * 0.05 
                    } 
                }}
                className={`flex-1 bg-[#FFFDF5] border-r border-black/5 last:border-r-0 relative overflow-hidden`}
                style={{ originY: index % 2 === 0 ? 0 : 1 }} // Alternate transform origin (Top/Bottom)
            >
               {/* Decorative subtle vertical line inside each blind */}
               <div className="absolute inset-y-0 left-1/2 w-[1px] bg-black/5 transform -translate-x-1/2" />
            </motion.div>
        ))}

        {/* Content Overlay - Dark Text for Light Theme */}
        <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            className="absolute inset-0 flex flex-col justify-between p-8 md:p-16 text-[#1A1A1A]"
        >
            {/* Top: Name */}
            <div className="flex justify-between items-start overflow-hidden">
                <motion.h1 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="font-serif text-3xl md:text-5xl tracking-tight leading-none"
                >
                    Aarchi Madaan
                </motion.h1>
                <motion.span 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 0.5 }}
                     transition={{ delay: 0.5 }}
                     className="font-mono text-xs uppercase tracking-widest hidden md:block"
                >
                    Portfolio 2025
                </motion.span>
            </div>

            {/* Center: Minimal Focus */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs md:max-w-lg">
                <div className="flex justify-between items-end mb-2 font-mono text-xs uppercase opacity-70">
                    <span>Loading</span>
                    <span>{Math.round(count)}%</span>
                </div>
                <div className="w-full h-[1px] bg-black/10 relative overflow-hidden">
                    <motion.div 
                        className="absolute top-0 left-0 h-full bg-black"
                        style={{ width: `${count}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 overflow-hidden">
                    <motion.span 
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="font-serif italic text-lg opacity-50"
                    >
                        Interaction
                    </motion.span>
                     <motion.span 
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="font-serif italic text-lg opacity-50"
                    >
                        Designer
                    </motion.span>
                </div>
            </div>

            {/* Bottom: Location */}
            <div className="flex justify-between items-end overflow-hidden">
                 <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "circOut" }}
                    className="font-mono text-xs uppercase tracking-widest opacity-50"
                 >
                    New Delhi, IN
                 </motion.div>
            </div>
        </motion.div>
    </div>
  );
};
