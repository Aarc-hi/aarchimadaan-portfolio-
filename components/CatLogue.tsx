import React, { useEffect, useState } from 'react';

interface CatPhoto {
  src: string;
  alt: string;
  position: string;
}

const CATS: CatPhoto[] = [
  { src: '/images/cat.jpg', alt: 'A ginger cat being petted', position: 'center 30%' },
  { src: '/images/cats/cat-1.jpg', alt: 'Aarchi with a white cat', position: '55% center' },
  { src: '/images/cats/cat-2.jpg', alt: 'A ginger cat lounging on a metal shelf', position: 'center 50%' },
  { src: '/images/cats/cat-3.jpg', alt: 'A white and tabby cat on a covered scooter', position: 'center 50%' },
  { src: '/images/cats/cat-4.jpg', alt: 'A tabby cat on flower-covered pavement', position: 'center 50%' },
  { src: '/images/cats/cat-5.jpg', alt: 'A white cat sitting upright', position: 'center 45%' },
  { src: '/images/cats/cat-6.jpg', alt: 'A white and tabby cat asleep', position: '60% center' },
  { src: '/images/cats/cat-7.jpg', alt: 'A grey cat looking up', position: '40% 50%' },
];

const FLIP_MS = 140;

export const CatLogue: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    CATS.forEach((c) => {
      const img = new Image();
      img.src = c.src;
    });
  }, []);

  useEffect(() => {
    if (!hovered) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % CATS.length), FLIP_MS);
    return () => clearInterval(id);
  }, [hovered]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-[224px] h-[224px] min-w-0 shrink min-[1152px]:w-[304px] min-[1152px]:h-[304px] min-[1152px]:flex-none min-[1152px]:col-start-1 min-[1152px]:row-start-1 min-[1152px]:row-span-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden"
    >
      {CATS.map((c, i) => (
        <img
          key={c.src}
          src={c.src}
          alt={i === index ? c.alt : ''}
          aria-hidden={i === index ? undefined : true}
          className={`absolute inset-0 w-full h-full object-cover ${i === index ? 'opacity-100' : 'opacity-0'}`}
          style={{ objectPosition: c.position }}
          draggable={false}
        />
      ))}

      <span className="absolute left-3 bottom-3 bg-paper rounded-full px-3 py-1 font-display text-xs min-[1152px]:text-sm tracking-tight shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
        cat-a-logue
      </span>
    </div>
  );
};
