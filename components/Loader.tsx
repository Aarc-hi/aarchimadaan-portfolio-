import React, { useEffect, useState } from 'react';

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
                className="flex-1 bg-[#FFFDF5] relative overflow-hidden"
            />
        ))}

        {/* Content Overlay - Dark Text for Light Theme */}
        <div className="absolute inset-0 text-[#1A1A1A]">
            {/* Bottom: the loading bar, the full width of the page */}
            <div className="absolute bottom-8 md:bottom-16 left-8 right-8 md:left-16 md:right-16">
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
