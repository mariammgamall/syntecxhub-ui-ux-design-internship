# SyntecxHub UI/UX & Frontend Design Internship Portfolio

Welcome to my frontend engineering and UI/UX design internship repository. This workspace hosts two high-fidelity, interactive projects that bridge the gap between design handoffs (like Figma) and pixel-perfect, interactive frontend implementations.

Each project is built using **Vanilla HTML5, CSS3, and JavaScript** to showcase core programming skills, clean CSS architectures, state machines, and micro-animations without relying on heavy external frameworks.

---

## 📂 Repository Projects Overview

| Project | Key Concepts | Live Link |
| :--- | :--- | :--- |
| **Project 1: Apex SaaS Landing Page & Design Spec Workspace** | Viewport simulator, layout grids, box-model spec calculator, runtime RGB-to-Hex translation, copy-ready code blocks, form validation. | [View Project 1 Directory](./Project1-Design-Landing-Page/) |
| **Project 2: Zenith ANC Headphones E-Commerce Product Details** | E-commerce layout, Smart Animate overlay (300ms ease-out), sequential cart micro-interactions, Figma component property inspector, sidebar collapse. | [View Project 2 Directory](./Project2-E-Commerce-Product-Details-Page/) |

---

## 💻 Project 1: Apex — Design Handoff & Spec Workspace

**Apex** is an interactive Design Spec Workspace and living Component Library built for a SaaS Landing Page. It features a fully interactive preview canvas, simulating a Figma-like editor where developers can click and hover on elements to measure spacings and inspect metrics in real time.

### Key Features
*   **Viewport Simulator**: Scales the preview container fluidly between **Desktop**, **Tablet (768px)**, and **Mobile (375px)** widths with live dimensions tracking.
*   **Layout Grid Columns**: Toggles an overlay grid (12-column grid system) directly matching Figma layout grids.
*   **Developer Spec Inspector**: Clicking or hovering over any element renders red dashed guide lines showing distances in pixels to its parent borders, while a right-side panel reports box-model dimensions, margins, paddings, gaps, and computed CSS.
*   **Hex Color Clipboard**: Displays active color swatches on the left, automatically translating computed RGB colors into copy-ready Hex strings (`#RRGGBB`) with clipboard copy toast feedback.
*   **CTA Validation Flow**: Validates subscriber emails with custom JS regex, prompting layout error borders or a success popup modal.

### Screenshot Showcase
![Desktop View (Hero)](./Project1-Design-Landing-Page/screenshots/1a-desktop-hero.png)
*Desktop Preview of the Interactive Workspace showing the Spec Canvas*

| Viewport Simulator | CSS Developer Inspector | Custom Success Modal |
| :---: | :---: | :---: |
| ![Tablet View](./Project1-Design-Landing-Page/screenshots/2-tablet-viewport.png) | ![Metrics Inspector](./Project1-Design-Landing-Page/screenshots/14-inspect-right-code-sidebar.png) | ![Success Modal](./Project1-Design-Landing-Page/screenshots/6-cta-success-modal.png) |

👉 **Open Project 1**: [Project1-Design-Landing-Page/index.html](./Project1-Design-Landing-Page/index.html)

---

## 🎧 Project 2: Zenith ANC Headphones — Interactive Product Details

**Zenith** is a high-fidelity e-commerce Product Detail Page (PDP) designed to demonstrate state transitions, interactive variants, and prominent CTA micro-interactions. It features a responsive layout alongside a simulated **Figma Component Inspector** sidebar.

### Key Features
*   **Smart Animate Image Gallery**: Tapping thumbnails swaps images smoothly. Clicking the main image opens a full-bleed dark blurred overlay mimicking Figma's **Smart Animate** (300ms ease-out).
*   **Interactive Design Variants**: Handles color swatches and size buttons across multiple variants:
    *   *Colors*: Selected (gold active ring and outer glow), Default, and Out of Stock (faded opacity with diagonal line).
    *   *Sizes*: Selected (gold fill and outline), Default, and Disabled (dashed border, muted text, disabled pointer events).
*   **Bi-directional Properties Panel**: Changing variant selections on the PDP updates the Figma Properties Panel dropdowns. Toggling variables (Boolean: On Sale, Text Properties, Instance Swaps) in the panel instantly renders changes on the PDP.
*   **Cart Micro-interaction**: A custom JS state machine controls the CTA: **Default** $\rightarrow$ **Loading** (with spin loader) $\rightarrow$ **Success** (with checkmark icon) $\rightarrow$ **Reverts back**.
*   **Sidebar Toggle**: A header action collapses and slides the Figma Inspector sidebar out of view for a clean storefront screenshot view.

### Screenshot Showcase
![Zenith PDP Full View](./Project2-E-Commerce-Product-Details-Page/screenshots/01_pdp_full_layout_dark.png)
*Zenith Headphones Product Details with Figma Inspector Sidebar active*

| Collapsed Storefront View | Image Zoom Overlay | Add to Cart Spinner State |
| :---: | :---: | :---: |
| ![Storefront View](./Project2-E-Commerce-Product-Details-Page/screenshots/02_pdp_storefront_view.png) | ![Smart Animate Zoom](./Project2-E-Commerce-Product-Details-Page/screenshots/05_gallery_smart_animate_zoomed.png) | ![CTA Loading State](./Project2-E-Commerce-Product-Details-Page/screenshots/12_cta_button_loading_spinner.png) |

👉 **Open Project 2**: [Project2-E-Commerce-Product-Details-Page/index.html](./Project2-E-Commerce-Product-Details-Page/index.html)

---

## ⚙️ How to Run Locally

Since both projects consist of static client-side files, you do not need build steps, bundling, or packages installed. 

### Method 1: Direct File Launch (Easiest)
Navigate into either project folder and double-click the `index.html` file to open and preview the interactive page in your browser directly.

### Method 2: Launch Local HTTP Server
If you want to serve the files over a local web port (e.g. `localhost:8080`), open your terminal in the repository root folder:

**Using Node.js/NPM (Bypassing PowerShell execution policies on Windows):**
```bash
npx.cmd http-server -p 8080
```

**Using Python:**
```bash
python -m http.server 8080
```
Then open `http://localhost:8080` in your web browser and click on either project folder to load it.

---

## 🎓 Skills Demonstrated

*   **Semantic HTML5 & DOM Architecture**: Structuring canvas simulators and product screens using native DOM templates.
*   **Modern CSS3 Layouts & Animations**: Creating layouts using custom properties (variables), flexible box layouts, grid tracks, container queries, backdrop filters, and keyframe animations.
*   **Vanilla JavaScript State Machines**: Implementing state transitions, asynchronous event loops (sequential timeouts), regular expressions, and bi-directional element binding.
*   **Interactive Prototyping**: Replicating complex UI interactions (Smart Animate, collapsibles, custom loaders, modal overlays) based on design tools specifications.
