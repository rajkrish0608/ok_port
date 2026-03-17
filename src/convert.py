import re
import os

def refactor_portfolio():
    filepath = '/Users/rajkrish0608/PROJECT DETAILS/Portfolio/My-Portfolio-main/src/components/Portfolio.jsx'
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Remove <AnimatePresence mode="wait"> and </AnimatePresence>
    content = content.replace('<AnimatePresence mode="wait">', '')
    content = content.replace('</AnimatePresence>', '')
    
    # 2. Extract sections logic
    sections = ['home', 'about', 'projects', 'skills', 'contact', 'awards']
    
    for sec in sections:
        # Match exactly: {section === 'xxxxx' && (
        # allowing for varying whitespace
        pattern_start = r"\{\s*section\s*===\s*'" + sec + r"'\s*&&\s*\("
        content = re.sub(pattern_start, '', content)
        
        # Replace key="sec" with id="sec"
        content = content.replace(f'key="{sec}"', f'id="{sec}"')
        
    # Remove the trailing `)}` for each section
    # Usually it looks like:
    #             </motion.section>
    #             )}
    content = re.sub(r'</motion\.section>\s*\n\s*\)\}', '</motion.section>', content)

    # 3. Remove `exit={{ opacity: 0 }}`
    content = content.replace('exit={{ opacity: 0 }}', '')
    
    # 4. Fix Navigation Buttons
    nav_old = """<motion.button
                key={s}
                onClick={() => setSection(s)}"""
    nav_new = """<motion.a
                key={s}
                href={`#${s}`}
                onClick={(e) => { e.preventDefault(); document.getElementById(s)?.scrollIntoView({ behavior: 'smooth' }); setSection(s); }}"""
    content = content.replace(nav_old, nav_new)
    
    content = content.replace('</motion.button>', '</motion.a>')

    # 5. Fix remaining artifacts (if any)
    content = content.replace('{/* <-- close conditional rendering */}', '')

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    refactor_portfolio()
