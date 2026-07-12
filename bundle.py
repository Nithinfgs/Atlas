# Atlas Single-File Standalone Bundler

import os
import re

def bundle():
    base_dir = "/Users/nithinselvaraj/.gemini/antigravity/scratch/atlas"
    
    # Read core HTML
    with open(os.path.join(base_dir, "index.html"), "r") as f:
        html = f.read()

    # Inline Stylesheet
    with open(os.path.join(base_dir, "styles.css"), "r") as f:
        css = f.read()
    
    html = re.sub(
        r'<link rel="stylesheet" href="styles.css">',
        f'<style>\n{css}\n</style>',
        html
    )

    # Inline JS Modules
    js_files = ["data.js", "graph.js", "simulator.js", "gitmachine.js", "scanners.js", "ai.js", "app.js"]
    js_bundle = ""
    for js_file in js_files:
        with open(os.path.join(base_dir, js_file), "r") as f:
            js_content = f.read()
        js_bundle += f"\n// --- INLINED: {js_file} ---\n{js_content}\n"

    # Remove all discrete scripts imports
    html = re.sub(
        r'<script src="data.js"></script>.*<script src="app.js"></script>',
        "",
        html,
        flags=re.DOTALL
    )
    # Also handle in case spacing is different
    html = re.sub(r'<script src=".*"></script>', "", html)
    
    # Append combined script before body closes
    html = html.replace("</body>", f"<script>\n{js_bundle}\n</script>\n</body>")

    # Output standalone file
    dest_path = "/Users/nithinselvaraj/Desktop/Atlas.html"
    
    # Create Desktop copy
    try:
        with open(dest_path, "w") as f:
            f.write(html)
        print(f"SUCCESS: Standalone app bundled at {dest_path}")
    except Exception as e:
        print(f"ERROR: Could not write to Desktop: {e}")

if __name__ == "__main__":
    bundle()
