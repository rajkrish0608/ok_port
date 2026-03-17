import re

def swap_sections():
    filepath = '/Users/rajkrish0608/PROJECT DETAILS/Portfolio/My-Portfolio-main/src/components/Portfolio.jsx'
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Update the nav order
    nav_old = "['home', 'about', 'projects', 'skills', 'contact', 'awards']"
    nav_new = "['home', 'about', 'projects', 'skills', 'awards', 'contact']"
    content = content.replace(nav_old, nav_new)

    # 2. Extract sections
    # A section starts with <motion.section id="contact" and ends with </motion.section>
    
    # Let's find the exact bounds for Contact and Awards
    # We can use regex to extract the full blocks assuming no nested motion.sections
    contact_match = re.search(r'(<motion\.section[^>]*id="contact"[\s\S]*?</motion\.section>)', content)
    awards_match = re.search(r'(<motion\.section[^>]*id="awards"[\s\S]*?</motion\.section>)', content)
    
    if contact_match and awards_match:
        contact_block = contact_match.group(1)
        awards_block = awards_match.group(1)
        
        # We know current order is Contact then Awards
        # Let's verify they are adjacent or we can just replace them both
        
        # We can replace the contact_block with awards_block and awards_block with contact_block
        # To avoid issues with replacing the first one and messing up the second search,
        # we can find their indices
        
        idx_contact = content.find(contact_block)
        idx_awards = content.find(awards_block)
        
        if idx_contact < idx_awards:
            # Reconstruct string
            before = content[:idx_contact]
            middle = content[idx_contact + len(contact_block):idx_awards]
            after = content[idx_awards + len(awards_block):]
            
            new_content = before + awards_block + middle + contact_block + after
            
            with open(filepath, 'w') as f:
                f.write(new_content)
            print("Successfully swapped sections.")
        else:
            print("Sections are already in the correct order or not found as expected.")
    else:
        print("Could not find one or both sections.")

if __name__ == "__main__":
    swap_sections()
