import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { ViewState, NAV_ITEMS } from '../types';

interface FloatingNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({ currentView, setView }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-12 right-6 md:right-12 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-6 flex flex-col items-end gap-3"
            >
              {NAV_ITEMS.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05, type: "spring" }}
                  onClick={() => {
                    setView(item.id);
                    setIsOpen(false);
                  }}
                  whileHover={{ x: -10 }}
                  className={`group relative flex items-center justify-between w-72 px-6 py-4 border-2 border-black dark:border-white transition-all duration-200 shadow-hard
                    ${
                      currentView === item.id
                        ? 'bg-cobalt text-white'
                        : 'bg-paper dark:bg-paper-dark hover:bg-yellow-300 hover:text-black hover:border-black'
                    }
                    `}
                >
                  <span className="font-display font-bold text-lg uppercase tracking-tight">{item.label}</span>
                  <ArrowRight size={20} className={`transform group-hover:translate-x-1 transition-transform ${currentView === item.id ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`} />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="h-16 w-16 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-hard hover:shadow-none transition-all border-2 border-transparent rounded-full"
        >
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </motion.button>
      </div>

      {/* Clean Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>
    </>
  );
};