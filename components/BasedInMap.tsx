import React from 'react';
import { motion, Variants } from 'framer-motion';

// Noida's position inside public/images/delhi-ncr-outline.svg (viewBox -2 -2 84.5 104), as a share of the image.
const PIN_LEFT = '63.2%';
const PIN_TOP = '44.6%';

const pinVariants: Variants = {
  hidden: { y: -46, opacity: 0 },
  show: {
    y: [-46, 0, -5, 0],
    opacity: 1,
    transition: { duration: 0.85, times: [0, 0.5, 0.75, 1], ease: ['easeIn', 'easeOut', 'easeIn'], opacity: { duration: 0.15 } },
  },
};

const rippleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.2 },
  show: {
    opacity: [0, 0.7, 0],
    scale: [0.2, 1.4, 1.8],
    transition: { duration: 0.6, delay: 0.42, ease: 'easeOut' },
  },
};

export const BasedInMap: React.FC = () => (
  <div className="w-[104px] h-[104px] min-[1152px]:w-[140px] min-[1152px]:h-[140px] group bg-paper shadow-[0_8px_24px_rgba(0,0,0,0.08)] rounded-2xl relative overflow-hidden">
    <span className="sr-only">Based in Delhi NCR</span>

    <div className="absolute inset-0 grid place-items-center">
     <div className="relative h-[62px] min-[1152px]:h-[92px] transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:[transform:translateX(-24px)_scale(0.62)] min-[1152px]:group-hover:[transform:translateX(-29px)_scale(0.66)]">
      <img src="/images/delhi-ncr-outline.svg" alt="" aria-hidden="true" className="block h-full w-auto" />

      <div className="absolute" style={{ left: PIN_LEFT, top: PIN_TOP, transform: 'translate(-50%, -100%)' }}>
        <motion.div
          className="relative w-3.5 h-[21px]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.5, margin: '0px 0px -15% 0px' }}
        >
          <motion.span
            aria-hidden="true"
            variants={rippleVariants}
            className="absolute left-1/2 bottom-0 block w-4 h-1.5 -ml-2 -mb-0.5 rounded-full border border-cobalt"
          />
          <motion.svg aria-hidden="true" viewBox="-4 -12 8 12" variants={pinVariants} className="relative block w-full h-full text-cobalt">
            <path d="M0 0 C-2.2 -3.2 -4 -5.4 -4 -8 A4 4 0 1 1 4 -8 C4 -5.4 2.2 -3.2 0 0Z" fill="currentColor" />
            <circle cx="0" cy="-8" r="1.5" fill="#FFFDF5" />
          </motion.svg>
        </motion.div>
      </div>
     </div>
    </div>

    <div
      aria-hidden="true"
      className="absolute right-3 top-1/2 w-[42px] min-[1152px]:right-4 min-[1152px]:w-[52px] -translate-y-1/2 translate-x-3 opacity-0 transition-[opacity,transform] duration-500 delay-100 ease-out group-hover:translate-x-0 group-hover:opacity-100"
    >
      <span className="block font-sans text-[8px] min-[1152px]:text-[10px] tracking-wide opacity-50 leading-none">Based in</span>
      <span className="block font-display text-[13px] min-[1152px]:text-[17px] leading-[1.05] tracking-tight mt-1">
        Delhi
        <br />
        NCR
      </span>
    </div>
  </div>
);
