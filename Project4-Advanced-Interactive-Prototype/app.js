/* ==========================================================================
   NEBULA PAY & SMART SPACE - INTERACTION CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // Core Easing Presets Mapping
  const easingCurves = {
    'spring-elastic': {
      curve: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      formula: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
    },
    'soft-anticipate': {
      curve: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      formula: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
    },
    'snappy-out': {
      curve: 'cubic-bezier(0.19, 1, 0.22, 1)',
      formula: 'cubic-bezier(0.19, 1, 0.22, 1)'
    },
    'smooth-inout': {
      curve: 'cubic-bezier(0.65, 0, 0.35, 1)',
      formula: 'cubic-bezier(0.65, 0, 0.35, 1)'
    },
    'linear': {
      curve: 'linear',
      formula: 'linear'
    }
  };

  /* ==========================================================================
     1. SIDEBAR CONTROLLER LOGIC
     ========================================================================== */
  const speedSlider = document.getElementById('speed-slider');
  const speedVal = document.getElementById('speed-val');
  const easingSelect = document.getElementById('easing-select');
  const easingFormula = document.getElementById('easing-formula');
  const themeBtns = document.querySelectorAll('.theme-btn');
  const toggleSlowMo = document.getElementById('toggle-slowmo');
  const toggleTrails = document.getElementById('toggle-trails');
  const exportBtn = document.getElementById('export-btn');
  const exportConsole = document.querySelector('.export-console');

  // Slow-Mo Mode Update
  const updateSpeedScale = () => {
    const scale = toggleSlowMo.checked ? 4 : 1;
    document.documentElement.style.setProperty('--anim-speed-scale', scale);
    addConsoleLine(`> Slow-Mo scaling multiplier updated to: ${scale}x`);
  };

  // Speed Slider Handler
  speedSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    speedVal.textContent = `${val}ms`;
    document.documentElement.style.setProperty('--anim-duration', `${val}ms`);
  });

  speedSlider.addEventListener('change', (e) => {
    addConsoleLine(`> Master transition duration set to: ${e.target.value}ms`);
  });

  // Easing Preset Selector
  easingSelect.addEventListener('change', (e) => {
    const preset = easingCurves[e.target.value];
    document.documentElement.style.setProperty('--anim-easing', preset.curve);
    easingFormula.textContent = preset.formula;
    addConsoleLine(`> Master transition curve updated to: ${e.target.value}`);
  });

  // Theme Customizer
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.getAttribute('data-theme');
      
      // Update body theme class
      document.body.className = '';
      document.body.classList.add(`theme-${theme}`);
      addConsoleLine(`> System design theme switched to: ${theme.toUpperCase()}`);
    });
  });

  // Slow-Mo Toggle
  toggleSlowMo.addEventListener('change', updateSpeedScale);

  // Motion Guides / Trails Toggle
  toggleTrails.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.body.classList.add('show-motion-trails');
      addConsoleLine(`> Motion guides & layout wireframes: ENABLED`);
    } else {
      document.body.classList.remove('show-motion-trails');
      addConsoleLine(`> Motion guides & layout wireframes: DISABLED`);
    }
  });

  // Console log utility
  function addConsoleLine(text) {
    const line = document.createElement('div');
    line.className = 'console-line';
    line.textContent = text;
    exportConsole.appendChild(line);
    exportConsole.scrollTop = exportConsole.scrollHeight;
  }

  // Portfolio Export Event Simulation
  exportBtn.addEventListener('click', () => {
    exportBtn.disabled = true;
    const btnText = exportBtn.querySelector('.btn-text');
    btnText.textContent = "Exporting...";
    
    addConsoleLine(`> Initiating export sequences...`);
    
    const steps = [
      { text: "> Inspecting DOM keyframe structures...", delay: 600 },
      { text: "> Extracting active bezier configurations...", delay: 1200 },
      { text: "> Rendering motion layout trails (60 fps)...", delay: 1800 },
      { text: "> Compiling portfolio-spec SVG assets...", delay: 2400 },
      { text: "> Interaction specs packet ready for download!", delay: 3000 }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        addConsoleLine(step.text);
        if (idx === steps.length - 1) {
          triggerSpecsDownload();
          btnText.textContent = "Generate Export Pack";
          exportBtn.disabled = false;
        }
      }, step.delay);
    });
  });

  function triggerSpecsDownload() {
    const specs = {
      projectName: "Nebula Pay & Smart Space",
      version: "1.0.0",
      interactionSpec: {
        easingCurvesApplied: {
          spring: document.documentElement.style.getPropertyValue('--anim-easing') || 'cubic-bezier(0.19, 1, 0.22, 1)',
          duration: speedVal.textContent
        },
        screensActive: ["BiometricLogin", "Dashboard", "CardManager", "Analytics", "SmartControls", "Sandbox"],
        themeSelected: document.body.className
      },
      exportDate: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(specs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "nebula_interaction_specs.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }


  /* ==========================================================================
     2. ROUTING & SCREEN NAVIGATION
     ========================================================================== */
  const screens = document.querySelectorAll('.app-screen');
  const bottomNav = document.getElementById('global-bottom-nav');
  const navItems = document.querySelectorAll('.nav-item');
  const backBtns = document.querySelectorAll('.back-btn');

  // Navigate to screen function
  function navigateTo(screenId) {
    screens.forEach(screen => {
      if (screen.id === screenId) {
        screen.classList.add('active');
      } else {
        screen.classList.remove('active');
      }
    });

    // Handle persistent Bottom Navigation bar visibility
    if (screenId === 'screen-login') {
      bottomNav.classList.add('hide');
    } else {
      bottomNav.classList.remove('hide');
    }

    // Sync bottom navigation active class
    navItems.forEach(item => {
      if (item.getAttribute('data-screen') === screenId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Special trigger: when navigating to screen-analytics, redraw/animate spending chart
    if (screenId === 'screen-analytics') {
      setTimeout(() => {
        triggerChartTransition(currentFilter);
      }, 100);
    }
  }

  // Bottom Nav items click
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const screenId = item.getAttribute('data-screen');
      navigateTo(screenId);
    });
  });

  // Back Buttons click
  backBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      navigateTo(target);
    });
  });


  /* ==========================================================================
     3. SCREEN 1: BIOMETRIC AUTHENTICATION
     ========================================================================== */
  const faceidTrigger = document.getElementById('faceid-trigger');
  const authStatusMsg = document.getElementById('auth-status-msg');
  const faceidContainer = faceidTrigger.parentElement;
  
  const faceIcon = faceidTrigger.querySelector('.auth-face');
  const checkIcon = faceidTrigger.querySelector('.auth-check');
  const lockIcon = faceidTrigger.querySelector('.auth-lock');

  let isScanning = false;

  faceidTrigger.addEventListener('click', () => {
    if (isScanning) return;
    isScanning = true;

    faceidTrigger.classList.add('scanning');
    faceidContainer.classList.add('scanning-active');
    authStatusMsg.textContent = "Scanning security nodes...";
    authStatusMsg.className = "auth-status";

    // Simulate scanning flow
    setTimeout(() => {
      // Logic success
      faceidTrigger.classList.remove('scanning');
      faceidTrigger.classList.add('success');
      faceidContainer.classList.remove('scanning-active');
      
      faceIcon.classList.add('hide');
      checkIcon.classList.remove('hide');
      
      authStatusMsg.textContent = "Decryption successful. Node unlocked.";
      authStatusMsg.classList.add('success');

      // Delay then enter Dashboard
      setTimeout(() => {
        navigateTo('screen-dashboard');
        
        // Reset Biometrics screen back to default state
        setTimeout(() => {
          faceidTrigger.classList.remove('success');
          checkIcon.classList.add('hide');
          faceIcon.classList.remove('hide');
          authStatusMsg.className = "auth-status";
          authStatusMsg.textContent = "Tap Face ID Scanner to authenticate";
          isScanning = false;
        }, 1000);
      }, 8000 * 0.1); // Fast enough transition
    }, 1500);
  });

  // Security keypad code entries
  const pinDots = document.querySelectorAll('.pin-dot');
  const keyBtns = document.querySelectorAll('.key-btn[data-val]');
  let enteredPin = [];

  keyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      
      if (val === 'del') {
        if (enteredPin.length > 0) {
          enteredPin.pop();
          updatePinDisplay();
        }
      } else {
        if (enteredPin.length < 4) {
          enteredPin.push(val);
          updatePinDisplay();
          
          if (enteredPin.length === 4) {
            // Validate pin
            setTimeout(validatePin, 250);
          }
        }
      }
    });
  });

  function updatePinDisplay() {
    pinDots.forEach((dot, index) => {
      if (index < enteredPin.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  }

  function validatePin() {
    // Arbitrary success code (e.g. all inputs)
    faceidTrigger.classList.add('success');
    faceIcon.classList.add('hide');
    checkIcon.classList.remove('hide');
    authStatusMsg.textContent = "Pin Accepted. Node Unlocked.";
    authStatusMsg.classList.add('success');
    
    setTimeout(() => {
      navigateTo('screen-dashboard');
      
      // Reset Pin entries
      enteredPin = [];
      updatePinDisplay();
      faceidTrigger.classList.remove('success');
      checkIcon.classList.add('hide');
      faceIcon.classList.remove('hide');
      authStatusMsg.className = "auth-status";
      authStatusMsg.textContent = "Tap Face ID Scanner to authenticate";
    }, 800);
  }


  /* ==========================================================================
     4. SCREEN 2: DASHBOARD & FLOATING MENU
     ========================================================================== */
  const fabTrigger = document.getElementById('fab-trigger');
  const fabMenu = document.getElementById('floating-action-menu');
  const fabLock = document.getElementById('fab-lock');

  fabTrigger.addEventListener('click', () => {
    fabMenu.classList.toggle('open');
  });

  // Re-lock device from quick actions menu
  fabLock.addEventListener('click', () => {
    fabMenu.classList.remove('open');
    navigateTo('screen-login');
    spawnToast('Security Alert', 'Interface node locked manually', 'alert');
  });

  // Handle other FAB sub-buttons clicks
  const fabSubBtns = document.querySelectorAll('.fab-sub-btn');
  if (fabSubBtns.length >= 2) {
    // Quick Pay
    fabSubBtns[0].addEventListener('click', (e) => {
      e.stopPropagation();
      fabMenu.classList.remove('open');
      spawnToast('QR Code Pay', 'Initializing camera node scanner...', 'success');
    });
    // Request Funds
    fabSubBtns[1].addEventListener('click', (e) => {
      e.stopPropagation();
      fabMenu.classList.remove('open');
      spawnToast('Request Funds', 'Generating instant payment link...', 'success');
    });
  }

  // Close fab menu if click falls outside
  document.addEventListener('click', (e) => {
    if (!fabMenu.contains(e.target) && fabMenu.classList.contains('open')) {
      fabMenu.classList.remove('open');
    }
  });

  // Stacking Card deck carousel flip/swap
  const card1 = document.getElementById('deck-card-1');
  const card2 = document.getElementById('deck-card-2');
  const indicators = document.querySelectorAll('.carousel-indicators .ind-dot');

  function swapCards() {
    const isCard1Active = card1.classList.contains('active-card');
    
    if (isCard1Active) {
      card1.classList.remove('active-card');
      card1.classList.add('next-card');
      
      card2.classList.remove('next-card');
      card2.classList.add('active-card');
      
      indicators[0].classList.remove('active');
      indicators[1].classList.add('active');
    } else {
      card2.classList.remove('active-card');
      card2.classList.add('next-card');
      
      card1.classList.remove('next-card');
      card1.classList.add('active-card');
      
      indicators[1].classList.remove('active');
      indicators[0].classList.add('active');
    }
  }

  card1.addEventListener('click', (e) => {
    if (card1.classList.contains('next-card')) {
      swapCards();
      e.stopPropagation();
    } else {
      // Go to card screen
      navigateTo('screen-cards');
    }
  });

  card2.addEventListener('click', (e) => {
    if (card2.classList.contains('next-card')) {
      swapCards();
      e.stopPropagation();
    } else {
      // Go to card screen
      navigateTo('screen-cards');
    }
  });

  // Operation widgets navigation shortcut
  document.getElementById('btn-quick-transfer').addEventListener('click', () => {
    navigateTo('screen-sandbox');
    spawnToast('Navigation', 'Loaded Sandbox components node', 'success');
  });

  document.getElementById('btn-quick-analytics').addEventListener('click', () => {
    navigateTo('screen-analytics');
  });

  document.getElementById('btn-quick-smart').addEventListener('click', () => {
    navigateTo('screen-smart');
  });

  document.getElementById('btn-quick-cards').addEventListener('click', () => {
    navigateTo('screen-cards');
  });

  // Recent transactions view-all navigation shortcut
  const viewAllLink = document.querySelector('.view-all-link');
  if (viewAllLink) {
    viewAllLink.addEventListener('click', () => {
      navigateTo('screen-analytics');
      spawnToast('Navigation', 'Loaded Spendings Analytics Node', 'success');
    });
  }

  // Spring widget Toggles
  const quickToggles = [
    { el: document.getElementById('toggle-ambient'), name: 'Neon Ambient Light' },
    { el: document.getElementById('toggle-workstation'), name: 'Work Station Node' }
  ];

  quickToggles.forEach(toggle => {
    toggle.el.addEventListener('click', () => {
      toggle.el.classList.toggle('active');
      const isActive = toggle.el.classList.contains('active');
      spawnToast('Smart Control', `${toggle.name} is now ${isActive ? 'ON' : 'OFF'}`, 'success');
    });
  });


  /* ==========================================================================
     5. SCREEN 3: 3D CARD MANAGER
     ========================================================================== */
  const flipCardInner = document.getElementById('interactive-flip-card');
  const gradientPickerBtns = document.querySelectorAll('.grad-picker-btn');
  const frontCard = document.querySelector('.flip-card-front');
  const toggleFreeze = document.getElementById('toggle-freeze');
  const toggleMask = document.getElementById('toggle-mask');
  const detailCardNumber = document.getElementById('detail-card-number');

  // Rotate card 3D
  flipCardInner.addEventListener('click', (e) => {
    // Avoid rotating if gradient button is clicked
    if (e.target.closest('.card-gradient-picker')) return;
    flipCardInner.classList.toggle('flipped');
  });

  // Front card gradient picker
  gradientPickerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent card flip
      gradientPickerBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const grad = btn.getAttribute('data-grad');
      frontCard.style.setProperty('--card-bg-gradient', grad);
      
      spawnToast('Card Customization', 'Card color profile updated', 'success');
    });
  });

  // Freeze Switch
  toggleFreeze.addEventListener('click', () => {
    toggleFreeze.classList.toggle('active');
    const isFrozen = toggleFreeze.classList.contains('active');
    frontCard.style.opacity = isFrozen ? '0.45' : '1';
    spawnToast('Security Lock', isFrozen ? 'Credit node FROZEN' : 'Credit node ACTIVE', isFrozen ? 'alert' : 'success');
  });

  // Mask digits toggle
  toggleMask.addEventListener('click', () => {
    toggleMask.classList.toggle('active');
    const isMasked = toggleMask.classList.contains('active');
    detailCardNumber.textContent = isMasked ? '•••• •••• •••• 9081' : '4532 9087 1256 9081';
    spawnToast('Privacy Protection', isMasked ? 'Digits masked' : 'Digits visible', 'success');
  });


  /* ==========================================================================
     6. SCREEN 4: spendings SVG CHART MORPHING & TOOLTIPS
     ========================================================================== */
  const chartLine = document.getElementById('chart-line');
  const chartArea = document.getElementById('chart-area');
  const chartDotsContainer = document.getElementById('chart-dots');
  const chartTooltip = document.getElementById('chart-tooltip');
  const filterTabs = document.querySelectorAll('.filter-tab-btn');
  const filterIndicator = document.getElementById('filter-indicator');
  const chartTotalText = document.getElementById('chart-total-text');

  const chartData = {
    week: {
      total: "$1,240.00",
      points: [
        { x: 10, y: 120, val: "$120" },
        { x: 60, y: 70, val: "$240" },
        { x: 110, y: 90, val: "$190" },
        { x: 160, y: 40, val: "$410" },
        { x: 210, y: 110, val: "$150" },
        { x: 260, y: 50, val: "$380" },
        { x: 290, y: 80, val: "$290" }
      ]
    },
    month: {
      total: "$5,890.50",
      points: [
        { x: 10, y: 90, val: "$290" },
        { x: 60, y: 110, val: "$180" },
        { x: 110, y: 50, val: "$340" },
        { x: 160, y: 80, val: "$220" },
        { x: 210, y: 30, val: "$450" },
        { x: 260, y: 100, val: "$160" },
        { x: 290, y: 40, val: "$390" }
      ]
    },
    year: {
      total: "$64,200.00",
      points: [
        { x: 10, y: 130, val: "$80" },
        { x: 60, y: 80, val: "$210" },
        { x: 110, y: 120, val: "$110" },
        { x: 160, y: 70, val: "$270" },
        { x: 210, y: 50, val: "$320" },
        { x: 260, y: 30, val: "$410" },
        { x: 290, y: 90, val: "$190" }
      ]
    }
  };

  let currentFilter = 'week';

  function triggerChartTransition(filterKey) {
    const data = chartData[filterKey];
    currentFilter = filterKey;

    // Generate path descriptions
    let linePath = `M ${data.points[0].x} ${data.points[0].y}`;
    for (let i = 1; i < data.points.length; i++) {
      linePath += ` L ${data.points[i].x} ${data.points[i].y}`;
    }

    let areaPath = `${linePath} L ${data.points[data.points.length - 1].x} 140 L ${data.points[0].x} 140 Z`;

    // Apply paths
    chartLine.setAttribute('d', linePath);
    chartArea.setAttribute('d', areaPath);
    chartTotalText.textContent = data.total;

    // Redraw data dot indicators
    drawChartDots(data.points);
  }

  function drawChartDots(points) {
    chartDotsContainer.innerHTML = '';
    
    points.forEach((pt) => {
      // Glow background circles
      const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      glow.setAttribute('cx', pt.x);
      glow.setAttribute('cy', pt.y);
      glow.setAttribute('r', 8);
      glow.setAttribute('class', 'chart-dot-glow');
      chartDotsContainer.appendChild(glow);

      // Core Interactive circles
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', pt.x);
      dot.setAttribute('cy', pt.y);
      dot.setAttribute('r', 5);
      dot.setAttribute('class', 'chart-dot');

      // Mouse trigger behaviors
      dot.addEventListener('mouseenter', (e) => {
        showTooltip(pt.x, pt.y, pt.val);
      });
      dot.addEventListener('mouseleave', () => {
        hideTooltip();
      });

      chartDotsContainer.appendChild(dot);
    });
  }

  function showTooltip(x, y, text) {
    chartTooltip.querySelector('.tooltip-val').textContent = text;
    // Position within responsive shell coordinates
    const wrapper = document.querySelector('.chart-canvas-wrapper');
    const widthRatio = wrapper.clientWidth / 300;
    const heightRatio = wrapper.clientHeight / 150;
    
    chartTooltip.style.left = `${x * widthRatio}px`;
    chartTooltip.style.top = `${y * heightRatio}px`;
    chartTooltip.classList.add('show');
  }

  function hideTooltip() {
    chartTooltip.classList.remove('show');
  }

  // Filter Click Handlers
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      const idx = tab.getAttribute('style').match(/--tab-idx:\s*(\d+)/)[1];
      
      // Move Indicator Accent
      filterIndicator.style.transform = `translateX(calc(100% * ${idx}))`;
      
      triggerChartTransition(filter);
      spawnToast('Telemetry Sync', `Spendings scope updated to: ${filter.toUpperCase()}`, 'success');
    });
  });


  /* ==========================================================================
     7. SCREEN 5: SMART SPACE LIGHTS & MUSIC PLAYER
     ========================================================================== */
  const bulbDimmer = document.getElementById('bulb-dimmer');
  const dimmerBubble = document.getElementById('dimmer-bubble');
  const dimmerPercentage = document.getElementById('dimmer-percentage');
  const bulbGlowHalo = document.getElementById('bulb-glow-halo');
  const bulbElement = document.getElementById('bulb-element');

  function updateDimmerVal(val) {
    // Numeric metrics updates
    dimmerPercentage.textContent = `Brightness: ${val}%`;
    dimmerBubble.textContent = val;

    // Visual bulb scales
    const haloScale = 0.5 + (val / 100) * 0.8;
    const haloOpacity = (val / 100) * 0.9;
    
    bulbGlowHalo.style.transform = `scale(${haloScale})`;
    bulbGlowHalo.style.opacity = haloOpacity;
    
    // Scale bulb SVG
    const bulbScale = 0.9 + (val / 100) * 0.2;
    bulbElement.style.transform = `scale(${bulbScale})`;
    
    // Calculate bubble position offset
    const sliderWidth = bulbDimmer.clientWidth;
    const offset = (val / 100) * sliderWidth;
    dimmerBubble.style.left = `${offset}px`;
  }

  bulbDimmer.addEventListener('input', (e) => {
    updateDimmerVal(e.target.value);
  });

  bulbDimmer.addEventListener('change', (e) => {
    spawnToast('Smart Control', `Bulb luminance adjusted to: ${e.target.value}%`, 'success');
  });

  // Initialize dimmer position on load
  updateDimmerVal(80);

  // Custom Audio vinyl control states
  const playPauseTrigger = document.getElementById('play-pause-trigger');
  const mediaPlayerBox = playPauseTrigger.closest('.media-player-box');
  const playIcon = playPauseTrigger.querySelector('.play-icon');
  const pauseIcon = playPauseTrigger.querySelector('.pause-icon');

  playPauseTrigger.addEventListener('click', () => {
    const isPlaying = mediaPlayerBox.classList.contains('playing');
    
    if (isPlaying) {
      mediaPlayerBox.classList.remove('playing');
      pauseIcon.classList.add('hide');
      playIcon.classList.remove('hide');
      spawnToast('Audio Stream', 'Playback paused', 'success');
    } else {
      mediaPlayerBox.classList.add('playing');
      playIcon.classList.add('hide');
      pauseIcon.classList.remove('hide');
      spawnToast('Audio Stream', 'Now Streaming: Synthesized Dreams', 'success');
    }
  });


  /* ==========================================================================
     8. SCREEN 6: COMPONENTS SANDBOX
     ========================================================================== */
  const sandboxLoadBtn = document.getElementById('sandbox-load-btn');
  const btnIdle = sandboxLoadBtn.querySelector('.btn-state-idle');
  const btnLoading = sandboxLoadBtn.querySelector('.btn-state-loading');
  const btnSuccess = sandboxLoadBtn.querySelector('.btn-state-success');

  let sandboxLoading = false;

  sandboxLoadBtn.addEventListener('click', () => {
    if (sandboxLoading) return;
    sandboxLoading = true;

    // Loading State
    sandboxLoadBtn.className = "interactive-action-btn loading";
    btnIdle.classList.add('hide');
    btnLoading.classList.remove('hide');

    setTimeout(() => {
      // Success State
      sandboxLoadBtn.className = "interactive-action-btn success";
      btnLoading.classList.add('hide');
      btnSuccess.classList.remove('hide');
      spawnToast('Sandbox Node', 'Transaction node verification success', 'success');

      setTimeout(() => {
        // Reset State
        sandboxLoadBtn.className = "interactive-action-btn";
        btnSuccess.classList.add('hide');
        btnIdle.classList.remove('hide');
        sandboxLoading = false;
      }, 2000);
    }, 2000);
  });

  // Sandbox spring toggles
  const sandboxToggles = [
    { el: document.getElementById('sandbox-spring-1'), name: 'Haptic Feedback' },
    { el: document.getElementById('sandbox-spring-2'), name: 'Telemetry Log' }
  ];

  sandboxToggles.forEach(toggle => {
    toggle.el.addEventListener('click', () => {
      toggle.el.classList.toggle('active');
      const isActive = toggle.el.classList.contains('active');
      spawnToast('Haptic Action', `${toggle.name} is now ${isActive ? 'ON' : 'OFF'}`, 'success');
    });
  });

  // Magnetic Glowing Button Physics
  const magneticBtn = document.getElementById('sandbox-magnetic-btn');

  magneticBtn.addEventListener('mousemove', (e) => {
    const rect = magneticBtn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Set custom coordinates for radial glow
    magneticBtn.style.setProperty('--mouse-x', `${x}px`);
    magneticBtn.style.setProperty('--mouse-y', `${y}px`);

    // Gentle magnetic float translate calculation
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const moveX = (x - centerX) * 0.25;
    const moveY = (y - centerY) * 0.25;

    magneticBtn.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });

  magneticBtn.addEventListener('mouseleave', () => {
    // Reset spring alignment
    magneticBtn.style.transform = `translate(0, 0)`;
  });

  // Toast spawners from buttons
  const toastTriggers = document.querySelectorAll('.toast-trigger');
  
  toastTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const type = trigger.getAttribute('data-type');
      if (type === 'success') {
        spawnToast('Info Telemetry', 'Subsystem coordinates verified.', 'success');
      } else {
        spawnToast('System Advisory', 'Quantum entropy leakage detected.', 'alert');
      }
    });
  });


  /* ==========================================================================
     9. TOAST NOTIFICATION EMITTER SYSTEM
     ========================================================================== */
  const toastContainer = document.getElementById('global-toast-container');

  function spawnToast(title, message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-item';
    
    const iconName = type === 'success' ? 'check-circle' : 'alert-octagon';
    toast.style.setProperty('--toast-accent', type === 'success' ? 'var(--accent-secondary)' : 'var(--accent-primary)');

    toast.innerHTML = `
      <i data-lucide="${iconName}"></i>
      <div class="toast-content">
        <h6>${title}</h6>
        <p>${message}</p>
      </div>
    `;

    toastContainer.appendChild(toast);
    lucide.createIcons(); // Initialize the newly appended icon

    // Slide In Trigger
    setTimeout(() => {
      toast.classList.add('show');
    }, 50);

    // Fade Out/Remove sequence
    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('transitionend', () => {
        toast.remove();
      });
    }, 2800);
  }

  // Trigger default welcome toast on load
  setTimeout(() => {
    spawnToast('Decryption Success', 'Nebula Node linked. Welcome, Admin.', 'success');
  }, 1000);
});
