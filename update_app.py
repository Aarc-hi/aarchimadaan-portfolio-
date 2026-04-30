import os

file_path = "c:/Users/Admin/.gemini/VERCEL PORTFOLIO/aarchimadaan/aarchimadaan-main/App.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    code = f.read()

# Change 03 & 04: Merge Identity, Arsenal, Timeline. Add Resume block.
# We will replace the views section with the merged identity view.

view_about_start = """          {/* ABOUT VIEW */}
          {view === 'ABOUT' && ("""
view_about_end = """          {/* CONTACT VIEW */}"""

merged_identity_view = """          {/* IDENTITY VIEW (Merged) */}
          {view === 'identity' && (
            <motion.div key="identity" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full h-full overflow-y-auto">
                
                <div className="sticky top-0 z-30 bg-paper/90 dark:bg-paper-dark/90 backdrop-blur-md border-b border-black/10 dark:border-white/10 py-4 flex justify-center gap-8 font-mono text-sm uppercase">
                    <a href="#identity-section" className="hover:text-cobalt">Identity</a>
                    <a href="#arsenal-section" className="hover:text-cobalt">Arsenal</a>
                    <a href="#timeline-section" className="hover:text-cobalt">Timeline</a>
                </div>

                <div id="identity-section" className="py-16 md:py-24">
                  <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
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
                             I'm a <strong className="text-cobalt">Creative & Detail-Oriented Interaction Designer</strong> with a penchant for breaking grid systems. 
                           </p>
                           <p>
                             Proficient in UI design and visual storytelling.
                           </p>
                        </div>
                        <div className="mt-12 flex gap-4 flex-wrap">
                            <div className="bg-ink dark:bg-ink-light text-paper dark:text-paper-dark px-4 py-2 font-mono text-sm border-2 border-transparent -rotate-2">
                                Bachelor in Design @ Anant National University
                            </div>
                            <div className="bg-transparent border-2 border-current px-4 py-2 font-mono text-sm font-bold rotate-1">
                                8.3/10 GPA
                            </div>
                        </div>
                     </div>
                     <div className="order-1 md:order-2 flex justify-center">
                        <div className="relative w-full max-w-md aspect-[3/4]">
                            <div className="absolute inset-0 bg-cobalt translate-x-4 translate-y-4 border-2 border-black dark:border-white"></div>
                            <div className="absolute inset-0 bg-white dark:bg-gray-800 border-2 border-current flex items-center justify-center overflow-hidden">
                               <img src={Aarchi} alt="Portrait" className="absolute inset-0 object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500 opacity-80 hover:opacity-100 mix-blend-multiply dark:mix-blend-normal" />
                            </div>
                            <div className="absolute -bottom-6 -right-6 bg-paper dark:bg-paper-dark border-2 border-current px-4 py-2 font-display font-bold text-xl rotate-6 shadow-hard-sm z-20">
                                Based in New Delhi
                            </div>
                        </div>
                     </div>
                  </div>
                </div>

                <div id="arsenal-section" className="py-16 md:py-24 border-t border-black/10 dark:border-white/10 overflow-hidden">
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
                     <motion.div className="flex whitespace-nowrap" animate={{ x: [-1000, 0] }} transition={{ repeat: Infinity, duration: 25, ease: "linear" }}>
                       {[...SKILLS.tools, ...SKILLS.tools, ...SKILLS.tools].map((skill, i) => (
                         <span key={i} className="text-6xl md:text-8xl font-display font-black text-paper dark:text-paper-dark mx-8 uppercase">
                           {skill} <span className="text-transparent text-stroke-thick mx-4">*</span>
                         </span>
                       ))}
                     </motion.div>
                   </div>
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-24 px-4">
                        <div className="border-2 border-current p-8 shadow-hard hover:bg-paper-dark hover:text-paper hover:shadow-none transition-all">
                            <h3 className="font-mono text-xl mb-6 uppercase border-b-2 border-current inline-block">Research</h3>
                            <div className="flex flex-wrap gap-3">
                                {SKILLS.research.map(s => <span key={s} className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md font-medium text-lg text-black">{s}</span>)}
                            </div>
                        </div>
                        <div className="border-2 border-current p-8 shadow-hard hover:bg-paper-dark hover:text-paper hover:shadow-none transition-all">
                            <h3 className="font-mono text-xl mb-6 uppercase border-b-2 border-current inline-block">Soft Skills</h3>
                            <div className="flex flex-wrap gap-3">
                                {SKILLS.soft.map(s => <span key={s} className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md font-medium text-lg text-black">{s}</span>)}
                            </div>
                        </div>
                    </div>
                </div>

                <div id="timeline-section" className="py-16 md:py-24 border-t border-black/10 dark:border-white/10 max-w-4xl mx-auto">
                  <div className="text-center mb-16 relative">
                     <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase relative z-10">The Timeline</h2>
                  </div>
                  <div className="space-y-12">
                    {EXPERIENCES.map((exp, idx) => (
                      <motion.div key={exp.id} initial={{ x: idx % 2 === 0 ? -50 : 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }} className="group relative bg-paper dark:bg-paper-dark border-2 border-current p-8 shadow-hard hover:shadow-hard-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute -top-4 -right-4 bg-cobalt text-white px-4 py-1 font-mono text-sm font-bold rotate-3 group-hover:rotate-6 transition-transform">
                            {exp.period}
                        </div>
                        <h3 className="text-3xl md:text-5xl font-display font-bold uppercase mb-1 leading-none flex items-center gap-4">
                            {exp.role}
                            {exp.id === 'vol1' || exp.role === 'Volunteer' ? <span className="bg-cobalt text-white text-xs px-2 py-1 shadow-hard-sm uppercase tracking-widest block font-sans">Volunteer</span> : null}
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

                  <div id="resume-section" className="mt-24 mb-12 text-center pb-8 border-t-2 border-black/10 dark:border-white/10 pt-16">
                    <h2 className="font-display font-bold text-4xl md:text-6xl uppercase tracking-tight mb-8">Resume</h2>
                    <a href="/resume.pdf" target="_blank" className="inline-flex items-center gap-3 px-8 py-4 border-2 border-black dark:border-white font-display font-bold text-sm uppercase tracking-widest shadow-hard hover:shadow-none hover:bg-cobalt hover:text-white transition-all duration-200">
                        Download Resume <ArrowRight size={20} />
                    </a>
                  </div>
                </div>

            </motion.div>
          )}

          {/* PROJECT DETAIL VIEW */}
          {view === 'project-detail' && selectedProject && (
              <ProjectDetailView project={PROJECTS.find(p => p.id === selectedProject)} setView={setView} setSelectedProject={setSelectedProject} />
          )}

          {/* PROJECTS VIEW */}"""

# We need to extract the parts and replace correctly. Because the file is large, regex or find is safest.
idx_start = code.find(view_about_start)
idx_end = code.find(view_about_end)

if idx_start != -1 and idx_end != -1:
    code = code[:idx_start] + merged_identity_view + code[idx_end:]
else:
    print("Could not find about view block")

# Let's add selectedProject state
state_search = "const [hoveredProject, setHoveredProject] = useState<string | null>(null);"
state_replace = "const [hoveredProject, setHoveredProject] = useState<string | null>(null);\n  const [selectedProject, setSelectedProject] = useState<string | null>(null);"
code = code.replace(state_search, state_replace)

# Let's add ProjectDetailView import
import_search = "import { Background } from './components/Background';"
import_replace = "import { Background } from './components/Background';\nimport { ProjectDetailView } from './components/ProjectDetailView';"
code = code.replace(import_search, import_replace)

# Projects View onClick to project-detail
project_click_search = "className=\"relative border-b-4 border-current py-12 md:py-20 group cursor-pointer overflow-hidden\""
project_click_replace = "className=\"relative border-b-4 border-current py-12 md:py-20 group cursor-pointer overflow-hidden\"\n                    onClick={() => { setSelectedProject(project.id); setView('project-detail'); }}"
code = code.replace(project_click_search, project_click_replace)

# Projects View Thumbnail Placeholder (Change 08.D)
# We need to insert a thumbnail below the title
project_content_search = """<div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 px-4">"""
project_content_replace = """<div className="flex flex-col gap-6 px-4">
                        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">"""
code = code.replace(project_content_search, project_content_replace)

project_thumbnail_search = """                        <div className="flex flex-col items-end">
                            <span className="font-mono text-sm md:text-lg font-bold group-hover:text-white transition-colors">{project.date}</span>
                            <div className="flex gap-2 mt-2">
                                {project.tech.map(t => (
                                    <span key={t} className="text-xs border border-current px-2 py-0.5 rounded-full bg-paper dark:bg-paper-dark group-hover:border-white group-hover:bg-transparent group-hover:text-white transition-colors">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>"""
project_thumbnail_replace = """                        <div className="flex flex-col items-end">
                            <span className="font-mono text-sm md:text-lg font-bold group-hover:text-white transition-colors">{project.date}</span>
                            <div className="flex gap-2 mt-2">
                                {project.tech.map((t, i) => (
                                    <span key={i} className="text-xs border border-current px-2 py-0.5 rounded-full bg-paper dark:bg-paper-dark group-hover:border-white group-hover:bg-transparent group-hover:text-white transition-colors">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                     </div>
                     <div className="w-full aspect-video border-2 border-black/10 bg-paper-dark/5 flex items-center justify-center pointer-events-none mt-4 transition-all duration-300">
                        {/* TODO: replace placeholder with <img src="..." /> */}
                        <span className="font-mono text-sm uppercase opacity-50">[ Image — coming soon ]</span>
                     </div>
                  </div>"""
code = code.replace(project_thumbnail_search, project_thumbnail_replace)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(code)

print("done")
