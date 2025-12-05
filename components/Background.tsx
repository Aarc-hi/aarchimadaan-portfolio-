import React from 'react';
import { motion } from 'framer-motion';

export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Technical Grid - Lighter */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.2]" />
      
      {/* Floating Fun Shapes */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] left-[5%] text-cobalt/10 dark:text-cobalt/20"
      >
        <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor">
           <path d="M50 0L61 35L98 35L68 57L79 91L50 70L21 91L32 57L2 35L39 35L50 0Z" />
        </svg>
      </motion.div>

      <motion.div 
        animate={{ y: [0, -50, 0], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[20%] right-[10%] text-ink/5 dark:text-ink-light/10"
      >
         <svg width="300" height="300" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="100" cy="100" r="80" strokeDasharray="10 10" />
            <circle cx="100" cy="100" r="60" />
            <circle cx="100" cy="100" r="40" strokeDasharray="5 5" />
         </svg>
      </motion.div>
      
      {/* Random Scribble */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [-5, 5, -5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[40%] left-[60%] w-64 h-64 opacity-[0.03] dark:opacity-[0.05]"
      >
         <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="5">
            <path d="M10,10 Q50,100 90,50 T180,100" />
            <path d="M10,30 Q60,120 100,70 T190,120" />
            <path d="M10,50 Q70,140 110,90 T200,140" />
         </svg>
      </motion.div>
    </div>
  );
};