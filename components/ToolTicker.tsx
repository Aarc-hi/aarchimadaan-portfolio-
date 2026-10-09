import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Tool {
  name: string;
  icon: string;
}

const TOOLS: Tool[] = [
  { name: 'Figma', icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/figma.svg' },
  { name: 'InDesign', icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobeindesign.svg' },
  { name: 'Photoshop', icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobephotoshop.svg' },
  { name: 'Illustrator', icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/adobeillustrator.svg' },
  { name: 'Blender', icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/blender.svg' },
  { name: 'Procreate', icon: '/icons/procreate-mark.png' },
  { name: 'Claude', icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/claude.svg' },
];

const HOLD_MS = 1600;

export const ToolTicker: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % TOOLS.length);
    }, HOLD_MS);
    return () => clearInterval(id);
  }, []);

  const tool = TOOLS[index];

  return (
    <div className="w-[104px] h-[104px] min-[1152px]:w-[140px] min-[1152px]:h-[140px] bg-paper shadow-[0_8px_24px_rgba(0,0,0,0.08)] rounded-2xl p-3 min-[1152px]:p-4 flex flex-col overflow-hidden">
      <span className="font-sans text-[10px] tracking-wide opacity-50">Tools</span>
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col items-center gap-1.5"
          >
            <div
              role="img"
              aria-label={tool.name}
              className="w-10 h-10 min-[1152px]:w-12 min-[1152px]:h-12 bg-cobalt"
              style={{
                WebkitMaskImage: `url(${tool.icon})`,
                maskImage: `url(${tool.icon})`,
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
              }}
            />
            <span className="font-sans text-[10px] text-cobalt">{tool.name}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
