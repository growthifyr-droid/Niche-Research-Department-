# Niche Research Department (Desktop Application Foundation)

> **Prompt 1 Milestone**: Complete Electron Desktop Skeleton, Luxury UI Shell, In-App Auto-Updater, GitHub Actions Build & Release Pipeline, and Zero-Data-Loss SQLite Setup.

---

## 1. Overview & Architecture

**Niche Research Department** is an institutional-grade desktop research application engineered to orchestrate a department of 35 autonomous AI research agents. 

This foundation establishes the secure desktop runtime, window state management, offline font rendering, dark/light luxury theme system, SQLite persistence layer, and a fully real in-app auto-updater backed by GitHub Releases.

```
┌─────────────────────────────────────────────────────────────┐
│                       ELECTRON MAIN                         │
│  • Single Instance Lock                                     │
│  • Safe Storage in app.getPath('userData')                  │
│  • better-sqlite3 with WAL Mode & Foreign Keys              │
│  • electron-updater (GitHub Releases Provider)              │
│  • Window Geometry & State Persistence                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                Secure Preload (contextBridge IPC)
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    REACT RENDERER (Vite)                    │
│  • Outfit Font (Bundled locally for 100% offline usage)     │
│  • Pure CSS Variable Theme System (Obsidian & Porcelain)    │
│  • Real-time Download Progress (% & MB) from IPC Events     │
│  • Reusable Toast Notification System                       │
│  • Modular View Routing (Dashboard, New Research, Modules,  │
│    Reports, Consultant Chat, Scheduler, Settings)           │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Zero Data Loss Architecture (Data Safety Guarantee)

A critical mandate of this application is **guaranteed zero data loss** when auto-updates install:

1. **Storage Isolation**:
   - All SQLite database files (`niche-research.db`, WAL journals), application settings, and future research report caches are saved in `app.getPath('userData')`.
   - On Windows 10/11: `%APPDATA%\niche-research-department\`
2. **Untouched During Binary Updates**:
   - The application installer replaces only executable and asset binaries inside `%LOCALAPPDATA%\Programs\niche-research-department\`.
   - The `deleteAppDataOnUninstall: false` NSIS setting guarantees that even uninstalling/reinstalling never wipes user research databases.

---

## 3. GitHub Actions Setup & CI/CD Pipeline

The repository includes a fully automated GitHub Actions pipeline in `.github/workflows/build-and-release.yml`. Every `git push` to `main` builds the Windows `.exe` installer and publishes a new release.

### Step A: Create GitHub Repository & Add Secret
1. Create a GitHub repository (e.g. `your-username/niche-research-department`).
2. Generate a GitHub Personal Access Token (Classic or Fine-Grained) with `repo` (write) scope:
   - Go to **GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)**.
   - Click **Generate new token**.
   - Select the `repo` scope and generate.
3. Add the token to your repository secrets:
   - In your repository, click **Settings → Secrets and variables → Actions**.
   - Click **New repository secret**.
   - Name: `GH_TOKEN`
   - Value: Paste your personal access token.
4. Update `publish` in `electron-builder.json` with your GitHub username/organization and repository name:
   ```json
   "publish": {
     "provider": "github",
     "owner": "YOUR_GITHUB_USERNAME",
     "repo": "niche-research-department"
   }
   ```

### Step B: The Automated Build & Release Flow
1. Update `"version"` in `package.json` (e.g., `1.0.1`).
2. Commit and push your code to the `main` branch:
   ```bash
   git add .
   git commit -m "Release v1.0.1"
   git push origin main
   ```
3. GitHub Actions triggers automatically:
   - Checks out code on a Windows runner (`windows-latest`).
   - Installs dependencies (`npm ci`).
   - Builds Vite web renderer and compiles Electron main/preload.
   - Runs `electron-builder --win nsis --publish always`.
   - **Publishes the Windows Setup `.exe`, `latest.yml`, and `.blockmap` files directly to GitHub Releases**.

---

## 4. In-App Auto-Updater Flow

The in-app auto-updater is fully implemented with real logic:
1. **Silent Startup Check**: When the app opens, it waits 3.5 seconds and performs a non-blocking check against GitHub Releases.
2. **Clear UI Indicator**: When a new version is detected, the top title bar and sidebar prominently display the **"Update Available vX.X.X"** pill, and a toast notification prompts the user.
3. **Real-Time Download Tracking**: Clicking **"Download Update"** starts `electron-updater`'s native download process. The UI listens to `download-progress` events, rendering:
   - Exact percentage (e.g., `45.2%`)
   - Transferred MB vs. Total MB (e.g., `38.2 MB / 85.0 MB`)
   - Current network transfer speed (e.g., `4.5 MB/s`)
4. **One-Click Restart**: Once download completes, the **"Install & Restart"** button triggers `autoUpdater.quitAndInstall()`. The app gracefully closes, swaps binaries, and launches into the updated version with all SQLite user data intact.
5. **Manual Check**: Users can click **"Check for Updates"** anytime from the Settings page.

---

## 5. Local Development & Packaging

### Prerequisites
- Node.js 20+
- Windows 10 or 11 (for native Windows packaging)

### Commands
```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server (port 3000)
npm run dev

# 3. Compile Electron main & preload scripts
npm run build:electron

# 4. Compile full application (Renderer + Electron)
npm run build

# 5. Build Windows NSIS installer locally
npm run dist:win
```

The compiled installer will be output to the `release/` directory:
- `release/Niche Research Department-Setup-1.0.0.exe`
- `release/latest.yml`
- `release/Niche Research Department-Setup-1.0.0.exe.blockmap`

---

## 6. Windows SmartScreen & Code Signing Note

### Why does Windows SmartScreen ("Windows protected your PC") appear?
When you first run the generated `.exe` installer or update binary, Windows Defender SmartScreen may display an alert saying *"Windows protected your PC"* or *"Unknown publisher"*.
- **This is completely normal for newly generated open-source or indie executables.**
- Microsoft SmartScreen checks executables against a cloud reputation database. Because the application was built without an expensive corporate Extended Validation (EV) or Standard (OV) Authenticode certificate, Microsoft flags it as an "Unknown Publisher" until sufficient reputation is accumulated.

### How to Install / Run:
1. When the blue SmartScreen popup appears, click **"More info"**.
2. Click the **"Run anyway"** button that appears.
3. The installer will proceed with full publisher metadata ("Niche Research Department") and install to your chosen directory.

### How to Permanently Eliminate SmartScreen Warnings:
To permanently remove SmartScreen warnings for enterprise distribution, you can provide an Authenticode Code Signing Certificate:
1. Obtain a `.pfx` or `.p12` code signing certificate (e.g., from Sectigo, DigiCert, or SSL.com).
2. Configure `electron-builder.json` with your certificate or pass it via GitHub Actions Secrets:
   ```json
   "win": {
     "certificateFile": "path/to/certificate.pfx",
     "certificatePassword": "YOUR_CERTIFICATE_PASSWORD"
   }
   ```
   *Alternatively, in CI/CD (GitHub Actions), set the `CSC_LINK` (base64-encoded .pfx) and `CSC_KEY_PASSWORD` secrets without modifying configuration files.*

---

## 7. Upcoming Architecture (Prompt 2+)

Future prompts will introduce the 35 autonomous AI research agents:
- **Phase 1**: Niche Discovery & SERP Crawlers (Search Query Expander, Trend Scanner)
- **Phase 2**: Market Moat & Competitor Analyzers (Reddit/Forum Pain-point Miners, Pricing Matrix)
- **Phase 3**: Synthesis & Financial Modelers (TAM/SAM Estimators, White-label Dossier Compilers)
- **Phase 4**: Multi-lingual Translation & Strategy Advisory Agent
