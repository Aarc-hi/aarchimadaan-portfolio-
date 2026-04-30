$Path = "c:\Users\Admin\.gemini\VERCEL PORTFOLIO\aarchimadaan\aarchimadaan-main\App.tsx"
$Code = Get-Content -Path $Path -Raw 

$Code = $Code.Replace("{view === 'ABOUT' && (", "{/* IDENTITY MERGED VIEW */}
          {view === 'identity' && (
            <motion.div key=`"identity`" variants={pageVariants} initial=`"initial`" animate=`"animate`" exit=`"exit`" className=`"w-full h-full max-h-[85vh] overflow-y-auto scroll-smooth pb-32`">
              <div className=`"sticky top-0 z-30 bg-paper/90 dark:bg-paper-dark/90 py-4 flex justify-center gap-8 font-mono text-sm uppercase tracking-widest border-b border-black/10 dark:border-white/10 backdrop-blur-sm mb-8`">
                 <a href=`"#identity-section`" className=`"hover:text-cobalt transition-colors`">Identity</a>
                 <a href=`"#arsenal-section`" className=`"hover:text-cobalt transition-colors`">Arsenal</a>
                 <a href=`"#timeline-section`" className=`"hover:text-cobalt transition-colors`">Timeline</a>
              </div>
              <div id=`"identity-section`" className=`"py-16 md:py-24 max-w-6xl mx-auto`">")

$Code = $Code.Replace("            </motion.div>
          )}

          {/* EXPERIENCE VIEW */}
          {view === 'EXPERIENCE' && (
            <motion.div key=`"experience`" variants={pageVariants} initial=`"initial`" animate=`"animate`" exit=`"exit`" className=`"w-full max-w-4xl`">", "              </div>

              {/* ARSENAL SECTION */}
              <div id=`"arsenal-section`" className=`"py-16 md:py-24 border-t border-black/10 dark:border-white/10`">")

# Move SKILLS to happen earlier. Actually wait, App.tsx currently has PROJECTS in between EXPERIENCE and SKILLS.
# We must remove PROJECTS and SKILLS from their original places and reorder them.
