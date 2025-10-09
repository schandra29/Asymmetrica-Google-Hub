# How to Copy Documents for Synthesis

## Step-by-Step:

### 1. Find Your Mystical Documents

Look for the OLDEST markdown files from:
- iPermit-rebuild
- asymmetrica-masterhub  
- vaql-quantum-language
- asymmbill

### 2. Copy to Source Materials

**Target Directory:**
`C:\Projects\asymmetrica-google-hub\source_materials\grimoire_archive\`

**How to Copy:**

#### Option A: Windows Explorer
1. Open: `C:\Projects\asymmetrica-google-hub\source_materials\grimoire_archive\`
2. Open another window with your old docs
3. Copy/paste markdown files

#### Option B: Command Line
```bash
# Example: Copy specific file
cp "C:/Projects/asymmetrica-masterhub/early-discovery.md" "C:/Projects/asymmetrica-google-hub/source_materials/grimoire_archive/"

# Example: Copy all .md from a folder
cp "C:/Projects/asymmetrica-masterhub/grimoire-phase/"*.md "C:/Projects/asymmetrica-google-hub/source_materials/grimoire_archive/"
```

### 3. Verify Files Copied

```bash
cd C:/Projects/asymmetrica-google-hub
ls -la source_materials/grimoire_archive/
```

### 4. Commit to Git

```bash
cd C:/Projects/asymmetrica-google-hub
git add source_materials/grimoire_archive/
git commit -m "feat: add grimoire archive documents for synthesis stress test"
git push
```

### 5. Trigger Jules

At jules.google.com:
"Please synthesize all documents in source_materials/grimoire_archive/ 
using the Neutral Historian protocol."

Done! 🚀
