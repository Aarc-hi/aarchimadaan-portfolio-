import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewState, Project } from '../types';
import { PROJECTS } from '../data';
import { ThelaResearch, RESEARCH_NAV } from './research/ThelaResearch';
import { PawlyCaseStudy, PAWLY_NAV } from './pawly/PawlyCaseStudy';
import { Marked } from './Marked';
import { FlipBook } from './FlipBook';
import { ParkingGame } from './ParkingGame';
import { SoundHint } from './SoundHint';
import { AlignrCaseStudy, ALIGNR_NAV } from './alignr/AlignrCaseStudy';
import { SlouchFigure } from './alignr/SlouchFigure';
import { PenCaseStudy, PEN_NAV_A } from './penhospital/PenCaseStudy';
interface ProjectDetailViewProps {
  project: Project;
  setView: (view: ViewState) => void;
  setSelectedProject: (id: string | null) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, setView, setSelectedProject }) => {
  const [activeTab, setActiveTab] = useState(project.tldr ? 'tldr' : project.id === 'p1' ? 'problem' : project.id === 'p4' ? 'what' : 'overview');
  const scrollRef = useRef<HTMLElement>(null);

  const mockups = project.mockups || [];
  const standardImages = project.images || [];
  const pages = project.pages || [];
  const allImages = [...mockups, ...standardImages, ...pages];

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [carParked, setCarParked] = useState(false);   // the zine's parking page: has the car been parked in the right bay
  // Thela Thaila Thikana opens straight into its research, so it skips the Overview and Concept blurbs.
  // Pawly has its own set of sections (components/pawly), so it skips the generic ones too.
  const isPawly = project.id === 'p4';
  const isAlignr = project.id === 'p2';   // Alignr has its own sections too (components/alignr), with a figure to play with beside the title
  const isPen = project.id === 'p5';      // The Pen Hospital has its own sections too (components/penhospital)
  const showIntro = project.id !== 'p1' && !isPawly && !isAlignr && !isPen;
  // ...and shows its research question as the heading above its findings, with its team, role and date beside the title.
  const questionInHeader = project.id === 'p1' && !!project.researchQuestion;
  const noProblem = project.id === 'p3'; // Sonic has no problem statement section

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

    const sections = scrollContainer.querySelectorAll('section[id], div[id^="ch-"]'); // the research chapters count too
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

  // `sub` items are the research chapters, listed indented under "Findings".
  const tldrNav = project.tldr ? [{ id: 'tldr', label: 'tl;dr' }] : [];
  const navItems: { id: string; label: string; sub?: boolean }[] = isPawly ? [...tldrNav, ...PAWLY_NAV] : [
    ...tldrNav,
    ...(isAlignr ? ALIGNR_NAV : []),
    ...(isPen ? PEN_NAV_A : []),
    ...(showIntro ? [{ id: 'overview', label: 'Overview' }, { id: 'concept', label: 'Concept' }] : []),
    ...(noProblem || project.id === 'p1' || isAlignr || isPen ? [] : [{ id: 'problem', label: project.researchQuestion ? 'Research' : 'Problem' }]),
    // on Thela the research question comes right after the market chapter, inside the findings
    ...(project.id === 'p1' ? [{ id: 'findings', label: 'Findings' }, ...RESEARCH_NAV.flatMap((c) => c.id === 'ch-market' ? [{ ...c, sub: true }, { id: 'problem', label: 'Research', sub: true }] : [{ ...c, sub: true }])] : []),
    ...(project.youtubeId ? [{ id: 'prototype', label: 'Prototype' }] : []),
    ...(project.videoSrc ? [{ id: 'video', label: 'Video Walkthrough' }] : []),
    ...(!isPen && (allImages.length > 0 || (project.book?.length ?? 0) > 1) ? [{ id: 'images', label: project.id === 'p1' ? 'Creative zine' : isAlignr ? 'Poster' : 'Visuals' }] : []),
  ];

  // The progress line: how far down the project you are (0 to 1), and where each heading sits on it.
  const [progress, setProgress] = useState(0);
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [dragging, setDragging] = useState(false);
  const [trackH, setTrackH] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const readProgress = () => {
    const m = scrollRef.current; if (!m) return;
    setProgress(Math.min(1, Math.max(0, m.scrollTop / Math.max(1, m.scrollHeight - m.clientHeight))));
  };
  const seekTo = (clientY: number) => {
    const t = trackRef.current, m = scrollRef.current; if (!t || !m) return;
    const r = t.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientY - r.top) / r.height));
    m.scrollTop = f * Math.max(0, m.scrollHeight - m.clientHeight);
  };
  useEffect(() => {
    const m = scrollRef.current; if (!m) return;
    const measure = () => {
      const max = Math.max(1, m.scrollHeight - m.clientHeight);
      const top = m.getBoundingClientRect().top;
      const next: Record<string, number> = {};
      navItems.forEach((n) => {
        const el = document.getElementById(n.id);
        if (el) next[n.id] = Math.min(1, Math.max(0, (el.getBoundingClientRect().top - top + m.scrollTop - 24) / max));
      });
      setMarks(next);
      setTrackH(trackRef.current ? trackRef.current.clientHeight : 0);
      readProgress();
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (m.firstElementChild) ro.observe(m.firstElementChild);
    window.addEventListener('resize', measure);
    const t = window.setTimeout(measure, 600); // once the images have had a moment to load
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); window.clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[60] bg-paper"
      style={{ display: 'flex', justifyContent: 'center' }}
    >
      <div className="w-full px-3 md:px-5 flex flex-col md:flex-row" style={{ height: '100%', overflow: 'hidden' }}>
        {/* Back, in the top-left corner on wide screens (phones have their own Back button below) */}
        <button onClick={handleClose} className={`hidden md:inline-flex items-center gap-2 absolute left-5 top-[140px] z-30 font-bold text-lg cursor-pointer hover:text-cobalt transition-colors group`}>
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        {/* LEFT rail: the progress line (no menu opens from it) */}
        <div
          className="hidden md:block absolute left-0 top-56 bottom-28 z-20"
          style={{ width: '36px' }}
        >
          {/* A straight gray line that fills with blue as you scroll. Each heading has a dot on it, blue once you have reached it.
              The blue knob is a slider: drag it (or click the line) to move through the project. */}
          <div
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-label="Position in the project"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            className="group absolute left-0 top-0 bottom-0 w-9 z-10 cursor-pointer touch-none select-none outline-none"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDragging(true); seekTo(e.clientY); }}
            onPointerMove={(e) => {
              if (!dragging) return;
              if (e.buttons === 0) { setDragging(false); return; } // the button was let go somewhere we did not see
              seekTo(e.clientY);
            }}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
            onLostPointerCapture={() => { setDragging(false); }}
            onKeyDown={(e) => {
              const m = scrollRef.current; if (!m) return;
              const step = e.shiftKey ? m.clientHeight * 0.8 : 80;
              if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { m.scrollBy({ top: step }); e.preventDefault(); }
              if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { m.scrollBy({ top: -step }); e.preventDefault(); }
              if (e.key === 'Home') { m.scrollTo({ top: 0 }); e.preventDefault(); }
              if (e.key === 'End') { m.scrollTo({ top: m.scrollHeight }); e.preventDefault(); }
            }}
          >
            <span aria-hidden="true" className="absolute left-[17px] top-0 bottom-0 w-[2px] rounded-full bg-black/15" />
            <span aria-hidden="true" className="absolute left-[17px] top-0 w-[2px] rounded-full bg-cobalt" style={{ height: `${progress * 100}%` }} />
            {navItems.map((n) => marks[n.id] === undefined ? null : (
              <span key={n.id} aria-hidden="true" title={n.label}
                className={`absolute left-[14px] w-2 h-2 -translate-y-1/2 rounded-full border-2 border-paper transition-colors duration-200 ${progress >= marks[n.id] - 0.002 ? 'bg-cobalt' : 'bg-black/25'}`}
                style={{ top: `${marks[n.id] * 100}%` }} />
            ))}
            {/* the heading names, beside their dots: they only show while the cursor is on the line (or while dragging) */}
            {(() => {
              let last = -Infinity;
              return navItems.filter((n) => marks[n.id] !== undefined).sort((a, b) => marks[a.id] - marks[b.id]).map((n) => {
                const y = Math.max(marks[n.id] * trackH, last + 22); last = y;
                return (
                  <span key={`l-${n.id}`} aria-hidden="true"
                    className={`pointer-events-none absolute left-[34px] -translate-y-1/2 whitespace-nowrap px-2 py-0.5 font-sans text-[11px] tracking-wide transition-opacity duration-200 ${dragging || activeTab === n.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${activeTab === n.id ? 'text-cobalt' : 'text-ink/60'}`}
                    style={{ top: `${y}px` }}>{n.label}</span>
                );
              });
            })()}
            <span aria-hidden="true"
              className={`absolute left-[11px] w-[16px] h-[16px] -translate-y-1/2 rounded-full bg-cobalt border-2 border-paper shadow-[0_2px_8px_rgba(42,82,190,0.45)] ${dragging ? 'scale-125' : 'scale-100'} transition-transform duration-150`}
              style={{ top: `${progress * 100}%` }} />
          </div>

        </div>

        {/* Mobile Back Button */}
        <div className="md:hidden w-full shrink-0 mb-2 pt-24 px-1 flex justify-between items-center z-50">
          <button onClick={handleClose} className="hover:text-cobalt flex items-center gap-2 font-bold text-lg cursor-pointer transition-colors">
            <ArrowLeft size={20} /> Back
          </button>
        </div>

        {/* RIGHT column — this is the ONLY thing that scrolls */}
        <main
          ref={scrollRef}
          onScroll={(e) => {
            readProgress();
            const target = e.target as HTMLElement;
            if (Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 20) {
              setActiveTab(navItems[navItems.length - 1].id);
            }
          }}
          className="no-scrollbar px-3 pt-4 pb-10 md:pt-32 md:pl-14 md:pr-14"
          style={{ flex: 1, minHeight: 0, minWidth: 0, overflowY: 'auto' }}
        >
          <div className="max-w-6xl mx-auto">
          <div className={`mb-24 flex flex-col gap-8 ${questionInHeader ? 'md:flex-row md:items-end md:justify-between' : ''} ${isAlignr ? 'relative' : ''}`}>
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
                <div><p className="text-[11px] leading-none tracking-wide mb-1">Group</p><p className="leading-snug">6 people</p></div>
                <div><p className="text-[11px] leading-none tracking-wide mb-1">My role</p><p className="leading-snug">Research and creatives</p></div>
                <div><p className="text-[11px] leading-none tracking-wide mb-1">Date</p><p className="leading-snug">March 2025</p></div>
              </div>
            )}
          </div>

          {/* TL;DR: the first thing on every project page */}
          {project.tldr && (
            <section id="tldr" className={project.tldrImage || isAlignr ? 'scroll-mt-32 mb-24 sm:-mt-16' : 'scroll-mt-32 mb-24 md:mb-32'}>
              <div className={project.tldrImage || isAlignr ? 'grid gap-10 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] sm:gap-10 lg:grid-cols-2 lg:gap-16 items-end' : ''}>
                <div className="sm:-mb-2">
                  <h2 className="font-display font-normal tracking-wide text-lg leading-[1.1] mb-8 pb-3 border-b border-cobalt/25 text-cobalt">tl;dr</h2>
                  <p className="font-sans text-lg leading-relaxed"><Marked text={project.tldr} /></p>
                </div>
                {/* the full orange cat: the front panel of the pack, on the right of the tl;dr */}
                {/* Alignr: the stick figure to play with takes the cat's place, on the right of the tl;dr and rising up beside the name */}
                {isAlignr && <SlouchFigure className="justify-self-end sm:-mt-[110px] sm:-mb-[13px] w-full max-w-[460px]" />}
                {project.tldrImage && <img src={project.tldrImage} alt={`${project.title}, the front of the pack`} className="block justify-self-center sm:-mt-[110px]" style={{ width: 'min(100%, 293px, calc(62vh * 0.6971))', height: 'auto' }} />}
              </div>
            </section>
          )}

          {showIntro && (<>
          <section id="overview" className="scroll-mt-32 mb-32">
            <h2 className="font-display font-normal tracking-wide text-lg leading-[1.1] mb-8 pb-3 border-b border-cobalt/25 text-cobalt">Overview</h2>
            <div className="text-lg font-sans leading-relaxed space-y-6">
              {project.description.map((p, i) => (
                <p key={i}><Marked text={p} /></p>
              ))}
            </div>
          </section>

          <section id="concept" className="scroll-mt-32 mb-32">
            <h2 className="font-display font-normal tracking-wide text-lg leading-[1.1] mb-8 pb-3 border-b border-cobalt/25 text-cobalt">Concept</h2>
            <div className="text-lg font-sans leading-relaxed space-y-6">
              <p><Marked text={project.concept || "Design conceptualization focusing on user experience and visual narrative."} /></p>
            </div>
          </section>

          </>)}

          {isPawly && <PawlyCaseStudy />}
          {isAlignr && <AlignrCaseStudy />}
          {isPen && <PenCaseStudy />}

          {!questionInHeader && !isPawly && !isAlignr && !isPen && !noProblem && (
          <section id="problem" className="scroll-mt-32 mb-32">
            <h2 className="font-display font-normal tracking-wide text-lg leading-[1.1] mb-8 pb-3 border-b border-cobalt/25 text-cobalt">
              {project.researchQuestion ? 'Research Question' : 'Problem Statement'}
            </h2>
            <div className="text-lg font-sans leading-relaxed space-y-6">
              <p><Marked text={project.researchQuestion || project.problemStatement || "Project challenge and user pain points analysis."} /></p>
            </div>
          </section>
          )}

          {project.id === 'p1' && (
            <section id="findings" className="scroll-mt-32 mb-32">
              {/* the research question sits between the market chapter and "What people told us" */}
              {/* styled exactly like a research chapter (see Chapter in research/shared.tsx), so they read as one */}
              <ThelaResearch afterMarket={
                <section id="problem" className="scroll-mt-8 mb-28 md:mb-36">
                  <h2 className="font-display font-normal text-lg tracking-wide leading-[1.1] mb-4 pb-3 border-b border-cobalt/25 text-cobalt">Research Question</h2>
                  {/* the main thing of the research, so it is set much larger than the body text */}
                  <p className="font-sans w-full text-[26px] md:text-[40px] tracking-tight leading-[1.25]">{project.researchQuestion}</p>
                </section>
              } />
            </section>
          )}

          {project.youtubeId && (
            <section id="prototype" className="scroll-mt-32 mb-32">
              <h2 className="font-display font-normal tracking-wide text-lg leading-[1.1] mb-8 pb-3 border-b border-cobalt/25 text-cobalt">Prototype</h2>
              <div className="w-full aspect-video overflow-hidden bg-black">
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
              <h2 className="font-display font-normal tracking-wide text-lg leading-[1.1] mb-8 pb-3 border-b border-cobalt/25 text-cobalt">Video Walkthrough</h2>
              <div className="w-full aspect-video overflow-hidden bg-black">
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

          {!isPawly && !isPen && (standardImages.length > 0 || mockups.length > 0 || pages.length > 0 || (project.book?.length ?? 0) > 1) && (
            <section id="images" className="scroll-mt-32 mb-32">
              <h2 className="font-display font-normal tracking-wide text-lg leading-[1.1] mb-8 pb-3 border-b border-cobalt/25 text-cobalt">{project.id === 'p1' ? 'Creative zine' : isAlignr ? 'Poster' : 'Visuals'}</h2>
              {project.id === 'p1' && (
                <p className="font-sans text-lg leading-relaxed mb-12">
                  The research, retold as a zine that gives the reader a quick feel for the market. It is a multisensory zine, bringing in sound, touch and smell, and it shows how the market works and how its stakeholders come together to shape everyday life there.
                </p>
              )}
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
                  <div className="w-full mt-8">
                    <div className={`grid gap-4 md:gap-8 items-center ${pages.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4'}`}>
                      {pages.map((imgSrc, i) => {
                        const globalIndex = mockups.length + standardImages.length + i;
                        return (
                          <div
                            key={`page-${i}`}
                            onClick={() => openLightbox(globalIndex)}
                            className={`flex items-center justify-center transition-transform hover:scale-[1.02] duration-300 cursor-pointer ${pages.length === 1 ? 'w-full' : 'col-span-1'}`}
                          >
                            <img src={encodeURI(imgSrc)} alt={`${project.title} page ${i + 1}`} className="w-full h-auto object-contain" style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.28))' }} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* The whole magazine, flipped by clicking */}
                {project.book && project.book.length > 1 && <FlipBook faces={project.book.map((s) => encodeURI(s))} alt={`${project.title} ${project.category.toLowerCase().includes('zine') ? 'zine' : 'magazine'}`}
                  spreadOverlays={project.id === 'p1' ? { 2: <SoundHint />, 5: <ParkingGame parked={carParked} onParked={setCarParked} /> } : undefined}
                  spreadAudio={project.id === 'p1' ? { 2: encodeURI('/Municipal market/audio/market-sound.mp3') } : undefined} />}

                {/* Placeholder Fallback */}
                {!(project.images?.length) && !(project.mockups?.length) && !(project.pages?.length) && !(project.book?.length) && (
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

          {/* Navigation Buttons */}
          <div className="mt-16 pt-8 border-t border-black/15 flex flex-col md:flex-row justify-between gap-6">
            <button
              onClick={handlePrev}
              className="group flex flex-col items-start gap-2 bg-transparent py-2 cursor-pointer hover:text-cobalt transition-colors duration-200"
            >
              <span className="font-sans text-[11px] opacity-70">← Previous</span>
              <span className="font-display font-normal text-3xl tracking-tight w-full text-left truncate">{prevProject.title}</span>
            </button>
            <button
              onClick={handleNext}
              className="group flex flex-col items-end gap-2 bg-transparent py-2 cursor-pointer hover:text-cobalt transition-colors duration-200 text-right"
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
