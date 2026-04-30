import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewState, Project } from '../types';
import { PROJECTS } from '../data';

interface ProjectDetailViewProps {
  project: Project;
  setView: (view: ViewState) => void;
  setSelectedProject: (id: string | null) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, setView, setSelectedProject }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const scrollRef = useRef<HTMLElement>(null);

  const mockups = project.mockups || [];
  const standardImages = project.images || [];
  const pages = project.pages || [];
  const allImages = [...mockups, ...standardImages, ...pages];

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[60] bg-paper dark:bg-paper-dark pt-24 pb-8"
      style={{ display: 'flex', justifyContent: 'center' }}
    >
      <div className="w-full max-w-7xl px-4 md:px-12" style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
        {/* LEFT column — stays fixed */}
        <aside className="hidden md:flex flex-col shrink-0 border-r-2 border-black/10 dark:border-white/10" style={{ width: '240px' }}>
          <div className="flex flex-col gap-4 font-mono text-sm uppercase tracking-widest px-8 py-12 overflow-y-auto">
            <button onClick={handleClose} className="hover:text-cobalt text-left mb-12 flex items-center gap-2 font-black cursor-pointer transition-colors text-ink dark:text-ink-light group">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-black">Back to Works</span>
            </button>
            <a href="#overview" onClick={(e) => { e.preventDefault(); document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' }); }} className={`border-l-2 pl-4 py-2 transition-all duration-300 ease-out ${activeTab === 'overview' ? 'border-cobalt text-cobalt bg-cobalt/5' : 'border-transparent text-ink/70 dark:text-ink-light/70 hover:border-black/50 dark:hover:border-white/50'}`}>Overview</a>
            <a href="#concept" onClick={(e) => { e.preventDefault(); document.getElementById('concept')?.scrollIntoView({ behavior: 'smooth' }); }} className={`border-l-2 pl-4 py-2 transition-all duration-300 ease-out ${activeTab === 'concept' ? 'border-cobalt text-cobalt bg-cobalt/5' : 'border-transparent text-ink/70 dark:text-ink-light/70 hover:border-black/50 dark:hover:border-white/50'}`}>Concept</a>
            <a href="#problem" onClick={(e) => { e.preventDefault(); document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' }); }} className={`border-l-2 pl-4 py-2 transition-all duration-300 ease-out ${activeTab === 'problem' ? 'border-cobalt text-cobalt bg-cobalt/5' : 'border-transparent text-ink/70 dark:text-ink-light/70 hover:border-black/50 dark:hover:border-white/50'}`}>{project.researchQuestion ? 'Research' : 'Problem'}</a>
            {project.youtubeId && (
              <a href="#prototype" onClick={(e) => { e.preventDefault(); document.getElementById('prototype')?.scrollIntoView({ behavior: 'smooth' }); }} className={`border-l-2 pl-4 py-2 transition-all duration-300 ease-out ${activeTab === 'prototype' ? 'border-cobalt text-cobalt bg-cobalt/5' : 'border-transparent text-ink/70 dark:text-ink-light/70 hover:border-black/50 dark:hover:border-white/50'}`}>Prototype</a>
            )}
            {project.videoSrc && (
              <a href="#video" onClick={(e) => { e.preventDefault(); document.getElementById('video')?.scrollIntoView({ behavior: 'smooth' }); }} className={`border-l-2 pl-4 py-2 transition-all duration-300 ease-out ${activeTab === 'video' ? 'border-cobalt text-cobalt bg-cobalt/5' : 'border-transparent text-ink/70 dark:text-ink-light/70 hover:border-black/50 dark:hover:border-white/50'}`}>Video Walkthrough</a>
            )}
            {(standardImages.length > 0 || mockups.length > 0 || pages.length > 0) && (
              <a href="#images" onClick={(e) => { e.preventDefault(); document.getElementById('images')?.scrollIntoView({ behavior: 'smooth' }); }} className={`border-l-2 pl-4 py-2 transition-all duration-300 ease-out ${activeTab === 'images' ? 'border-cobalt text-cobalt bg-cobalt/5' : 'border-transparent text-ink/70 dark:text-ink-light/70 hover:border-black/50 dark:hover:border-white/50'}`}>Visuals</a>
            )}
            <a href="#details" onClick={(e) => { e.preventDefault(); document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' }); }} className={`border-l-2 pl-4 py-2 transition-all duration-300 ease-out ${activeTab === 'details' ? 'border-cobalt text-cobalt bg-cobalt/5' : 'border-transparent text-ink/70 dark:text-ink-light/70 hover:border-black/50 dark:hover:border-white/50'}`}>Tech Stack</a>
          </div>
        </aside>

        {/* Mobile Back Button */}
        <div className="md:hidden w-full mb-8 pt-16 px-4 flex justify-between items-center z-50">
          <button onClick={handleClose} className="hover:text-cobalt flex items-center gap-2 font-bold cursor-pointer transition-colors">
            <ArrowLeft size={20} /> Back
          </button>
        </div>

        {/* RIGHT column — this is the ONLY thing that scrolls */}
        <main
          ref={scrollRef}
          onScroll={(e) => {
            const target = e.target as HTMLElement;
            if (Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 20) {
              setActiveTab('details');
            }
          }}
          style={{ flex: 1, overflowY: 'auto', height: '100%', padding: '2rem' }}
        >
          <div className="mb-24 flex flex-col gap-6">
            <h1 className="text-5xl md:text-8xl font-display font-black tracking-normal uppercase leading-[0.85] text-ink dark:text-ink-light">
              {project.title}
            </h1>
            <div className="flex flex-wrap gap-4 font-mono font-bold uppercase tracking-widest text-sm md:text-base">
              <span className="bg-cobalt text-white px-3 py-1 shadow-hard-sm">{project.year}</span>
              <span className="border-2 border-black dark:border-white bg-paper dark:bg-paper-dark px-3 py-1 text-ink dark:text-white shadow-hard-sm">{project.category}</span>
            </div>
          </div>

          <section id="overview" className="scroll-mt-32 mb-32">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-8 uppercase border-b-2 border-current inline-block pb-2">Overview</h2>
            <div className="text-lg md:text-2xl font-sans max-w-3xl leading-relaxed space-y-6">
              {project.description.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          <section id="concept" className="scroll-mt-32 mb-32">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-8 uppercase border-b-2 border-current inline-block pb-2">Concept</h2>
            <div className="text-lg md:text-2xl font-sans max-w-3xl leading-relaxed space-y-6">
              <p>{project.concept || "Design conceptualization focusing on user experience and visual narrative."}</p>
            </div>
          </section>

          <section id="problem" className="scroll-mt-32 mb-32">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-8 uppercase border-b-2 border-current inline-block pb-2">
              {project.researchQuestion ? 'Research Question' : 'Problem Statement'}
            </h2>
            <div className="text-lg md:text-2xl font-sans max-w-3xl leading-relaxed space-y-6">
              <p>{project.researchQuestion || project.problemStatement || "Project challenge and user pain points analysis."}</p>
            </div>
          </section>

          {project.youtubeId && (
            <section id="prototype" className="scroll-mt-32 mb-32">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-12 uppercase border-b-2 border-current inline-block pb-2">Prototype</h2>
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
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-12 uppercase border-b-2 border-current inline-block pb-2">Video Walkthrough</h2>
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

          {(standardImages.length > 0 || mockups.length > 0 || pages.length > 0) && (
            <section id="images" className="scroll-mt-32 mb-32">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-12 uppercase border-b-2 border-current inline-block pb-2">Visuals</h2>
              <div className="flex flex-col gap-12">
                {/* Large Mockups */}
                {mockups.length > 0 && (
                  <div className="grid grid-cols-1 gap-8">
                    {mockups.map((imgSrc, i) => (
                      <div
                        key={`mockup-${i}`}
                        onClick={() => openLightbox(i)}
                        className="border-2 border-black/20 overflow-hidden flex items-center justify-center bg-paper dark:bg-paper-dark cursor-pointer transition-transform hover:scale-[1.01] duration-300"
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
                        className={`group relative cursor-pointer overflow-hidden bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-500 ${
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
                  <div className="bg-[#cdcdcd] dark:bg-zinc-800/80 p-6 md:p-12 w-full mt-8 rounded-lg">
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
                        <span className="font-mono text-sm uppercase opacity-40 text-center mix-blend-difference">[ Image to be added ]</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          <section id="details" className="scroll-mt-40 mb-24">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-8 uppercase border-b-2 border-current inline-block pb-2">Tech Stack</h2>
            <div className="flex flex-wrap gap-4">
              {project.tech.map((t, idx) => (
                <span key={idx} className="border-2 border-current bg-paper dark:bg-paper-dark px-6 py-3 font-mono font-bold text-lg hover:bg-ink hover:text-paper transition-colors shadow-hard">
                  {t}
                </span>
              ))}
            </div>
          </section>

          {/* Navigation Buttons */}
          <div className="mt-16 pt-8 border-t-2 border-current flex flex-col md:flex-row justify-between gap-6">
            <button
              onClick={handlePrev}
              className="group flex flex-col items-start gap-2 border-2 border-current bg-transparent px-6 py-4 shadow-hard hover:shadow-none hover:bg-cobalt hover:text-white hover:border-cobalt transition-all duration-200"
            >
              <span className="font-mono text-xs uppercase opacity-70">← Previous</span>
              <span className="font-display font-bold text-xl md:text-3xl uppercase tracking-tighter w-full text-left truncate">{prevProject.title}</span>
            </button>
            <button
              onClick={handleNext}
              className="group flex flex-col items-end gap-2 border-2 border-current bg-transparent px-6 py-4 shadow-hard hover:shadow-none hover:bg-cobalt hover:text-white hover:border-cobalt transition-all duration-200 text-right"
            >
              <span className="font-mono text-xs uppercase opacity-70">Next →</span>
              <span className="font-display font-bold text-xl md:text-3xl uppercase tracking-tighter w-full text-right truncate">{nextProject.title}</span>
            </button>
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
