import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewState, Project } from '../types';
import { PROJECTS } from '../data';
import { PawlyCaseStudy, PAWLY_NAV } from './pawly/PawlyCaseStudy';
import { Marked } from './Marked';

interface ProjectDetailViewProps {
  project: Project;
  setView: (view: ViewState) => void;
  setSelectedProject: (id: string | null) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, setView, setSelectedProject }) => {
  const [activeTab, setActiveTab] = useState(project.tldr ? 'tldr' : project.id === 'p4' ? 'what' : 'overview');
  const scrollRef = useRef<HTMLElement>(null);

  const mockups = project.mockups || [];
  const standardImages = project.images || [];
  const pages = project.pages || [];
  const allImages = [...mockups, ...standardImages, ...pages];

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  // Thela Thaila Thikana opens straight into its research, so it skips the Overview and Concept blurbs.
  // Pawly has its own set of sections (components/pawly), so it skips the generic ones too.
  const isPawly = project.id === 'p4';
  const showIntro = !isPawly;
  // ...and shows its research question as the heading above its findings, with its team, role and date beside the title.
  const questionInHeader = false; // (the Thela research layout is not part of this push)

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex < allImages.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [project.id]);

  // This page scrolls inside its own column, so hide the page scrollbar behind it while it's open.
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = prevHtml; document.body.style.overflow = prevBody; };
  }, []);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // If a section is intersecting the top portion of the container
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        });
      },
      {
        root: scrollContainer,
        rootMargin: '-10% 0px -80% 0px', // Detect when section is near the top 10-20%
        threshold: 0
      }
    );

    const sections = scrollContainer.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [project.id]);

  const currentIndex = PROJECTS.findIndex(p => p.id === project.id);
  const prevProject = PROJECTS[currentIndex === 0 ? PROJECTS.length - 1 : currentIndex - 1];
  const nextProject = PROJECTS[currentIndex === PROJECTS.length - 1 ? 0 : currentIndex + 1];

  const handlePrev = () => {
    setSelectedProject(prevProject.id);
  };

  const handleNext = () => {
    setSelectedProject(nextProject.id);
  };

  const handleClose = () => {
    setSelectedProject(null);
    setView('PROJECTS');
  };

  // Side nav: collapsed to a slim rail at the left edge, slides out when the cursor comes near.
  const [navOpen, setNavOpen] = useState(false);
  const navTimer = useRef<number | null>(null);
  const openNav = () => {
    if (navTimer.current) window.clearTimeout(navTimer.current);
    setNavOpen(true);
  };
  const closeNav = () => {
    if (navTimer.current) window.clearTimeout(navTimer.current);
    navTimer.current = window.setTimeout(() => setNavOpen(false), 250);
  };
  useEffect(() => () => { if (navTimer.current) window.clearTimeout(navTimer.current); }, []);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setNavOpen(false);
  };

  // `sub` items are the research chapters, listed indented under "Findings".
  const tldrNav = project.tldr ? [{ id: 'tldr', label: 'tl;dr' }] : [];
  const navItems: { id: string; label: string; sub?: boolean }[] = isPawly ? [...tldrNav, ...PAWLY_NAV] : [
    ...tldrNav,
    ...(showIntro ? [{ id: 'overview', label: 'Overview' }, { id: 'concept', label: 'Concept' }] : []),
    { id: 'problem', label: project.researchQuestion ? 'Research' : 'Problem' },
    ...(project.youtubeId ? [{ id: 'prototype', label: 'Prototype' }] : []),
    ...(project.videoSrc ? [{ id: 'video', label: 'Video Walkthrough' }] : []),
    ...(allImages.length > 0 ? [{ id: 'images', label: 'Visuals' }] : []),
    { id: 'details', label: 'Tech Stack' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[60] bg-paper pt-24 pb-8"
      style={{ display: 'flex', justifyContent: 'center' }}
    >
      <div className="w-full px-3 md:px-5 flex flex-col md:flex-row" style={{ height: '100%', overflow: 'hidden' }}>
        {/* LEFT rail — a slim set of ticks at the edge; the full nav slides out when the cursor comes near */}
        <div
          className="hidden md:block absolute left-0 top-24 bottom-8 z-20"
          style={{ width: navOpen ? '190px' : '36px' }}
          onMouseEnter={openNav}
          onMouseLeave={closeNav}
          onFocusCapture={openNav}
          onBlurCapture={closeNav}
        >
          <button type="button" aria-label="Show project navigation" onClick={() => setNavOpen((o) => !o)}
            className="absolute left-0 top-0 bottom-0 w-9 flex flex-col items-start justify-center gap-4 pl-3 cursor-pointer">
            {navItems.map((n) => (
              <span key={n.id} className={`block h-0.5 rounded-full transition-all duration-300 ${activeTab === n.id ? 'w-5 bg-cobalt' : 'w-3 bg-black/25'}`} />
            ))}
          </button>

          <aside className={`absolute left-0 top-0 bottom-0 w-[184px] bg-paper border-r-2 border-black/10 shadow-[8px_0_24px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-out ${navOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'}`}>
            <div className="flex flex-col gap-3 font-sans text-[11px] tracking-wide pl-3 pr-3 py-10 h-full overflow-y-auto no-scrollbar">
              <button onClick={handleClose} className="hover:text-cobalt text-left mb-10 flex items-center gap-2 font-black cursor-pointer transition-colors text-ink group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform shrink-0" />
                <span className="font-black">Back to Works</span>
              </button>
              {navItems.map((n) => (
                <a key={n.id} href={`#${n.id}`} onClick={(e) => { e.preventDefault(); goTo(n.id); }}
                  className={`border-l-2 py-2 transition-all duration-300 ease-out ${n.sub ? 'pl-7 -mt-2 py-1.5 text-[11px]' : 'pl-4'} ${activeTab === n.id ? 'border-cobalt text-cobalt bg-cobalt/5' : 'border-transparent text-ink/70 hover:border-black/50'}`}>{n.label}</a>
              ))}
            </div>
          </aside>
        </div>

        {/* Mobile Back Button */}
        <div className="md:hidden w-full shrink-0 mb-2 pt-4 px-1 flex justify-between items-center z-50">
          <button onClick={handleClose} className="hover:text-cobalt flex items-center gap-2 font-bold text-lg cursor-pointer transition-colors">
            <ArrowLeft size={20} /> Back
          </button>
        </div>

        {/* RIGHT column — this is the ONLY thing that scrolls */}
        <main
          ref={scrollRef}
          onScroll={(e) => {
            const target = e.target as HTMLElement;
            if (Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 20) {
              setActiveTab(isPawly ? PAWLY_NAV[PAWLY_NAV.length - 1].id : 'details');
            }
          }}
          className="no-scrollbar px-3 pt-4 pb-10 md:pt-8 md:pl-14 md:pr-14"
          style={{ flex: 1, minHeight: 0, minWidth: 0, overflowY: 'auto' }}
        >
          <div className="max-w-6xl mx-auto">
          <div className={`mb-24 flex flex-col gap-8 ${questionInHeader ? 'md:flex-row md:items-end md:justify-between' : ''}`}>
            <div className="flex flex-col gap-6 shrink-0">
              <h1 className="text-5xl md:text-8xl capitalize w-min text-left font-display font-medium tracking-tight leading-[0.9] text-ink">
                {project.title}
              </h1>
              {!questionInHeader && (
              <div className="flex flex-wrap gap-4 font-sans font-bold tracking-wide text-lg">
                <span className="bg-cobalt text-white px-3 py-1">{project.year}</span>
                <span className="border-2 border-black bg-paper px-3 py-1 text-ink">{project.category}</span>
              </div>
              )}
            </div>
            {/* Thela Thaila Thikana lists its team, role and date as plain lines, pushed to the right margin along the title's bottom edge */}
            {questionInHeader && (
              <div className="flex flex-col gap-4 font-sans text-lg text-left md:pb-2">
                <div><p className="text-[11px] tracking-wide opacity-60 mb-0.5">Group</p><p>6 people</p></div>
                <div><p className="text-[11px] tracking-wide opacity-60 mb-0.5">My role</p><p>Research and creatives</p></div>
                <div><p className="text-[11px] tracking-wide opacity-60 mb-0.5">Date</p><p>March 2025</p></div>
              </div>
            )}
          </div>

          {/* TL;DR: the first thing on every project page */}
          {project.tldr && (
            <section id="tldr" className={project.tldrImage ? 'scroll-mt-32 mb-24 sm:-mt-16' : 'scroll-mt-32 mb-24 md:mb-32'}>
              <div className={project.tldrImage ? 'grid gap-10 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] sm:gap-10 lg:grid-cols-2 lg:gap-16 items-end' : ''}>
                <div className="sm:-mb-2">
                  <h2 className="font-display font-normal tracking-wide text-lg leading-[1.1] mb-8 pb-3 border-b border-black/15 text-ink/50">tl;dr</h2>
                  <p className="font-sans text-lg leading-relaxed max-w-2xl"><Marked text={project.tldr} /></p>
                </div>
                {/* the full orange cat: the front panel of the pack, on the right of the tl;dr */}
                {project.tldrImage && <img src={project.tldrImage} alt={`${project.title}, the front of the pack`} className="block justify-self-center sm:-mt-[110px]" style={{ width: 'min(100%, 325px, calc(62vh * 0.7738))', height: 'auto' }} />}
              </div>
            </section>
          )}

          {showIntro && (<>
          <section id="overview" className="scroll-mt-32 mb-32">
            <h2 className="font-display font-normal tracking-wide text-lg leading-[1.1] mb-8 pb-3 border-b border-black/15 text-ink/50">Overview</h2>
            <div className="text-lg font-sans max-w-3xl leading-relaxed space-y-6">
              {project.description.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          <section id="concept" className="scroll-mt-32 mb-32">
            <h2 className="font-display font-normal tracking-wide text-lg leading-[1.1] mb-8 pb-3 border-b border-black/15 text-ink/50">Concept</h2>
            <div className="text-lg font-sans max-w-3xl leading-relaxed space-y-6">
              <p>{project.concept || "Design conceptualization focusing on user experience and visual narrative."}</p>
            </div>
          </section>

          </>)}

          {isPawly && <PawlyCaseStudy />}

          {!questionInHeader && !isPawly && (
          <section id="problem" className="scroll-mt-32 mb-32">
            <h2 className="font-display font-normal tracking-wide text-lg leading-[1.1] mb-8 pb-3 border-b border-black/15 text-ink/50">
              {project.researchQuestion ? 'Research Question' : 'Problem Statement'}
            </h2>
            <div className="text-lg font-sans max-w-3xl leading-relaxed space-y-6">
              <p>{project.researchQuestion || project.problemStatement || "Project challenge and user pain points analysis."}</p>
            </div>
          </section>
          )}

          {project.youtubeId && (
            <section id="prototype" className="scroll-mt-32 mb-32">
              <h2 className="font-display font-normal tracking-wide text-lg leading-[1.1] mb-8 pb-3 border-b border-black/15 text-ink/50">Prototype</h2>
              <div className="w-full aspect-video border-2 border-black/20 overflow-hidden bg-black shadow-hard">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${project.youtubeId}`}
                  title={`${project.title} Prototype Video`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </section>
          )}

          {project.videoSrc && (
            <section id="video" className="scroll-mt-32 mb-32">
              <h2 className="font-display font-normal tracking-wide text-lg leading-[1.1] mb-8 pb-3 border-b border-black/15 text-ink/50">Video Walkthrough</h2>
              <div className="w-full aspect-video border-2 border-black/20 overflow-hidden bg-black shadow-hard">
                <video
                  controls
                  className="w-full h-full object-contain"
                  preload="metadata"
                >
                  <source src={encodeURI(project.videoSrc || '')} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </section>
          )}

          {!isPawly && (standardImages.length > 0 || mockups.length > 0 || pages.length > 0) && (
            <section id="images" className="scroll-mt-32 mb-32">
              <h2 className="font-display font-normal tracking-wide text-lg leading-[1.1] mb-8 pb-3 border-b border-black/15 text-ink/50">Visuals</h2>
              <div className="flex flex-col gap-12">
                {/* Large Mockups */}
                {mockups.length > 0 && (
                  <div className="grid grid-cols-1 gap-8">
                    {mockups.map((imgSrc, i) => (
                      <div
                        key={`mockup-${i}`}
                        onClick={() => openLightbox(i)}
                        className="border-2 border-black/20 overflow-hidden flex items-center justify-center bg-paper cursor-pointer transition-transform hover:scale-[1.01] duration-300"
                      >
                        <img src={encodeURI(imgSrc)} alt={`${project.title} mockup ${i + 1}`} className="w-full h-auto object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Standard Images */}
                {standardImages.length > 0 && (
                  <div className={`grid gap-4 md:gap-6 ${project.category.toLowerCase().includes('zine') ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1'}`}>
                    {standardImages.map((imgSrc, i) => (
                      <div
                        key={`img-${i}`}
                        onClick={() => openLightbox(mockups.length + i)}
                        className={`group relative cursor-pointer overflow-hidden bg-white border border-black/5 shadow-sm hover:shadow-xl transition-all duration-500 ${
                          project.category.toLowerCase().includes('zine') && i === 0
                          ? 'max-w-[50%] ml-auto mr-0'
                          : project.category.toLowerCase().includes('zine') && i === standardImages.length - 1
                          ? 'max-w-[50%] ml-0 mr-auto'
                          : ''
                        }`}
                      >
                        <img
                          src={encodeURI(imgSrc)}
                          alt={`${project.title} page ${i + 1}`}
                          className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Small Pages Grid */}
                {pages.length > 0 && (
                  <div className="bg-[#cdcdcd] p-6 md:p-12 w-full mt-8 rounded-lg">
                    <div className={`grid gap-4 md:gap-8 items-center ${pages.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4'}`}>
                      {pages.map((imgSrc, i) => {
                        const globalIndex = mockups.length + standardImages.length + i;
                        return (
                          <div
                            key={`page-${i}`}
                            onClick={() => openLightbox(globalIndex)}
                            className={`flex items-center justify-center transition-transform hover:scale-[1.02] duration-300 cursor-pointer ${pages.length === 1 ? 'w-full' : 'col-span-1'}`}
                          >
                            <img src={encodeURI(imgSrc)} alt={`${project.title} page ${i + 1}`} className="w-full h-auto object-contain" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Placeholder Fallback */}
                {!(project.images?.length) && !(project.mockups?.length) && !(project.pages?.length) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-video border-2 border-black/20 bg-paper-dark/5 flex items-center justify-center p-4">
                        <span className="font-sans text-[11px] opacity-40 text-center mix-blend-difference">[ Image to be added ]</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {!isPawly && (
          <section id="details" className="scroll-mt-40 mb-24">
            <h2 className="font-display font-normal tracking-wide text-lg leading-[1.1] mb-8 pb-3 border-b border-black/15 text-ink/50">Tech Stack</h2>
            <div className="flex flex-wrap gap-4">
              {project.tech.map((t, idx) => (
                <span key={idx} className="border-2 border-current bg-paper px-6 py-3 font-sans font-bold text-lg hover:bg-ink hover:text-paper transition-colors shadow-hard">
                  {t}
                </span>
              ))}
            </div>
          </section>
          )}

          {/* Navigation Buttons */}
          <div className="mt-16 pt-8 border-t-2 border-current flex flex-col md:flex-row justify-between gap-6">
            <button
              onClick={handlePrev}
              className="group flex flex-col items-start gap-2 border-2 border-current bg-transparent px-6 py-4 shadow-hard hover:shadow-none hover:bg-cobalt hover:text-white hover:border-cobalt transition-all duration-200"
            >
              <span className="font-sans text-[11px] opacity-70">← Previous</span>
              <span className="font-display font-normal text-3xl tracking-tight w-full text-left truncate">{prevProject.title}</span>
            </button>
            <button
              onClick={handleNext}
              className="group flex flex-col items-end gap-2 border-2 border-current bg-transparent px-6 py-4 shadow-hard hover:shadow-none hover:bg-cobalt hover:text-white hover:border-cobalt transition-all duration-200 text-right"
            >
              <span className="font-sans text-[11px] opacity-70">Next →</span>
              <span className="font-display font-normal text-3xl tracking-tight w-full text-right truncate">{nextProject.title}</span>
            </button>
          </div>
          </div>
        </main>
      </div>

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-cobalt transition-colors z-[110]"
            onClick={closeLightbox}
          >
            <X size={40} strokeWidth={1.5} />
          </button>

          <button
            className={`absolute left-4 md:left-12 top-1/2 -translate-y-1/2 text-white hover:text-cobalt transition-colors z-[110] p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm ${lightboxIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
            onClick={prevImage}
            disabled={lightboxIndex === 0}
          >
            <ChevronLeft size={36} />
          </button>

          <div className="relative w-full max-w-6xl max-h-[90vh] flex items-center justify-center px-16">
            <img
              src={allImages[lightboxIndex]}
              alt="Lightbox"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <button
            className={`absolute right-4 md:right-12 top-1/2 -translate-y-1/2 text-white hover:text-cobalt transition-colors z-[110] p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm ${lightboxIndex === allImages.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
            onClick={nextImage}
            disabled={lightboxIndex === allImages.length - 1}
          >
            <ChevronRight size={36} />
          </button>
        </div>
      )}
    </motion.div>
  );
};
