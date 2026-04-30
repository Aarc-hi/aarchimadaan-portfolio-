import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Moon, Sun, ArrowRight, Sparkles, Star, Zap } from 'lucide-react';
import { ViewState } from './types';
import { EXPERIENCES, PROJECTS, SKILLS } from './data';
import { FloatingNav } from './components/FloatingNav';
import { Loader } from './components/Loader';
import { Background } from './components/Background';
import { ProjectDetailView } from './components/ProjectDetailView';
import Aarchi from './assets/aarchi.jpg';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "circOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
};

const marqueeVariants: Variants = {
  animate: {
    x: [0, "-33.333%"],
    transition: {
      x: { repeat: Infinity, repeatType: "loop", duration: 20, ease: "linear" },
    },
  },
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>('HOME');
  const [darkMode, setDarkMode] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen relative font-sans selection:bg-cobalt selection:text-white">
      <Background />

      <nav className="fixed top-0 left-0 w-full p-6 md:p-10 flex justify-between items-start z-40 mix-blend-difference text-white pointer-events-none">
        <button onClick={() => setView('HOME')} className="flex flex-col items-start group pointer-events-auto">
          <motion.span whileHover={{ scale: 1.1, rotate: -2 }} className="font-display font-black text-2xl tracking-tighter leading-none">
            AARCHI MADAAN
          </motion.span>
          <span className="text-[10px] font-mono bg-white text-black px-1 mt-1 transform group-hover:rotate-2 transition-transform uppercase font-bold tracking-widest"></span>
        </button>
        <button onClick={() => setDarkMode(!darkMode)} className="pointer-events-auto hover:scale-110 transition-transform bg-white text-black p-2 rounded-full">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </nav>

      <FloatingNav currentView={view} setView={setView} />

      <main className="relative z-10 w-full min-h-screen pt-32 pb-32 px-4 md:px-12 flex flex-col items-center">
        <AnimatePresence mode="wait">
          
          {/* HOME VIEW */}
          {view === 'HOME' && (
            <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-7xl flex flex-col justify-center min-h-[60vh]">
               <div className="relative">
                 <div className="relative z-10">
                   <h1 className="text-[14vw] leading-[0.8] font-display font-black tracking-[-0.035em] uppercase mix-blend-exclusion dark:mix-blend-normal">
                     <motion.div 
                       initial={{ x: -100, opacity: 0 }} 
                       animate={{ x: 0, opacity: 1 }}
                       transition={{ duration: 0.4 }}

                       className="cursor-default select-none"
                     >
                       Interaction
                     </motion.div>
                     <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="flex items-center gap-4">
                       <span className="text-cobalt">Designer</span>
                     </motion.div>
                   </h1>
                 </div>
                 
                 <div className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-12 items-end">
                    <div className="md:col-span-6 md:col-start-7 bg-paper/80 dark:bg-paper-dark/80 backdrop-blur-sm p-6 border-2 border-current shadow-hard transform rotate-1 hover:rotate-0 transition-transform duration-300">
                      <p className="text-2xl md:text-4xl font-display font-medium leading-tight mb-6">
                        Hi! I'm Aarchi. I design <span className="underline decoration-wavy decoration-cobalt">experiences</span> that pop, snap, and crackle.
                      </p>
                      
                      <div className="flex gap-4">
                        <motion.button whileHover={{ scale: 1.05, rotate: -2 }} whileTap={{ scale: 0.95 }} onClick={() => setView('PROJECTS')} className="px-8 py-3 bg-cobalt text-white font-mono font-bold text-sm uppercase shadow-hard hover:shadow-none transition-all border-2 border-transparent">
                          See Works
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05, rotate: 2 }} whileTap={{ scale: 0.95 }} onClick={() => setView('CONTACT')} className="px-8 py-3 bg-transparent border-2 border-current font-mono font-bold text-sm uppercase hover:bg-cobalt hover:text-white hover:border-cobalt transition-colors">
                          Say Hello
                        </motion.button>
                      </div>
                    </div>
                 </div>
               </div>
            </motion.div>
          )}

          {/* MERGED IDENTITY VIEW */}
          {view === 'identity' && (
            <motion.div key="identity" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full relative">
              <div className="sticky top-0 z-30 bg-paper dark:bg-paper-dark py-4 flex justify-center gap-16 font-mono text-sm uppercase border-b border-black/10 dark:border-white/10 mb-8 mx-auto w-full">
                 <a href="#identity-section" onClick={(e) => { e.preventDefault(); document.getElementById('identity-section')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-cobalt cursor-pointer">Identity</a>
                 <a href="#arsenal-section" onClick={(e) => { e.preventDefault(); document.getElementById('arsenal-section')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-cobalt cursor-pointer">Arsenal</a>
                 <a href="#timeline-section" onClick={(e) => { e.preventDefault(); document.getElementById('timeline-section')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-cobalt cursor-pointer">Timeline</a>
              </div>

              {/* IDENTITY SECTION */}
              <div id="identity-section" className="py-16 md:py-24 max-w-6xl mx-auto w-full">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                   <div className="order-2 md:order-1 relative">
                      <motion.div animate={{ rotate: 10 }} className="absolute -top-12 -left-12 text-cobalt opacity-20 hidden md:block">
                          <Sparkles size={120} />
                      </motion.div>
                      <div className="space-y-2">
                          <span className="inline-block bg-cobalt text-white px-3 py-1 font-mono text-sm font-bold rotate-2 transform origin-left">02. WHO AM I?</span>
                          <h2 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-[0.9] mb-8">
                            The Architect<br/> of <span className="text-transparent text-stroke-thick">Pixels</span>
                          </h2>
                      </div>
                      <div className="bg-white dark:bg-ink p-8 border-2 border-current shadow-hard text-lg md:text-xl font-medium leading-relaxed rotate-1 hover:rotate-0 transition-transform">
                         <p className="mb-6">
                           I'm a <strong className="text-cobalt">Creative & Detail-Oriented Interaction Designer</strong> with a penchant for breaking grid systems (respectfully). 
                         </p>
                         <p>
                           Proficient in Adobe Creative Suite, UI design, and visual storytelling. My goal? Leverage design skills to create chaos that makes sense.
                         </p>
                      </div>
                      <div className="mt-12 flex gap-4 flex-wrap">
                          <div className="bg-ink dark:bg-ink-light text-paper dark:text-paper-dark px-4 py-2 font-mono text-sm border-2 border-transparent">
                              Bachelor in Design @ Anant National University
                          </div>
                      </div>
                   </div>
                   <div className="order-1 md:order-2 flex justify-center">
                      <div className="relative w-full max-w-md aspect-[3/4]">
                          <div className="absolute inset-0 bg-cobalt translate-x-4 translate-y-4 border-2 border-black dark:border-white"></div>
                          <div className="absolute inset-0 bg-white dark:bg-gray-800 border-2 border-current flex items-center justify-center overflow-hidden">
                             <img src={Aarchi} alt="Portrait" className="absolute inset-0 object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500 opacity-80 hover:opacity-100 mix-blend-multiply dark:mix-blend-normal scale-125 object-center" />
                          </div>
                          <div className="absolute -bottom-6 -right-6 bg-paper dark:bg-paper-dark border-2 border-current px-4 py-2 font-display font-bold text-xl rotate-6 shadow-hard-sm z-20">
                              Based in New Delhi
                          </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* ARSENAL SECTION */}
              <div id="arsenal-section" className="py-16 md:py-24 border-t border-black/10 dark:border-white/10 w-full overflow-hidden">
                 <h2 className="text-center text-4xl font-mono uppercase tracking-widest mb-16">The Arsenal</h2>
                 <div className="relative flex overflow-x-hidden mb-12 bg-cobalt py-6 transform -rotate-2 scale-110">
                   <motion.div className="flex whitespace-nowrap" variants={marqueeVariants} animate="animate">
                     {[...SKILLS.design, ...SKILLS.design, ...SKILLS.design].map((skill, i) => (
                       <span key={i} className="text-6xl md:text-8xl font-display font-black text-white mx-8 uppercase">
                         {skill} <span className="text-transparent text-stroke-thick mx-4">•</span>
                       </span>
                     ))}
                   </motion.div>
                 </div>
                 <div className="relative flex overflow-x-hidden mb-12 bg-ink dark:bg-ink-light py-6 transform rotate-1 scale-110">
                   <motion.div className="flex whitespace-nowrap" animate={{ x: ["-33.333%", 0] }} transition={{ repeat: Infinity, duration: 25, ease: "linear" }}>
                     {[...SKILLS.tools, ...SKILLS.tools, ...SKILLS.tools].map((skill, i) => (
                       <span key={i} className="text-6xl md:text-8xl font-display font-black text-paper dark:text-paper-dark mx-8 uppercase">
                         {skill} <span className="text-transparent text-stroke-thick mx-4">*</span>
                       </span>
                     ))}
                   </motion.div>
                 </div>
                 <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-24 px-4 w-full">
                      <div className="border-2 border-current p-8 shadow-hard transition-all">
                          <h3 className="font-mono text-xl mb-6 uppercase border-b-2 border-current inline-block">Research</h3>
                          <div className="flex flex-wrap gap-3">
                              {SKILLS.research.map(s => (
                                  <span key={s} className="bg-gray-100 dark:bg-gray-800 dark:text-ink px-3 py-1 rounded-md font-medium text-lg hover:scale-105 transition-transform duration-300 inline-block">{s}</span>
                              ))}
                          </div>
                      </div>
                      <div className="border-2 border-current p-8 shadow-hard transition-all">
                          <h3 className="font-mono text-xl mb-6 uppercase border-b-2 border-current inline-block">Soft Skills</h3>
                          <div className="flex flex-wrap gap-3">
                              {SKILLS.soft.map(s => (
                                  <span key={s} className="bg-gray-100 dark:bg-gray-800 dark:text-ink px-3 py-1 rounded-md font-medium text-lg hover:scale-105 transition-transform duration-300 inline-block">{s}</span>
                              ))}
                          </div>
                      </div>
                 </div>
              </div>

              {/* TIMELINE SECTION */}
              <div id="timeline-section" className="py-16 md:py-24 border-t border-black/10 dark:border-white/10 w-full max-w-4xl mx-auto">
                <div className="text-center mb-16 relative">
                   <h2 className="text-6xl md:text-9xl font-display font-black tracking-tighter uppercase text-transparent text-stroke-thick opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full whitespace-nowrap pointer-events-none">
                      Work History
                   </h2>
                   <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase relative z-10">
                      The Timeline
                   </h2>
                </div>
                <div className="space-y-12">
                  {EXPERIENCES.map((exp, idx) => (
                    <motion.div key={exp.id} initial={{ x: idx % 2 === 0 ? -50 : 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }} className="group relative bg-paper dark:bg-paper-dark border-2 border-current p-8 shadow-hard hover:shadow-hard-lg hover:-translate-y-1 transition-all duration-300">
                      <div className="absolute -top-4 -right-4 bg-cobalt text-white px-4 py-1 font-mono text-sm font-bold rotate-3 group-hover:rotate-6 transition-transform">
                          {exp.period}
                      </div>
                      <h3 className="text-3xl md:text-5xl font-display font-bold uppercase mb-1 leading-none flex items-center gap-4">
                          {exp.role}
                      </h3>
                      <div className="text-xl font-serif italic mb-6 border-b-2 border-current inline-block pb-1">
                          {exp.company}
                      </div>
                      <ul className="space-y-2 font-medium">
                          {exp.points.map((pt, i) => (
                              <li key={i} className="flex items-start gap-3">
                                  <ArrowRight size={16} className="mt-1.5 text-cobalt shrink-0" />
                                  <span>{pt}</span>
                              </li>
                          ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>

              </div>
            </motion.div>
          )}

          {/* PROJECT DETAIL VIEW */}
          {view === 'project-detail' && selectedProject && (
              <ProjectDetailView project={PROJECTS.find(p => p.id === selectedProject)!} setView={setView} setSelectedProject={setSelectedProject} />
          )}

          {/* PROJECTS VIEW */}
          {view === 'PROJECTS' && (
            <motion.div key="projects" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl">
              <div className="mb-12 flex items-baseline gap-4">
                 <h2 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase">Selected Works</h2>
                 <span className="font-mono text-xl animate-bounce">↓</span>
              </div>
              
              <div className="border-t-4 border-current pt-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {PROJECTS.map((project, index) => (
                  <motion.div 
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative border-b-4 border-current py-12 md:py-20 group cursor-pointer overflow-hidden"
                    onClick={() => { setSelectedProject(project.id); setView('project-detail'); }}
                    onMouseEnter={() => setHoveredProject(project.id)}
                    onMouseLeave={() => setHoveredProject(null)}
                  >
                    <div className="absolute inset-0 bg-cobalt translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-in-out z-0"></div>

                    <div className="relative z-10 flex flex-col gap-6 px-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-4">
                                <h3 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tighter text-ink dark:text-ink-light group-hover:text-white transition-colors duration-300">
                                  {project.title}
                                </h3>
                                <span className="font-mono text-sm md:text-base font-bold whitespace-nowrap group-hover:text-white transition-colors mt-1 md:mt-2">{project.date}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {project.tech.map((t, i) => (
                                    <span key={i} className="text-xs border border-current px-2 py-0.5 rounded-full bg-paper dark:bg-paper-dark group-hover:border-white group-hover:bg-transparent group-hover:text-white transition-colors">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="w-full aspect-video border-2 border-black/10 bg-paper-dark/5 flex items-center justify-center pointer-events-none mt-2 transition-all duration-300 overflow-hidden group-hover:border-white/20">
                            {(project.coverImage || project.mockups?.[0] || project.images?.[0] || project.pages?.[0]) ? (
                                <img 
                                    src={encodeURI(project.coverImage || project.mockups?.[0] || project.images?.[0] || project.pages?.[0] || '')} 
                                    alt={`${project.title} cover`} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-90"
                                />
                            ) : (
                                <span className="font-mono text-sm uppercase opacity-50 md:text-lg mix-blend-exclusion dark:mix-blend-normal group-hover:text-white group-hover:opacity-100">[ Image — coming soon ]</span>
                            )}
                        </div>
                    </div>

                    <div className="relative z-10 px-4 mt-0 h-0 group-hover:h-auto group-hover:mt-8 overflow-hidden transition-all duration-500">
                        <p className="text-white text-xl md:text-2xl font-sans max-w-3xl leading-tight">
                            {project.description.join(' ')}
                        </p>
                        <div className="mt-6 flex items-center gap-2 text-white font-mono uppercase text-sm font-bold tracking-widest">
                            <span className="w-8 h-[2px] bg-white"></span>
                            View Case Study
                        </div>
                    </div>

                    <Zap className="absolute right-12 top-1/2 -translate-y-1/2 w-32 h-32 text-transparent stroke-current stroke-1 opacity-0 group-hover:opacity-20 group-hover:rotate-12 transition-all duration-500 pointer-events-none" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* CONTACT VIEW */}
          {view === 'CONTACT' && (
            <motion.div key="contact" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-5xl flex flex-col items-center py-12 md:py-24">
              <div className="text-center mb-16 relative">
                 <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute -top-20 -right-12 md:-right-24 text-[8rem] md:text-[10rem] animate-pulse">
                     🌟
                 </motion.div>
                <h2 className="text-[12vw] leading-[0.8] font-display font-black uppercase tracking-tighter">
                  Let's<br/><span className="text-cobalt">Mingle</span>
                </h2>
              </div>

              <motion.a 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                href="https://mail.google.com/mail/?view=cm&fs=1&to=aarchimadaan@gmail.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-block group cursor-pointer"
                aria-label="Send email via Gmail"
              >
                <div className="absolute inset-0 bg-black dark:bg-white translate-x-4 translate-y-4 rounded-xl transition-transform group-hover:translate-x-5 group-hover:translate-y-5"></div>
                <div className="relative bg-cobalt text-white border-2 border-black dark:border-white px-8 md:px-16 py-8 md:py-10 text-2xl md:text-5xl font-display font-bold tracking-tight rounded-xl group-hover:-translate-y-1 group-hover:-translate-x-1 transition-all duration-300 shadow-xl group-hover:shadow-2xl">
                  <span className="relative z-10 break-all md:break-normal group-hover:text-yellow-300 transition-colors">
                    aarchimadaan@gmail.com
                  </span>
                </div>
              </motion.a>
              
              <div className="mt-16 flex flex-col md:flex-row gap-24 text-center md:text-left">
                 <div className="space-y-2">
                    <span className="font-mono text-xs uppercase opacity-50 block">Call Me Maybe</span>
                    <a href="tel:9289664869" className="text-2xl font-bold hover:text-cobalt transition-colors">+91 9289664869</a>
                 </div>
                 <div className="space-y-2">
                    <span className="font-mono text-xs uppercase opacity-50 block">Stalk Me Professionally</span>
                    <div className="flex flex-row gap-4 mt-2 justify-center md:justify-start">
                        <a href="https://www.instagram.com/sosillybilli.design/" target="_blank" rel="noopener noreferrer" className="border-2 border-black dark:border-white p-2 shadow-hard-sm hover:bg-cobalt hover:text-white hover:border-cobalt transition-all duration-200 inline-flex items-center justify-center w-[48px] h-[48px] group text-ink dark:text-ink-light">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-white"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                        </a>
                        <a href="https://linkedin.com/in/aarchi-madaan-4634a32b5/" target="_blank" rel="noopener noreferrer" className="border-2 border-black dark:border-white p-2 shadow-hard-sm hover:bg-cobalt hover:text-white hover:border-cobalt transition-all duration-200 inline-flex items-center justify-center w-[48px] h-[48px] group text-ink dark:text-ink-light">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-white"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                        </a>
                        <a href="https://behance.net/aarchimadaan" target="_blank" rel="noopener noreferrer" className="border-2 border-black dark:border-white p-2 shadow-hard-sm hover:bg-cobalt hover:text-white hover:border-cobalt transition-all duration-200 inline-flex items-center justify-center w-[48px] h-[48px] group text-ink dark:text-ink-light">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="group-hover:text-white"><path d="M16.969 16.927a2.561 2.561 0 0 0 1.901.677 2.501 2.501 0 0 0 1.531-.475c.362-.235.636-.584.779-.99h2.585a5.091 5.091 0 0 1-1.9 2.896 5.292 5.292 0 0 1-3.091.88 5.839 5.839 0 0 1-2.284-.433 4.871 4.871 0 0 1-1.723-1.211 5.657 5.657 0 0 1-1.08-1.874 7.057 7.057 0 0 1-.383-2.393c-.005-.8.129-1.595.396-2.349a5.313 5.313 0 0 1 5.088-3.604 4.87 4.87 0 0 1 2.376.563c.661.362 1.231.87 1.668 1.485a6.2 6.2 0 0 1 .943 2.133c.194.821.263 1.666.205 2.508h-7.699c-.063.79.184 1.574.688 2.187ZM6.947 4.084a8.065 8.065 0 0 1 1.928.198 4.29 4.29 0 0 1 1.49.638c.418.303.748.711.958 1.182.241.579.357 1.203.341 1.83a3.506 3.506 0 0 1-.506 1.961 3.726 3.726 0 0 1-1.503 1.287 3.588 3.588 0 0 1 2.027 1.437c.464.747.697 1.615.67 2.494a4.593 4.593 0 0 1-.423 2.032 3.945 3.945 0 0 1-1.163 1.413 5.114 5.114 0 0 1-1.683.807 7.135 7.135 0 0 1-1.928.259H0V4.084h6.947Zm-.235 12.9c.308.004.616-.029.916-.099a2.18 2.18 0 0 0 .766-.332c.228-.158.411-.371.534-.619.142-.317.208-.663.191-1.009a2.08 2.08 0 0 0-.642-1.715 2.618 2.618 0 0 0-1.696-.505h-3.54v4.279h3.471Zm13.635-5.967a2.13 2.13 0 0 0-1.654-.619 2.336 2.336 0 0 0-1.163.259 2.474 2.474 0 0 0-.738.62 2.359 2.359 0 0 0-.396.792c-.074.239-.12.485-.137.734h4.769a3.239 3.239 0 0 0-.679-1.785l-.002-.001Zm-13.813-.648a2.254 2.254 0 0 0 1.423-.433c.399-.355.607-.88.56-1.413a1.916 1.916 0 0 0-.178-.891 1.298 1.298 0 0 0-.495-.533 1.851 1.851 0 0 0-.711-.274 3.966 3.966 0 0 0-.835-.073H3.241v3.631h3.293v-.014ZM21.62 5.122h-5.976v1.527h5.976V5.122Z"/></svg>
                        </a>
                        <a href="https://dribbble.com/Aarchi_" target="_blank" rel="noopener noreferrer" className="border-2 border-black dark:border-white p-2 shadow-hard-sm hover:bg-cobalt hover:text-white hover:border-cobalt transition-all duration-200 inline-flex items-center justify-center w-[48px] h-[48px] group text-ink dark:text-ink-light">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="group-hover:text-white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.523 0 10-4.477 10-10S17.523 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"/></svg>
                        </a>
                    </div>
                 </div>
              </div>
              <div className="mt-24 text-center">
                <a href="/resume.pdf" target="_blank" className="inline-flex items-center gap-3 px-8 py-4 border-2 border-black dark:border-white font-display font-bold text-sm uppercase tracking-widest shadow-hard hover:shadow-none hover:bg-cobalt hover:text-white transition-all duration-200">
                    Download Resume <ArrowRight size={20} />
                </a>
              </div>

              <footer className="mt-32 w-full flex justify-between border-t-2 border-current pt-6 font-mono text-xs uppercase tracking-widest opacity-50">
                <span>New Delhi, India</span>
                <span className="animate-pulse">Open to work</span>
                <span>© 2025 Raw Studio</span>
              </footer>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;