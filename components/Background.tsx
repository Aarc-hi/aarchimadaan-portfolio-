import React from 'react';

export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Static square grid — runs the full height; the opaque nav bar sits above it */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#8888_1px,transparent_1px),linear-gradient(to_bottom,#8888_1px,transparent_1px)] opacity-[0.23]"
        style={{ backgroundSize: '6.25vh 6.25vh', backgroundPosition: 'right 3.125vh' }}
      />
    </div>
  );
};
