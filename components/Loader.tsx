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
            <div
                key={index}
                className="flex-1 bg-[#FFFDF5] border-r border-black/5 last:border-r-0 relative overflow-hidden"
            >
               {/* Decorative subtle vertical line inside each blind */}
               <div className="absolute inset-y-0 left-1/2 w-[1px] bg-black/5 transform -translate-x-1/2" />
            </div>
        ))}

        {/* Content Overlay - Dark Text for Light Theme */}
        <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-16 text-[#1A1A1A]">
            {/* Top */}
            <div className="flex justify-between items-start overflow-hidden">
                <motion.span
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 0.5 }}
                     transition={{ delay: 0.5 }}
                     className="ml-auto font-sans text-xs tracking-wide hidden md:block"
                >
                    Portfolio 2025
                </motion.span>
            </div>

            {/* Center: Minimal Focus */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs md:max-w-lg">
                <div className="flex justify-between items-end mb-2 font-sans text-xs opacity-70">
                    <span>Loading</span>
                    <span>{Math.round(count)}%</span>
                </div>
                <div className="w-full h-[1px] bg-black/10 relative overflow-hidden">
                    <div
                        className="absolute top-0 left-0 h-full bg-black"
                        style={{ width: `${count}%` }}
                    />
                </div>
            </div>

        </div>
    </div>
  );
};
