import re
import os

def fix_layout():
    filepath = '/Users/rajkrish0608/PROJECT DETAILS/Portfolio/My-Portfolio-main/src/components/Portfolio.jsx'
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Update section padding and add scroll-mt-24
    
    # Home section
    content = content.replace(
        'className="flex flex-col lg:flex-row items-center justify-between min-h-[80vh] py-12 relative gap-8"',
        'className="flex flex-col lg:flex-row items-center justify-between min-h-[80vh] py-24 md:py-32 relative gap-8 scroll-mt-24"'
    )
    
    # About section
    content = content.replace(
        'className="max-w-4xl mx-auto py-12 px-4"',
        'className="max-w-4xl mx-auto py-24 md:py-32 px-4 scroll-mt-24"'
    )
    
    # Other sections (py-12 px-4)
    content = content.replace(
        'className="py-12 px-4"',
        'className="py-24 md:py-32 px-4 scroll-mt-24"'
    )
    
    # 2. Fix Card Layouts in Projects
    # <Card className="overflow-hidden bg-black/40 backdrop-blur-sm border border-cyan-500/30 h-full group hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-300">
    #   <CardContent className="p-6 relative h-full"> ...
    #   <div className="mt-2 text-right"> <a ... View Project </a> </div>
    
    content = content.replace(
        'className="overflow-hidden bg-black/40 backdrop-blur-sm border border-cyan-500/30 h-full group hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-300"',
        'className="overflow-hidden bg-black/40 backdrop-blur-sm border border-cyan-500/30 h-full flex flex-col group hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-300"'
    )
    
    content = content.replace(
        'className="p-6 relative h-full"',
        'className="p-6 relative flex flex-col flex-grow"'
    )
    
    # The view project button wrapper:
    content = content.replace(
        'className="mt-2 text-right"',
        'className="mt-auto pt-4 text-right"'
    )

    with open(filepath, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    fix_layout()
