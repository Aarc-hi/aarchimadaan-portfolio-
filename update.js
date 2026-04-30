const fs = require('fs');
const file = 'c:/Users/Admin/.gemini/VERCEL PORTFOLIO/aarchimadaan/aarchimadaan-main/App.tsx';
let code = fs.readFileSync(file, 'utf8');

// Change 02: Interaction Word
code = code.replace(
  'className="text-stroke-thick md:text-stroke hover:text-ink dark:hover:text-ink-light transition-colors duration-500"',
  'style={{ color: "transparent", WebkitTextStroke: "1.5px currentColor" }} className="transition-colors duration-500 hover:text-ink dark:hover:text-ink-light cursor-default select-none"'
);

// Change 07: Works Page Typography
code = code.replace(
  'className="text-5xl md:text-8xl font-display font-black uppercase tracking-tighter text-ink dark:text-ink-light group-hover:text-white transition-colors duration-300"',
  'className="text-3xl md:text-6xl font-display font-black uppercase tracking-tighter text-ink dark:text-ink-light group-hover:text-white transition-colors duration-300"'
);

// Change 09: Connect Page Icons
const linkedinOrig = '<a href="https://www.linkedin.com/in/aarchi-madaan-4634a32b5/" className="text-2xl font-bold hover:text-cobalt transition-colors">LinkedIn Profile ↗</a>';
const linkedinNew = `<div className="flex flex-row gap-4 mt-2">
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="border-2 border-black dark:border-white p-2 shadow-hard-sm hover:bg-cobalt hover:text-white hover:border-cobalt transition-all duration-200 inline-flex items-center justify-center w-[48px] h-[48px]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="border-2 border-black dark:border-white p-2 shadow-hard-sm hover:bg-cobalt hover:text-white hover:border-cobalt transition-all duration-200 inline-flex items-center justify-center w-[48px] h-[48px]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer" className="border-2 border-black dark:border-white p-2 shadow-hard-sm hover:bg-cobalt hover:text-white hover:border-cobalt transition-all duration-200 inline-flex items-center justify-center w-[48px] h-[48px]">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M7.803 5.163c.424 0 .813.033 1.17.1.356.067.665.185.926.352.26.168.464.392.61.674.146.28.22.625.22 1.033 0 .444-.1.814-.3 1.112-.2.297-.494.54-.882.726.535.154.935.424 1.2.81.265.385.397.85.397 1.393 0 .45-.086.838-.258 1.163a2.4 2.4 0 01-.71.82 3.14 3.14 0 01-1.06.485 4.8 4.8 0 01-1.29.162H3V5.163h4.803zm-.27 3.988c.385 0 .7-.092.944-.277.244-.184.367-.47.367-.857 0-.22-.04-.403-.12-.546a.9.9 0 00-.322-.332 1.37 1.37 0 00-.468-.167 2.78 2.78 0 00-.558-.05H5.18v2.23h2.354zm.143 4.17c.208 0 .407-.022.597-.064.19-.043.358-.112.503-.208a1.07 1.07 0 00.35-.39c.087-.162.13-.368.13-.617 0-.49-.136-.84-.407-1.05-.271-.21-.633-.315-1.085-.315H5.18v2.643h2.496zM20.556 8.66h-5.39v-.853c0-.35.09-.606.27-.767.18-.16.42-.24.72-.24h3.53V5.5h-4.25c-.93 0-1.63.24-2.1.72-.47.48-.7 1.15-.7 2.01v5.54c0 .87.24 1.55.72 2.04.48.49 1.18.73 2.08.73h4.12v-1.3h-3.58c-.3 0-.54-.08-.72-.24-.18-.16-.27-.41-.27-.76v-1.67h5.39V8.66h.18zm-1.83 2.39h-3.56v-1.54h3.56v1.54z"/></svg>
                        </a>
                        <a href="#" target="_blank" rel="noopener noreferrer" className="border-2 border-black dark:border-white p-2 shadow-hard-sm hover:bg-cobalt hover:text-white hover:border-cobalt transition-all duration-200 inline-flex items-center justify-center w-[48px] h-[48px]">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.523 0 10-4.477 10-10S17.523 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"/></svg>
                        </a>
                     </div>`;
code = code.replace(linkedinOrig, linkedinNew);

// Change 06: Volunteer Tag
const expRoleOrig = '<h3 className="text-3xl md:text-5xl font-display font-bold uppercase mb-1 leading-none">\n                        {exp.role}\n                    </h3>';
const expRoleNew = `<h3 className="text-3xl md:text-5xl font-display font-bold uppercase mb-1 leading-none flex items-center gap-4">
                        {exp.role}
                        {exp.id === 'vol1' ? <span className="bg-cobalt text-white text-xs px-2 py-1 shadow-hard-sm uppercase tracking-widest hidden md:inline-block">Volunteer</span> : null}
                    </h3>`;
code = code.replace(expRoleOrig, expRoleNew);


fs.writeFileSync(file, code);
