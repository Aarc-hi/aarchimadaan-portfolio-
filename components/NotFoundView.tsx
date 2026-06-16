import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, AlertTriangle } from 'lucide-react';
import { ViewState } from '../types';

interface NotFoundViewProps {
  setView: (view: ViewState) => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ setView }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="w-full max-w-4xl flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="relative mb-12">
        <motion.div 
          animate={{ 
            rotate: [0, -5, 5, -5, 0],
            x: [0, -2, 2, -2, 0]
          }}
          transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
          className="text-[15vw] md:text-[200px] font-display font-black leading-none text-transparent text-stroke-thick opacity-20"
        >
          404
        </motion.div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-cobalt text-white px-6 py-2 font-mono text-xl md:text-2xl font-bold rotate-[-2deg] shadow-hard"
          >
            YOU'RE LOST, BESTIE
          </motion.div>
        </div>
      </div>

      <h2 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter mb-8 leading-tight">
        This pixel doesn't<br/>
        <span className="text-cobalt underline decoration-wavy">exist yet.</span>
      </h2>

      <p className="text-xl md:text-2xl font-medium max-w-2xl mb-12 opacity-80">
        The page you're looking for has either been moved, deleted, or never survived the design process.
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        <motion.button 
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setView('HOME')}
          className="flex items-center gap-3 px-10 py-4 bg-ink dark:bg-ink-light text-paper dark:text-paper-dark font-display font-bold text-lg uppercase shadow-hard hover:shadow-none transition-all"
        >
          <Home size={20} />
          Go Home
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setView('PROJECTS')}
          className="flex items-center gap-3 px-10 py-4 bg-transparent border-2 border-current font-display font-bold text-lg uppercase hover:bg-cobalt hover:text-white hover:border-cobalt transition-all"
        >
          <Search size={20} />
          View Works
        </motion.button>
      </div>

      <div className="mt-20 relative">
        <motion.div 
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="text-8xl md:text-9xl opacity-10"
        >
          <AlertTriangle size={120} />
        </motion.div>
      </div>
    </motion.div>
  );
};
