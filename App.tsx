import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ArrowUpRight, Zap } from 'lucide-react';
import { ViewState } from './types';
import { EXPERIENCES, PROJECTS } from './data';
import { TopNav } from './components/TopNav';
import { Loader } from './components/Loader';
import { ProjectDetailView } from './components/ProjectDetailView';
import { NotFoundView } from './components/NotFoundView';
import Aarchi from './assets/aarchi.jpg';
import { MascotHero, HeroSpacer } from './components/MascotHero';
import { WorksStrip } from './components/WorksStrip';
import { WorksPage } from './components/WorksPage';
import { HomeFooter } from './components/HomeFooter';
import { useHomeSnap } from './components/useHomeSnap';
import { useIsAtOrPast } from './components/useIsAtOrPast';
import { ToolTicker } from './components/ToolTicker';
import { CustomCursor } from './components/CustomCursor';
import { SpotifyCode } from './components/SpotifyCode';
import { BasedInMap } from './components/BasedInMap';
import { CatLogue } from './components/CatLogue';
import { AlbumStrip } from './components/AlbumStrip';
import { ContactView } from './components/ContactView';

const PLAYLIST_URL = 'https://open.spotify.com/playlist/098sNOxCkIM7XVHLDCM9TL';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "circOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
};

// Every page has its own address (/, /about, /work, /work/pawly, /contact), so the browser's back and forward buttons and shared links work.
const slugOf = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const pathFor = (view: ViewState, projectId: string | null): string => {
  if (view === 'identity') return '/about';
  if (view === 'PROJECTS') return '/work';
  if (view === 'CONTACT') return '/contact';
  if (view === 'project-detail' && projectId) {
    const p = PROJECTS.find((x) => x.id === projectId);
    if (p) return `/work/${slugOf(p.title)}`;
  }
  return view === '404' ? '/404' : '/';
};
const parsePath = (pathname: string): { view: ViewState; project: string | null } => {
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  if (parts.length === 0) return { view: 'HOME', project: null };
  if (parts[0] === 'about' && parts.length === 1) return { view: 'identity', project: null };
  if (parts[0] === 'contact' && parts.length === 1) return { view: 'CONTACT', project: null };
  if (parts[0] === 'work' && parts.length === 1) return { view: 'PROJECTS', project: null };
  if (parts[0] === 'work' && parts.length === 2) {
    const slug = parts[1] === 'sitright' ? 'alignr' : parts[1];   // the project's old name still opens it
    const p = PROJECTS.find((x) => slugOf(x.title) === slug);
    if (p) return { view: 'project-detail', project: p.id };
  }
  return { view: '404', project: null };
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>(() => parsePath(window.location.pathname).view);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(() => parsePath(window.location.pathname).project);
  const worksRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const [heroReady, setHeroReady] = useState(false);

  useHomeSnap(view === 'HOME', heroReady, worksRef);
  // From the Selected Works strip down to the footer the nav stays visible the whole time,
  // whichever way the page last scrolled — everywhere else it reacts to scroll direction.
  const showNavAtWorks = useIsAtOrPast(worksRef, view === 'HOME');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  // State -> address bar: a page change adds a history entry (nothing is added when the address already matches, e.g. after back).
  useEffect(() => {
    const path = pathFor(view, selectedProject);
    if (window.location.pathname !== path) window.history.pushState(null, '', path);
  }, [view, selectedProject]);

  // Back / forward -> state.
  useEffect(() => {
    const onPop = () => {
      const { view: v, project } = parsePath(window.location.pathname);
      setView(v);
      setSelectedProject(project);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    const p = PROJECTS.find((x) => x.id === selectedProject);
    document.title = view === 'project-detail' && p ? `${p.title} | Aarchi Madaan` : 'Aarchi Madaan | Interaction Designer';
  }, [view, selectedProject]);

  return (
    <>
      <CustomCursor />
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            exit={{ y: '-100vh' }}
            transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
            className="fixed inset-0 z-[100]"
          >
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && (
    <div className="min-h-screen relative font-sans selection:bg-cobalt selection:text-white">

      <TopNav currentView={view} setView={setView} forceShown={showNavAtWorks} />

      <MascotHero isHome={view === 'HOME'} onHome={() => setView('HOME')} onIntroRevealed={() => setHeroReady(true)} forceHidden={view === 'CONTACT'} forceShown={showNavAtWorks} />

      <main className="relative z-10 w-full min-h-screen pt-32 pb-32 px-4 md:px-12 flex flex-col items-center">
        <AnimatePresence mode="wait">

          {/* HOME VIEW */}
          {view === 'HOME' && (
            <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-7xl flex flex-col justify-center min-h-[60vh]">
               <HeroSpacer />
               <WorksStrip ref={worksRef} setView={setView} setSelectedProject={setSelectedProject} footerRef={footerRef} />
               <HomeFooter ref={footerRef} />
            </motion.div>
          )}

          {/* MERGED IDENTITY VIEW */}
          {view === 'identity' && (
            <motion.div key="identity" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full relative">

              {/* IDENTITY SECTION */}
              <div id="identity-section" className="pb-16 md:pb-24 pr-6 md:pr-12 max-w-6xl mx-auto w-full">
                <div className="grid md:grid-cols-[auto_1fr] gap-[6.25vh] items-end">
                   <div className="order-1 md:order-1 flex justify-start pl-6 md:pl-12">
                      <div className="w-full max-w-xs">
                          <div className="aspect-[3/4] overflow-hidden">
                             <img src={Aarchi} alt="Portrait" className="w-full h-full object-cover object-[center_75%] scale-[1.7]" />
                          </div>
                      </div>
                   </div>
                   <div className="order-2 md:order-2 pl-6 md:pl-0">
                      <div className="text-xs md:text-sm font-sans leading-relaxed space-y-6">
                         <p className="text-cobalt italic text-base md:text-xl">Hi, I'm Aarchi.</p>
                         <p>
                           I'm an <span className="text-cobalt italic">interaction designer</span> who can never stick to just one look. One day I'm all quiet and minimal, the next loud and messy, and I love figuring out what makes each <span className="text-cobalt italic">design language</span> work. It all started with <span className="text-cobalt italic">illustrations</span>, and honestly I still doodle whenever my brain needs a break.
                         </p>
                         <p>
                           What gets me going is <span className="text-cobalt italic">how something behaves</span>, not just how it looks. If someone figures it out without thinking, I've done my job. When I sit down to work, I put my <span className="text-cobalt italic">music</span> on and lose track of time, so if you need a <span className="text-cobalt italic">music recommendation</span>, I'm your person.
                         </p>
                         <p>
                           Off the clock, you'll find me with a <span className="text-cobalt italic">coffee</span> at sunset, probably petting a <span className="text-cobalt italic">cat</span>.
                         </p>
                      </div>
                   </div>
                </div>
              </div>

              {/* BENTO SECTION */}
              <div id="bento-section" className="pb-16 md:pb-24 px-6 md:px-12 w-full max-w-6xl mx-auto">
                <div className="grid grid-cols-2 min-[1152px]:grid-cols-[304px_140px_1fr] gap-4 min-[1152px]:gap-6 auto-rows-[minmax(140px,auto)]">
                  <div className="col-span-2 min-[1152px]:contents flex gap-4">
                    <CatLogue />

                    <div className="flex flex-col gap-4 min-[1152px]:gap-6 min-[1152px]:col-start-2 min-[1152px]:row-start-1 min-[1152px]:row-span-2">
                      <ToolTicker />

                      <BasedInMap />
                    </div>
                  </div>

                  <div className="col-span-2 row-span-2 min-[1152px]:col-span-1 min-[1152px]:col-start-3 min-[1152px]:row-start-2 bg-paper shadow-[0_8px_24px_rgba(0,0,0,0.08)] rounded-2xl p-6 md:p-8 flex flex-col">
                    <span className="font-sans text-xs tracking-wide opacity-50 mb-2">Experience</span>
                    <div className="flex flex-col">
                      {EXPERIENCES.map((exp, idx) => (
                        <React.Fragment key={exp.id}>
                          {idx > 0 && <div className="h-px bg-black/10" />}
                          <div className="py-3 -mx-4 px-4 rounded-xl transition-colors duration-200 hover:bg-cobalt hover:text-white">
                            <p className="font-display text-base min-[1280px]:text-lg tracking-tight">
                              {exp.company} <span className="opacity-50">— {exp.role}</span>
                            </p>
                            <p className="font-sans text-xs opacity-50 mt-0.5">{exp.period}</p>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <a
                    href={PLAYLIST_URL || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group col-span-2 min-[1152px]:col-start-1 min-[1152px]:row-start-3 h-[140px] bg-paper shadow-[0_8px_24px_rgba(0,0,0,0.08)] rounded-2xl p-4 flex items-stretch gap-4"
                  >
                    <img src="/images/playlist.jpg" alt="Model playlist cover" className="w-[108px] h-[108px] flex-none object-cover rounded-xl" />
                    <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                      <span className="font-sans text-xs tracking-wide opacity-50">Soundtrack</span>
                      <div className="relative h-[52px] [perspective:600px]">
                        <div className="absolute inset-0 flex flex-col justify-end [backface-visibility:hidden] transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] [transform:translateZ(-26px)_rotateX(0deg)_translateZ(26px)] opacity-100 group-hover:[transform:translateZ(-26px)_rotateX(90deg)_translateZ(26px)] group-hover:opacity-0">
                          <p className="font-display text-xl md:text-2xl tracking-tight truncate">Model - playlist</p>
                          <p className="font-sans text-xs opacity-50 mt-0.5">Listen on Spotify</p>
                        </div>
                        <div className="absolute inset-0 flex items-center [backface-visibility:hidden] transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] [transform:translateZ(-26px)_rotateX(-90deg)_translateZ(26px)] opacity-0 group-hover:[transform:translateZ(-26px)_rotateX(0deg)_translateZ(26px)] group-hover:opacity-100">
                          <SpotifyCode className="h-[52px] w-auto max-w-full overflow-visible" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-end py-1">
                      <ArrowUpRight className="w-6 h-6 text-cobalt transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} />                    </div>
                  </a>

                  {/* the top of the third column, above the Experience tile: the strip of album covers, and on its right the Connect tile */}
                  <div className="col-span-2 min-[1152px]:col-span-1 min-[1152px]:col-start-3 min-[1152px]:row-start-1 min-w-0 flex gap-4 min-[1152px]:gap-6 items-stretch">
                    <AlbumStrip />
                    <button
                      onClick={() => setView('CONTACT')}
                      className="group flex-none w-[104px] h-[104px] min-[1152px]:w-[140px] min-[1152px]:h-[140px] bg-cobalt text-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] rounded-2xl p-3 min-[1152px]:p-4 flex flex-col justify-between items-start text-left"
                    >
                      <ArrowUpRight className="self-end w-6 h-6 min-[1152px]:w-7 min-[1152px]:h-7 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} />
                      <span className="font-display text-lg md:text-xl tracking-tight">Connect</span>
                    </button>
                  </div>
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
            <WorksPage key="works" setView={setView} setSelectedProject={setSelectedProject} />
          )}

          {/* The old list of works, kept for now but no longer shown (the Works page above replaced it) */}
          {false && view === 'PROJECTS' && (
            <motion.div key="projects" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full max-w-6xl">
              <div className="mb-12 flex items-baseline gap-4">
                 <h2 className="text-6xl md:text-8xl font-display font-medium tracking-tight">Selected Works</h2>
                 <span className="font-sans text-xl animate-bounce">↓</span>
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
                                <h3 className="text-3xl md:text-5xl font-display font-medium tracking-tight text-ink group-hover:text-white transition-colors duration-300">
                                  {project.title}
                                </h3>
                                <span className="font-sans text-sm md:text-base font-bold whitespace-nowrap group-hover:text-white transition-colors mt-1 md:mt-2">{project.date}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {project.tech.map((t, i) => (
                                    <span key={i} className="text-xs border border-current px-2 py-0.5 rounded-full bg-paper group-hover:border-white group-hover:bg-transparent group-hover:text-white transition-colors">
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
                                <span className="font-sans text-sm opacity-50 md:text-lg mix-blend-exclusion group-hover:text-white group-hover:opacity-100">[ Image — coming soon ]</span>
                            )}
                        </div>
                    </div>

                    <div className="relative z-10 px-4 mt-0 h-0 group-hover:h-auto group-hover:mt-8 overflow-hidden transition-all duration-500">
                        <p className="text-white text-xl md:text-2xl font-sans max-w-3xl leading-tight">
                            {project.description.join(' ')}
                        </p>
                        <div className="mt-6 flex items-center gap-2 text-white font-sans text-sm font-bold tracking-wide">
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

          {/* 404 VIEW */}
          {view === '404' && (
            <NotFoundView setView={setView} />
          )}

        </AnimatePresence>
      </main>

      {view === 'CONTACT' && <ContactView />}
    </div>
      )}
    </>
  );
};

export default App;
