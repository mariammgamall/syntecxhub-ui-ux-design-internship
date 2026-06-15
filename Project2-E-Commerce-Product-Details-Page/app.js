document.addEventListener('DOMContentLoaded', () => {
  
  /* ==========================================
     DOM ELEMENTS - PRODUCT DETAILS PAGE (PDP)
     ========================================== */
  const mainImageContainer = document.getElementById('main-image-container');
  const mainImage = document.getElementById('main-image');
  const thumbButtons = document.querySelectorAll('.thumb-btn');
  const pdpTitle = document.getElementById('pdp-title');
  const pdpDescription = document.getElementById('pdp-description');
  
  const priceRegularView = document.getElementById('price-regular-view');
  const priceSaleView = document.getElementById('price-sale-view');
  const pdpRegPriceVal = document.getElementById('pdp-regular-price-val');
  const pdpSalePriceVal = document.getElementById('pdp-sale-price-val');
  const pdpOriginalPriceVal = document.getElementById('pdp-original-price-val');
  const pdpDiscountBadge = document.getElementById('pdp-discount-badge');
  
  const colorSwatches = document.querySelectorAll('.color-swatch-btn');
  const selectedColorLabel = document.getElementById('selected-color-label');
  
  const sizeButtons = document.querySelectorAll('.size-btn');
  const selectedSizeLabel = document.getElementById('selected-size-label');
  
  const addToCartBtn = document.getElementById('add-to-cart-cta');
  const btnIconContainer = document.getElementById('btn-icon-container');
  const btnSpinner = document.getElementById('btn-spinner');
  const btnTextContent = document.getElementById('btn-text-content');
  
  const iconCart = document.getElementById('icon-cart');
  const iconBag = document.getElementById('icon-bag');
  const iconCheck = document.getElementById('icon-check');

  const galleryZoomOverlay = document.getElementById('gallery-zoom-overlay');
  const zoomedImage = document.getElementById('zoomed-image');
  const zoomCloseBtn = document.getElementById('zoom-close-btn');

  /* ==========================================
     DOM ELEMENTS - FIGMA INSPECTOR PANEL
     ========================================== */
  const ctrlGalleryState = document.getElementById('ctrl-gallery-state');
  
  const ctrlProductTitle = document.getElementById('ctrl-product-title');
  const ctrlProductDesc = document.getElementById('ctrl-product-desc');
  
  const ctrlPriceSale = document.getElementById('ctrl-price-sale');
  const ctrlRegPrice = document.getElementById('ctrl-reg-price');
  const ctrlSalePrice = document.getElementById('ctrl-sale-price');
  const ctrlRowRegPrice = document.getElementById('ctrl-row-reg-price');
  const ctrlRowSalePrice = document.getElementById('ctrl-row-sale-price');
  
  const ctrlStateBlack = document.getElementById('ctrl-state-black');
  const ctrlStateGold = document.getElementById('ctrl-state-gold');
  const ctrlStateSilver = document.getElementById('ctrl-state-silver');
  
  const ctrlStateSizeStandard = document.getElementById('ctrl-state-size-standard');
  const ctrlStateSizeComfort = document.getElementById('ctrl-state-size-comfort');
  const ctrlStateSizeUltra = document.getElementById('ctrl-state-size-ultra');
  
  const ctrlBtnState = document.getElementById('ctrl-btn-state');
  const ctrlBtnShowIcon = document.getElementById('ctrl-btn-show-icon');
  const ctrlRowBtnIcon = document.getElementById('ctrl-row-btn-icon');
  const ctrlBtnIconSwap = document.getElementById('ctrl-btn-icon-swap');
  const ctrlBtnText = document.getElementById('ctrl-btn-text');

  /* ==========================================
     STATE MANAGEMENT VARIABLES
     ========================================== */
  let cartAnimationTimeout = null;
  let cartResetTimeout = null;

  /* ==========================================
     IMAGE GALLERY & ZOOM INTERACTIONS
     ========================================== */
  // Function to change main image
  function changeMainImage(src) {
    mainImage.style.opacity = '0';
    setTimeout(() => {
      mainImage.src = src;
      zoomedImage.src = src;
      mainImage.style.opacity = '1';
    }, 150);
  }

  // Thumbnails clicking
  thumbButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      thumbButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      changeMainImage(btn.getAttribute('data-src'));
    });
  });

  // Open Zoom Overlay (Smart Animate simulation)
  function openZoom() {
    galleryZoomOverlay.classList.add('open');
    ctrlGalleryState.value = 'zoomed';
  }

  // Close Zoom Overlay
  function closeZoom() {
    galleryZoomOverlay.classList.remove('open');
    ctrlGalleryState.value = 'default';
  }

  mainImageContainer.addEventListener('click', openZoom);
  zoomCloseBtn.addEventListener('click', closeZoom);
  galleryZoomOverlay.addEventListener('click', (e) => {
    if (e.target === galleryZoomOverlay) {
      closeZoom();
    }
  });

  // Sync Gallery zoom state from inspector select
  ctrlGalleryState.addEventListener('change', (e) => {
    if (e.target.value === 'zoomed') {
      openZoom();
    } else {
      closeZoom();
    }
  });


  /* ==========================================
     PRODUCT TITLE & DESCRIPTION PROPS
     ========================================== */
  ctrlProductTitle.addEventListener('input', (e) => {
    pdpTitle.textContent = e.target.value;
  });

  ctrlProductDesc.addEventListener('input', (e) => {
    pdpDescription.textContent = e.target.value;
  });


  /* ==========================================
     PRICE COMPONENT LOGIC & BINDINGS
     ========================================== */
  function updatePrices() {
    const isSale = ctrlPriceSale.checked;
    const regVal = parseFloat(ctrlRegPrice.value) || 0;
    const saleVal = parseFloat(ctrlSalePrice.value) || 0;
    
    // Update texts in PDP
    pdpRegPriceVal.textContent = regVal.toFixed(2);
    pdpSalePriceVal.textContent = saleVal.toFixed(2);
    pdpOriginalPriceVal.textContent = regVal.toFixed(2);
    
    // Calculate discount
    const discount = regVal - saleVal;
    if (discount > 0) {
      pdpDiscountBadge.textContent = `Save $${discount.toFixed(0)}`;
      pdpDiscountBadge.style.display = 'inline-block';
    } else {
      pdpDiscountBadge.style.display = 'none';
    }

    // Toggle layouts
    if (isSale) {
      priceRegularView.style.display = 'none';
      priceSaleView.style.display = 'flex';
      ctrlRowSalePrice.style.display = 'grid';
    } else {
      priceRegularView.style.display = 'flex';
      priceSaleView.style.display = 'none';
      ctrlRowSalePrice.style.display = 'none';
    }
  }

  ctrlPriceSale.addEventListener('change', updatePrices);
  ctrlRegPrice.addEventListener('input', updatePrices);
  ctrlSalePrice.addEventListener('input', updatePrices);

  // Initialize prices
  updatePrices();


  /* ==========================================
     COLOR SWATCH LOGIC & VARIANT BINDING
     ========================================== */
  function updateColorLabels(colorName) {
    selectedColorLabel.textContent = colorName;
  }

  function handleColorChange(colorType, colorName) {
    updateColorLabels(colorName);
    
    // Update PDP selection highlights
    colorSwatches.forEach(swatch => {
      const swColor = swatch.getAttribute('data-color');
      if (swColor === colorType) {
        swatch.classList.add('selected');
      } else {
        swatch.classList.remove('selected');
      }
    });

    // Auto-swap image gallery to corresponding product color
    if (colorType === 'black') {
      thumbButtons[0].click();
    } else if (colorType === 'gold') {
      thumbButtons[3].click();
    }
  }

  // Click Swatch on PDP
  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      if (swatch.classList.contains('out-of-stock')) return;
      
      const colorType = swatch.getAttribute('data-color');
      const colorName = swatch.getAttribute('data-color-name');
      handleColorChange(colorType, colorName);
      
      // Update inspector dropdowns to match PDP
      if (colorType === 'black') {
        ctrlStateBlack.value = 'selected';
        if (ctrlStateGold.value === 'selected') ctrlStateGold.value = 'default';
        if (ctrlStateSilver.value === 'selected') ctrlStateSilver.value = 'default';
      } else if (colorType === 'gold') {
        ctrlStateGold.value = 'selected';
        if (ctrlStateBlack.value === 'selected') ctrlStateBlack.value = 'default';
        if (ctrlStateSilver.value === 'selected') ctrlStateSilver.value = 'default';
      }
    });
  });

  // Update Swatch classes from Inspector selects
  function syncInspectorColors() {
    const states = {
      black: ctrlStateBlack.value,
      gold: ctrlStateGold.value,
      silver: ctrlStateSilver.value
    };

    colorSwatches.forEach(swatch => {
      const col = swatch.getAttribute('data-color');
      const state = states[col];
      
      // Clear classes
      swatch.classList.remove('selected', 'out-of-stock');
      
      if (state === 'selected') {
        swatch.classList.add('selected');
        updateColorLabels(swatch.getAttribute('data-color-name'));
        
        // Auto-change image gallery as well
        if (col === 'black') changeMainImage('./images/black-main.png');
        if (col === 'gold') changeMainImage('./images/gold-main.png');
      } else if (state === 'out-of-stock') {
        swatch.classList.add('out-of-stock');
      }
    });
  }

  ctrlStateBlack.addEventListener('change', (e) => {
    if (e.target.value === 'selected') {
      ctrlStateGold.value = ctrlStateGold.value === 'selected' ? 'default' : ctrlStateGold.value;
      ctrlStateSilver.value = ctrlStateSilver.value === 'selected' ? 'default' : ctrlStateSilver.value;
    }
    syncInspectorColors();
  });
  
  ctrlStateGold.addEventListener('change', (e) => {
    if (e.target.value === 'selected') {
      ctrlStateBlack.value = ctrlStateBlack.value === 'selected' ? 'default' : ctrlStateBlack.value;
      ctrlStateSilver.value = ctrlStateSilver.value === 'selected' ? 'default' : ctrlStateSilver.value;
    }
    syncInspectorColors();
  });

  ctrlStateSilver.addEventListener('change', (e) => {
    if (e.target.value === 'selected') {
      ctrlStateBlack.value = ctrlStateBlack.value === 'selected' ? 'default' : ctrlStateBlack.value;
      ctrlStateGold.value = ctrlStateGold.value === 'selected' ? 'default' : ctrlStateGold.value;
    }
    syncInspectorColors();
  });


  /* ==========================================
     SIZE SELECTOR LOGIC & VARIANT BINDING
     ========================================== */
  function updateSizeLabels(sizeName) {
    selectedSizeLabel.textContent = sizeName;
  }

  function handleSizeChange(sizeType, sizeName) {
    updateSizeLabels(sizeName);
    
    // Update PDP button selection styles & sub-labels
    sizeButtons.forEach(btn => {
      const btnSize = btn.getAttribute('data-size');
      const statusLabel = btn.querySelector('.size-status-label');
      
      if (btnSize === sizeType) {
        btn.classList.add('selected');
        if (statusLabel) statusLabel.textContent = 'Selected';
      } else {
        btn.classList.remove('selected');
        if (statusLabel) {
          if (btn.classList.contains('disabled') || btn.disabled) {
            statusLabel.textContent = 'Out of Stock';
          } else {
            statusLabel.textContent = 'Default';
          }
        }
      }
    });
  }

  // Click Size on PDP
  sizeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('disabled') || btn.disabled) return;
      
      const sizeType = btn.getAttribute('data-size');
      const sizeName = btn.getAttribute('data-size-name');
      handleSizeChange(sizeType, sizeName);
      
      // Update inspector dropdowns to match PDP selection
      if (sizeType === 'standard') {
        ctrlStateSizeStandard.value = 'selected';
        if (ctrlStateSizeComfort.value === 'selected') ctrlStateSizeComfort.value = 'default';
        if (ctrlStateSizeUltra.value === 'selected') ctrlStateSizeUltra.value = 'default';
      } else if (sizeType === 'comfort') {
        ctrlStateSizeComfort.value = 'selected';
        if (ctrlStateSizeStandard.value === 'selected') ctrlStateSizeStandard.value = 'default';
        if (ctrlStateSizeUltra.value === 'selected') ctrlStateSizeUltra.value = 'default';
      }
    });
  });

  // Update Size styles from Inspector selects
  function syncInspectorSizes() {
    const states = {
      standard: ctrlStateSizeStandard.value,
      comfort: ctrlStateSizeComfort.value,
      ultra: ctrlStateSizeUltra.value
    };

    sizeButtons.forEach(btn => {
      const sz = btn.getAttribute('data-size');
      const state = states[sz];
      
      // Reset classes
      btn.classList.remove('selected', 'disabled');
      btn.removeAttribute('disabled');
      
      // Update sub-label text based on state
      const statusLabel = btn.querySelector('.size-status-label');
      if (statusLabel) {
        if (state === 'selected') {
          statusLabel.textContent = 'Selected';
        } else if (state === 'disabled') {
          statusLabel.textContent = 'Out of Stock';
        } else {
          statusLabel.textContent = 'Default';
        }
      }
      
      if (state === 'selected') {
        btn.classList.add('selected');
        updateSizeLabels(btn.getAttribute('data-size-name'));
      } else if (state === 'disabled') {
        btn.classList.add('disabled');
        btn.setAttribute('disabled', 'true');
      }
    });
  }

  ctrlStateSizeStandard.addEventListener('change', (e) => {
    if (e.target.value === 'selected') {
      ctrlStateSizeComfort.value = ctrlStateSizeComfort.value === 'selected' ? 'default' : ctrlStateSizeComfort.value;
      ctrlStateSizeUltra.value = ctrlStateSizeUltra.value === 'selected' ? 'default' : ctrlStateSizeUltra.value;
    }
    syncInspectorSizes();
  });

  ctrlStateSizeComfort.addEventListener('change', (e) => {
    if (e.target.value === 'selected') {
      ctrlStateSizeStandard.value = ctrlStateSizeStandard.value === 'selected' ? 'default' : ctrlStateSizeStandard.value;
      ctrlStateSizeUltra.value = ctrlStateSizeUltra.value === 'selected' ? 'default' : ctrlStateSizeUltra.value;
    }
    syncInspectorSizes();
  });

  ctrlStateSizeUltra.addEventListener('change', (e) => {
    if (e.target.value === 'selected') {
      ctrlStateSizeStandard.value = ctrlStateSizeStandard.value === 'selected' ? 'default' : ctrlStateSizeStandard.value;
      ctrlStateSizeComfort.value = ctrlStateSizeComfort.value === 'selected' ? 'default' : ctrlStateSizeComfort.value;
    }
    syncInspectorSizes();
  });


  /* ==========================================
     ADD TO CART MICRO-INTERACTIONS (PDP & PROTOTYPE)
     ========================================== */
  
  // Apply visual button state directly
  function renderButtonState(state) {
    // Reset all states
    addToCartBtn.classList.remove('loading', 'success');
    btnSpinner.style.display = 'none';
    btnTextContent.style.display = 'inline';
    
    // Toggle active swap icons based on state
    if (state === 'default') {
      const currentSwap = ctrlBtnIconSwap.value;
      toggleSwapIcon(currentSwap);
      btnTextContent.textContent = ctrlBtnText.value;
      if (ctrlBtnShowIcon.checked) {
        btnIconContainer.style.display = 'flex';
      } else {
        btnIconContainer.style.display = 'none';
      }
    } 
    else if (state === 'loading') {
      addToCartBtn.classList.add('loading');
      btnSpinner.style.display = 'inline-block';
      btnIconContainer.style.display = 'none';
      btnTextContent.style.display = 'none';
    } 
    else if (state === 'success') {
      addToCartBtn.classList.add('success');
      toggleSwapIcon('check'); // Success always shows check icon
      btnIconContainer.style.display = 'flex';
      btnTextContent.textContent = 'Added';
    }
  }

  // Swaps icons depending on selector
  function toggleSwapIcon(iconType) {
    iconCart.style.display = 'none';
    iconBag.style.display = 'none';
    iconCheck.style.display = 'none';

    if (iconType === 'cart') {
      iconCart.style.display = 'block';
    } else if (iconType === 'bag') {
      iconBag.style.display = 'block';
    } else if (iconType === 'check') {
      iconCheck.style.display = 'block';
    }
  }

  // Trigger Sequential Prototype Animation: Default -> Loading -> Success -> Default
  function triggerAddToCartSequence() {
    // Clear any active timeouts
    if (cartAnimationTimeout) clearTimeout(cartAnimationTimeout);
    if (cartResetTimeout) clearTimeout(cartResetTimeout);

    // 1. Loading State (spinner)
    ctrlBtnState.value = 'loading';
    renderButtonState('loading');

    // 2. Transition to Success (✓ Added) after 2 seconds
    cartAnimationTimeout = setTimeout(() => {
      ctrlBtnState.value = 'success';
      renderButtonState('success');

      // 3. Transition back to Default after another 2 seconds
      cartResetTimeout = setTimeout(() => {
        ctrlBtnState.value = 'default';
        renderButtonState('default');
      }, 2000);

    }, 2000);
  }

  // Click handler for PDP Add to Cart Button
  addToCartBtn.addEventListener('click', () => {
    // Only trigger sequential transition if it is currently in Default state
    if (!addToCartBtn.classList.contains('loading') && !addToCartBtn.classList.contains('success')) {
      triggerAddToCartSequence();
    }
  });

  // Handle Inspector controls for Add to Cart
  ctrlBtnState.addEventListener('change', (e) => {
    const targetState = e.target.value;
    
    // Clear any running sequence if user manually toggles inspector
    if (cartAnimationTimeout) clearTimeout(cartAnimationTimeout);
    if (cartResetTimeout) clearTimeout(cartResetTimeout);

    renderButtonState(targetState);
  });

  ctrlBtnShowIcon.addEventListener('change', (e) => {
    if (ctrlBtnState.value === 'default') {
      btnIconContainer.style.display = e.target.checked ? 'flex' : 'none';
    }
  });

  ctrlBtnIconSwap.addEventListener('change', (e) => {
    if (ctrlBtnState.value === 'default') {
      toggleSwapIcon(e.target.value);
    }
  });

  ctrlBtnText.addEventListener('input', (e) => {
    if (ctrlBtnState.value === 'default') {
      btnTextContent.textContent = e.target.value;
    }
  });

  /* ==========================================
     INSPECTOR TOGGLE SIDEBAR CONTROLS
     ========================================== */
  const toggleInspectorBtn = document.getElementById('toggle-inspector-btn');
  const mainContainer = document.querySelector('.main-container');

  toggleInspectorBtn.addEventListener('click', () => {
    mainContainer.classList.toggle('collapsed');
  });

});
