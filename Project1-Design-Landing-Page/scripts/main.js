document.addEventListener('DOMContentLoaded', () => {
  const landingPageTemplate = document.getElementById('landing-page-template');
  const liveDemoViewport = document.getElementById('viewport-canvas');
  const inspectCanvasContent = document.getElementById('inspect-canvas-content');

  // 1. Clone landing page template into viewports
  if (landingPageTemplate && liveDemoViewport && inspectCanvasContent) {
    const cloneLive = landingPageTemplate.content.cloneNode(true);
    const cloneInspect = landingPageTemplate.content.cloneNode(true);
    liveDemoViewport.appendChild(cloneLive);
    inspectCanvasContent.appendChild(cloneInspect);
  }

  // Helper to show a floating design spec toast notification
  const showToast = (message) => {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 3000);
  };

  // 2. Tab Navigation Logic
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.workspace-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      // Update active tab buttons
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update active panels
      panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `${targetTab}-panel`) {
          panel.classList.add('active');
        }
      });

      // Recalculate inspect highlights if transitioning into Inspect tab
      if (targetTab === 'inspect') {
        resetInspection();
      }
    });
  });

  // 3. Viewport Simulator Controls (Live Demo Panel)
  const viewportDesktopBtn = document.getElementById('viewport-desktop-btn');
  const viewportTabletBtn = document.getElementById('viewport-tablet-btn');
  const viewportMobileBtn = document.getElementById('viewport-mobile-btn');
  const currentWidthEl = document.getElementById('current-width');
  const currentHeightEl = document.getElementById('current-height');

  const setViewport = (device, width, height) => {
    // Reset active button classes
    [viewportDesktopBtn, viewportTabletBtn, viewportMobileBtn].forEach(btn => btn.classList.remove('active'));
    
    // Set simulator size and class
    liveDemoViewport.className = `viewport-${device}`;
    liveDemoViewport.style.width = width === '100%' ? '100%' : `${width}px`;
    liveDemoViewport.style.maxWidth = width === '100%' ? '1440px' : `${width}px`;
    liveDemoViewport.style.height = height === '100%' ? '100%' : `${height}px`;

    // Update width/height metadata texts
    currentWidthEl.textContent = width === '100%' ? '1440' : width;
    currentHeightEl.textContent = height === '100%' ? '820' : height;
  };

  if (viewportDesktopBtn && viewportTabletBtn && viewportMobileBtn) {
    viewportDesktopBtn.addEventListener('click', () => {
      viewportDesktopBtn.classList.add('active');
      setViewport('desktop', '100%', '100%');
    });

    viewportTabletBtn.addEventListener('click', () => {
      viewportTabletBtn.classList.add('active');
      setViewport('tablet', '768', '1024');
    });

    viewportMobileBtn.addEventListener('click', () => {
      viewportMobileBtn.classList.add('active');
      setViewport('mobile', '375', '667');
    });
  }

  // 4. Component Showcase Code Tab Switchers
  const codePanels = document.querySelectorAll('.code-panel');
  codePanels.forEach(panel => {
    const tabs = panel.querySelectorAll('.code-tab-btn');
    const contents = panel.querySelectorAll('.code-content');

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        contents.forEach((c, idx) => {
          c.style.display = idx === index ? 'block' : 'none';
        });
      });
    });
  });

  // 5. Interactive Prototype Flow & Modal Actions (within Live Demo)
  const setupPrototypeFlow = (container) => {
    const ctaScrollButtons = container.querySelectorAll('.btn-landing-cta');
    const ctaTarget = container.querySelector('#cta-target');
    const signupForm = container.querySelector('#landing-email-form');
    const emailInput = container.querySelector('#landing-email-input');
    const errorText = container.querySelector('#email-error-text');
    const successModal = document.getElementById('prototype-success-modal');
    const resetSuccessBtn = document.getElementById('btn-success-reset');
    
    // Smooth scroll to CTA section
    ctaScrollButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (ctaTarget) {
          ctaTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });

    // Pricing link alert logic
    const pricingLink = container.querySelector('#nav-pricing-link');
    if (pricingLink) {
      pricingLink.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Apex is currently 100% free during public beta! 🚀');
      });
    }

    // Watch Demo button interaction
    const demoBtn = container.querySelector('#hero-demo-btn');
    if (demoBtn) {
      demoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Play Demo: Initializing interactive product tour simulation... 🎬');
      });
    }

    // Footer Links alert logic
    const termsLink = container.querySelector('#footer-terms-link');
    const privacyLink = container.querySelector('#footer-privacy-link');
    if (termsLink) {
      termsLink.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Terms of Service: Opening legal agreement... 📄');
      });
    }
    if (privacyLink) {
      privacyLink.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Privacy Policy: Opening privacy guidelines... 🔒');
      });
    }

    // Form Submission & Validation
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailVal = emailInput.value.trim();
        const emailRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

        if (!emailVal || !emailRegex.test(emailVal)) {
          emailInput.classList.add('error');
          if (errorText) errorText.style.display = 'block';
        } else {
          emailInput.classList.remove('error');
          if (errorText) errorText.style.display = 'none';
          
          // Trigger success modal
          if (successModal) {
            successModal.classList.add('active');
          }
        }
      });

      // Clear error states on type
      emailInput.addEventListener('input', () => {
        emailInput.classList.remove('error');
        if (errorText) errorText.style.display = 'none';
      });
    }

    // Success Modal Close / Demo Reset
    if (resetSuccessBtn && successModal) {
      resetSuccessBtn.addEventListener('click', () => {
        successModal.classList.remove('active');
        if (emailInput) emailInput.value = '';
        container.scrollTop = 0; // scroll back to top of viewport
      });
    }
  };

  // Setup prototype handlers on the live demo container
  setupPrototypeFlow(liveDemoViewport);


  // 6. Figma-like Developer Inspect Mode Logic
  const inspectCanvasViewport = document.getElementById('inspect-canvas-viewport');
  const inspectOverlayContainer = document.getElementById('inspect-overlay-container');
  const hoverOutline = document.getElementById('hover-outline');
  const hoverTooltip = document.getElementById('hover-tooltip');
  const selectOutline = document.getElementById('select-outline');
  const selectTooltip = document.getElementById('select-tooltip');
  const spacingGuidesBox = document.getElementById('spacing-guides-box');

  const inspectEmptyState = document.getElementById('inspect-empty-state');
  const inspectDetails = document.getElementById('inspect-details');

  // Sidebar info fields
  const specElemTag = document.getElementById('inspect-elem-tag');
  const specWidth = document.getElementById('spec-width');
  const specHeight = document.getElementById('spec-height');
  const specRadius = document.getElementById('spec-radius');
  const specPadding = document.getElementById('spec-padding');
  const specMargin = document.getElementById('spec-margin');
  const specGap = document.getElementById('spec-gap');
  
  const specFontFamily = document.getElementById('spec-font-family');
  const specFontSize = document.getElementById('spec-font-size');
  const specFontWeight = document.getElementById('spec-font-weight');
  const specLineHeight = document.getElementById('spec-line-height');
  
  const specTextColor = document.getElementById('spec-text-color');
  const specBgColor = document.getElementById('spec-bg-color');
  const specBorder = document.getElementById('spec-border');
  const specCssCode = document.getElementById('spec-css-code');

  let selectedElement = null;

  const resetInspection = () => {
    selectedElement = null;
    hoverOutline.style.display = 'none';
    selectOutline.style.display = 'none';
    spacingGuidesBox.innerHTML = '';
    
    if (inspectEmptyState && inspectDetails) {
      inspectEmptyState.style.display = 'flex';
      inspectDetails.style.display = 'none';
    }
  };

  // Translate RGB/RGBA colors to clean HEX for spec handoff
  const rgbToHex = (rgbString) => {
    if (!rgbString || rgbString === 'transparent' || rgbString === 'rgba(0, 0, 0, 0)') return 'transparent';
    const match = rgbString.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
    if (!match) return rgbString;
    
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    
    if (match[4] !== undefined) {
      const a = Math.round(parseFloat(match[4]) * 255).toString(16).padStart(2, '0');
      return `#${r}${g}${b}${a}`.toUpperCase();
    }
    return `#${r}${g}${b}`.toUpperCase();
  };

  // Inspect Hover Tracking
  inspectCanvasContent.addEventListener('mousemove', (e) => {
    // Avoid tracking root background or guide highlights
    if (e.target.classList.contains('landing-page-root') || e.target === inspectCanvasContent) {
      hoverOutline.style.display = 'none';
      return;
    }

    const canvasRect = inspectCanvasViewport.getBoundingClientRect();
    const targetRect = e.target.getBoundingClientRect();

    const top = targetRect.top - canvasRect.top + inspectCanvasViewport.scrollTop;
    const left = targetRect.left - canvasRect.left;
    const width = targetRect.width;
    const height = targetRect.height;

    // Apply layout positions to hover outline
    hoverOutline.style.display = 'block';
    hoverOutline.style.top = `${top}px`;
    hoverOutline.style.left = `${left}px`;
    hoverOutline.style.width = `${width}px`;
    hoverOutline.style.height = `${height}px`;

    // Tooltip width x height
    hoverTooltip.textContent = `${Math.round(width)} x ${Math.round(height)}px`;
  });

  inspectCanvasContent.addEventListener('mouseleave', () => {
    hoverOutline.style.display = 'none';
  });

  // Draw Figma Spacing Guides (between element and parent)
  const drawSpacingGuides = (element) => {
    spacingGuidesBox.innerHTML = '';
    const parent = element.parentElement;
    if (!parent) return;

    const canvasRect = inspectCanvasViewport.getBoundingClientRect();
    const selRect = element.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    // Relative coordinates
    const selRelative = {
      top: selRect.top - canvasRect.top,
      bottom: selRect.bottom - canvasRect.top,
      left: selRect.left - canvasRect.left,
      right: selRect.right - canvasRect.left,
      width: selRect.width,
      height: selRect.height
    };

    const parentRelative = {
      top: parentRect.top - canvasRect.top,
      bottom: parentRect.bottom - canvasRect.top,
      left: parentRect.left - canvasRect.left,
      right: parentRect.right - canvasRect.left
    };

    // Calculate gap spaces
    const spaceTop = Math.round(selRelative.top - parentRelative.top);
    const spaceBottom = Math.round(parentRelative.bottom - selRelative.bottom);
    const spaceLeft = Math.round(selRelative.left - parentRelative.left);
    const spaceRight = Math.round(parentRelative.right - selRelative.right);

    // 1. Top Guide Line
    if (spaceTop > 0) {
      const guide = document.createElement('div');
      guide.className = 'spacing-guide-line vertical';
      guide.style.top = `${parentRelative.top}px`;
      guide.style.left = `${selRelative.left + selRelative.width / 2}px`;
      guide.style.height = `${spaceTop}px`;
      
      const label = document.createElement('span');
      label.className = 'spacing-guide-label';
      label.textContent = `${spaceTop}`;
      label.style.top = `${spaceTop / 2}px`;
      
      guide.appendChild(label);
      spacingGuidesBox.appendChild(guide);
    }

    // 2. Bottom Guide Line
    if (spaceBottom > 0) {
      const guide = document.createElement('div');
      guide.className = 'spacing-guide-line vertical';
      guide.style.top = `${selRelative.bottom}px`;
      guide.style.left = `${selRelative.left + selRelative.width / 2}px`;
      guide.style.height = `${spaceBottom}px`;
      
      const label = document.createElement('span');
      label.className = 'spacing-guide-label';
      label.textContent = `${spaceBottom}`;
      label.style.top = `${spaceBottom / 2}px`;
      
      guide.appendChild(label);
      spacingGuidesBox.appendChild(guide);
    }

    // 3. Left Guide Line
    if (spaceLeft > 0) {
      const guide = document.createElement('div');
      guide.className = 'spacing-guide-line horizontal';
      guide.style.top = `${selRelative.top + selRelative.height / 2}px`;
      guide.style.left = `${parentRelative.left}px`;
      guide.style.width = `${spaceLeft}px`;
      
      const label = document.createElement('span');
      label.className = 'spacing-guide-label';
      label.textContent = `${spaceLeft}`;
      label.style.left = `${spaceLeft / 2}px`;
      
      guide.appendChild(label);
      spacingGuidesBox.appendChild(guide);
    }

    // 4. Right Guide Line
    if (spaceRight > 0) {
      const guide = document.createElement('div');
      guide.className = 'spacing-guide-line horizontal';
      guide.style.top = `${selRelative.top + selRelative.height / 2}px`;
      guide.style.left = `${selRelative.right}px`;
      guide.style.width = `${spaceRight}px`;
      
      const label = document.createElement('span');
      label.className = 'spacing-guide-label';
      label.textContent = `${spaceRight}`;
      label.style.left = `${spaceRight / 2}px`;
      
      guide.appendChild(label);
      spacingGuidesBox.appendChild(guide);
    }
  };

  // Inspect Element Selection
  inspectCanvasContent.addEventListener('click', (e) => {
    if (e.target.classList.contains('landing-page-root') || e.target === inspectCanvasContent) {
      resetInspection();
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    selectedElement = e.target;

    const canvasRect = inspectCanvasViewport.getBoundingClientRect();
    const targetRect = selectedElement.getBoundingClientRect();

    const top = targetRect.top - canvasRect.top + inspectCanvasViewport.scrollTop;
    const left = targetRect.left - canvasRect.left;
    const width = targetRect.width;
    const height = targetRect.height;

    // Position active Selection Outline
    selectOutline.style.display = 'block';
    selectOutline.style.top = `${top}px`;
    selectOutline.style.left = `${left}px`;
    selectOutline.style.width = `${width}px`;
    selectOutline.style.height = `${height}px`;

    // Tooltip name + dimensions
    const tagName = selectedElement.tagName.toLowerCase();
    const classes = selectedElement.className ? `.${[...selectedElement.classList].filter(c => c !== 'error').join('.')}` : '';
    selectTooltip.textContent = `${tagName}${classes.substring(0, 16)} | ${Math.round(width)} x ${Math.round(height)}px`;

    // Draw parent/sibling spacing guides
    drawSpacingGuides(selectedElement);

    // Update Right Inspector Panel details
    inspectEmptyState.style.display = 'none';
    inspectDetails.style.display = 'block';

    const style = window.getComputedStyle(selectedElement);

    // Node Information
    specElemTag.textContent = `${tagName}${classes}`;
    
    // Auto Layout properties
    specWidth.textContent = `${Math.round(width)}px`;
    specHeight.textContent = `${Math.round(height)}px`;
    specRadius.textContent = style.borderRadius || '0px';
    specPadding.textContent = style.padding || '0px';
    specMargin.textContent = style.margin || '0px';
    specGap.textContent = style.gap && style.gap !== 'normal' ? style.gap : 'None';

    // Typography block display rules
    const hasTypography = ['h1', 'h2', 'h3', 'p', 'span', 'a', 'button', 'input', 'footer', 'label'].includes(tagName) || style.fontSize;
    const typographyBlock = document.getElementById('block-typography');
    if (hasTypography && typographyBlock) {
      typographyBlock.style.display = 'block';
      specFontFamily.textContent = style.fontFamily.split(',')[0].replace(/['"]/g, '');
      specFontSize.textContent = style.fontSize;
      specFontWeight.textContent = style.fontWeight;
      specLineHeight.textContent = style.lineHeight !== 'normal' ? style.lineHeight : 'Normal';
    } else if (typographyBlock) {
      typographyBlock.style.display = 'none';
    }

    // Colors Spec details
    specTextColor.textContent = rgbToHex(style.color);
    specBgColor.textContent = rgbToHex(style.backgroundColor);
    specBorder.textContent = style.border !== '0px none rgb(249, 250, 251)' && style.border !== 'none' ? style.border : 'None';

    // CSS Code compiler for specs panel
    let cssCode = '';
    if (style.display && style.display !== 'inline') cssCode += `display: ${style.display};\n`;
    if (style.flexDirection && style.display === 'flex') cssCode += `flex-direction: ${style.flexDirection};\n`;
    if (style.gap && style.gap !== 'normal') cssCode += `gap: ${style.gap};\n`;
    if (style.padding && style.padding !== '0px') cssCode += `padding: ${style.padding};\n`;
    if (style.margin && style.margin !== '0px') cssCode += `margin: ${style.margin};\n`;
    if (style.borderRadius && style.borderRadius !== '0px') cssCode += `border-radius: ${style.borderRadius};\n`;
    if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') cssCode += `background: ${rgbToHex(style.backgroundColor)};\n`;
    if (style.border && style.border !== 'none' && !style.border.includes('0px')) cssCode += `border: ${style.border};\n`;
    
    if (hasTypography) {
      cssCode += `font-family: ${style.fontFamily.split(',')[0]};\n`;
      cssCode += `font-size: ${style.fontSize};\n`;
      cssCode += `font-weight: ${style.fontWeight};\n`;
      if (style.color) cssCode += `color: ${rgbToHex(style.color)};\n`;
    }
    
    specCssCode.textContent = cssCode || '/* Default styling rules applied */';
  });

  // Re-adjust selection boundary rects on canvas scrolls
  const inspectCanvasWrapper = inspectCanvasViewport.parentElement;
  if (inspectCanvasWrapper) {
    inspectCanvasWrapper.addEventListener('scroll', () => {
      if (selectedElement) {
        const canvasRect = inspectCanvasViewport.getBoundingClientRect();
        const targetRect = selectedElement.getBoundingClientRect();
        const top = targetRect.top - canvasRect.top;
        const left = targetRect.left - canvasRect.left;

        selectOutline.style.top = `${top}px`;
        selectOutline.style.left = `${left}px`;
        
        drawSpacingGuides(selectedElement);
      }
    });
  }

  // Interactivity for copying Hex swatch values
  const swatches = document.querySelectorAll('.swatch-item');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const hex = swatch.getAttribute('data-color');
      navigator.clipboard.writeText(hex).then(() => {
        const valSpan = swatch.querySelector('.swatch-val');
        const originalText = valSpan.textContent;
        valSpan.textContent = 'COPIED!';
        valSpan.style.color = 'var(--color-success)';
        setTimeout(() => {
          valSpan.textContent = originalText;
          valSpan.style.color = 'var(--text-secondary)';
        }, 1200);
      });
    });
  });

  // Asset Export demo behavior
  const btnExportAssets = document.getElementById('btn-export-assets');
  if (btnExportAssets) {
    btnExportAssets.addEventListener('click', () => {
      alert('Asset Pack Generated!\n\nDownloaded:\n- icon-sparkles.svg\n- icon-grid-layout.svg\n- icon-multiplayer.svg\n- hero-illustration@2x.png');
    });
  }

  const btnShare = document.getElementById('btn-share');
  if (btnShare) {
    btnShare.addEventListener('click', () => {
      alert('Spec Handoff Link Copied to Clipboard!');
    });
  }

  // 7. Layout Grid Visibility Toggle
  const btnToggleGrid = document.getElementById('btn-toggle-grid');
  if (btnToggleGrid) {
    btnToggleGrid.addEventListener('click', () => {
      const overlays = document.querySelectorAll('.grid-overlay');
      const isActive = btnToggleGrid.classList.toggle('active');
      
      overlays.forEach(overlay => {
        overlay.style.display = isActive ? 'grid' : 'none';
      });

      // Update button styling visually
      if (isActive) {
        btnToggleGrid.style.backgroundColor = 'var(--brand-primary)';
        btnToggleGrid.style.borderColor = 'var(--brand-primary)';
        btnToggleGrid.style.color = '#fff';
      } else {
        btnToggleGrid.style.backgroundColor = '';
        btnToggleGrid.style.borderColor = '';
        btnToggleGrid.style.color = '';
      }
    });
  }
});
