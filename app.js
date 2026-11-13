/**
 * Bajaj Finance Limited (BFL) - Interactive Portfolio Showcase Script
 * Pure Vanilla JavaScript (ES6+)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  /* ==========================================================================
     1. Theme Management (Light / Dark Mode)
     ========================================================================== */
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('bfl-theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('bfl-theme', theme);
    if (window.stockChartInstance) {
      updateChartTheme(window.stockChartInstance, theme);
    }
  }

  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme') || 'light';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
    });
  }

  /* ==========================================================================
     2. Sticky Header & Mobile Drawer Navigation
     ========================================================================== */
  const navbar = document.getElementById('navbar');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  // Add scroll shadow to navbar
  window.addEventListener('scroll', () => {
    if (window.scrollY > 25) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    trackActiveNav();
  }, { passive: true });

  // Mobile menu toggle
  if (hamburgerBtn && mobileDrawer) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active section tracking on scroll
  const sections = document.querySelectorAll('section[id]');
  function trackActiveNav() {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  /* ==========================================================================
     3. Real-time Market Ticker Micro-Oscillations
     ========================================================================== */
  const bajfinPriceEl = document.getElementById('bajfinPrice');
  const bajfinChangeEl = document.getElementById('bajfinChange');
  const pillPriceEl = document.getElementById('pillPrice');
  const pillChgEl = document.getElementById('pillChg');
  const chartPriceHeaderEl = document.getElementById('chartPriceHeader');

  let basePrice = 6942.50;
  const initialBase = 6817.10;

  function updateTickerPrices() {
    // Generate subtle market oscillation (-0.15% to +0.25%)
    const delta = (Math.random() * 8 - 3.2);
    basePrice = Math.max(6800, +(basePrice + delta).toFixed(2));
    
    const pctChange = (((basePrice - initialBase) / initialBase) * 100).toFixed(2);
    const absChange = (basePrice - initialBase).toFixed(2);
    const isUp = basePrice >= initialBase;

    const formattedPrice = `₹${basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formattedChange = `${isUp ? '▲ +' : '▼ '}${pctChange}% (${isUp ? '+₹' : '-₹'}${Math.abs(absChange)})`;

    if (bajfinPriceEl) bajfinPriceEl.textContent = formattedPrice;
    if (bajfinChangeEl) {
      bajfinChangeEl.textContent = formattedChange;
      bajfinChangeEl.className = `ticker-change ${isUp ? 'up' : 'down'}`;
    }
    if (pillPriceEl) pillPriceEl.textContent = formattedPrice;
    if (pillChgEl) {
      pillChgEl.textContent = `${isUp ? '+' : ''}${pctChange}%`;
      pillChgEl.className = `pill-chg ${isUp ? 'up' : 'down'}`;
    }
    if (chartPriceHeaderEl) chartPriceHeaderEl.textContent = formattedPrice;
  }

  // Update ticker periodically every 4.5 seconds
  setInterval(updateTickerPrices, 4500);

  /* ==========================================================================
     4. Scroll Reveal Animations (Intersection Observer)
     ========================================================================== */
  const animatedElements = document.querySelectorAll('[data-animate]');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  animatedElements.forEach(el => revealObserver.observe(el));

  /* ==========================================================================
     5. Animated Numbers Counter Bar
     ========================================================================== */
  const counterElements = document.querySelectorAll('[data-counter]');
  let hasCountersRun = false;

  function formatIndianNumber(num) {
    return num.toLocaleString('en-IN');
  }

  function startCounters() {
    counterElements.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-counter'));
      const isDecimal = counter.hasAttribute('data-decimals');
      const isFormatInr = counter.getAttribute('data-format') === 'inr-cr';
      const duration = 2000;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo function
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = target * easeProgress;

        if (isDecimal) {
          counter.textContent = currentVal.toFixed(1);
        } else if (isFormatInr) {
          counter.textContent = formatIndianNumber(Math.floor(currentVal));
        } else {
          counter.textContent = Math.floor(currentVal);
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          if (isDecimal) {
            counter.textContent = target.toFixed(1);
          } else if (isFormatInr) {
            counter.textContent = formatIndianNumber(target);
          } else {
            counter.textContent = target;
          }
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  const metricsSection = document.getElementById('metrics');
  if (metricsSection) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasCountersRun) {
          hasCountersRun = true;
          startCounters();
        }
      });
    }, { threshold: 0.25 });

    counterObserver.observe(metricsSection);
  }

  /* ==========================================================================
     6. Product Portfolio Category Filtering
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (filterValue === 'all' || cardCat === filterValue) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 30);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px) scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  /* ==========================================================================
     7. 3D Card Tilt Micro-Interaction
     ========================================================================== */
  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  /* ==========================================================================
     8. Interactive Fixed Deposit & Returns Calculator
     ========================================================================== */
  const principalSlider = document.getElementById('principalSlider');
  const tenureSlider = document.getElementById('tenureSlider');
  const principalDisplay = document.getElementById('principalDisplay');
  const tenureDisplay = document.getElementById('tenureDisplay');
  const citizenBtns = document.querySelectorAll('.citizen-btn');
  const presetChips = document.querySelectorAll('.chip');
  const payoutRadios = document.querySelectorAll('input[name="payoutFreq"]');

  const effectiveRateTag = document.getElementById('effectiveRateTag');
  const maturityValueDisplay = document.getElementById('maturityValueDisplay');
  const principalBreakdown = document.getElementById('principalBreakdown');
  const interestBreakdown = document.getElementById('interestBreakdown');
  const calcProgressFill = document.getElementById('calcProgressFill');
  const principalPct = document.getElementById('principalPct');
  const interestPct = document.getElementById('interestPct');

  let isSeniorCitizen = false;
  let baseRate = 8.50; // Regular rate %

  function updateSliderBackground(slider) {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value) || 0;
    const percentage = ((val - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, var(--brand-primary) 0%, var(--brand-primary) ${percentage}%, var(--bg-surface-subtle) ${percentage}%, var(--bg-surface-subtle) 100%)`;
  }

  function calculateReturns() {
    const principal = parseFloat(principalSlider.value);
    const tenureMonths = parseInt(tenureSlider.value, 10);
    const tenureYears = tenureMonths / 12;

    const rate = isSeniorCitizen ? (baseRate + 0.35) : baseRate;
    effectiveRateTag.textContent = `Effective Rate: ${rate.toFixed(2)}% p.a.`;

    // Selected payout option
    let selectedPayout = 'cumulative';
    payoutRadios.forEach(radio => {
      if (radio.checked) selectedPayout = radio.value;
    });

    let maturityAmount = 0;
    let interestEarned = 0;

    if (selectedPayout === 'cumulative') {
      // Annual compounding formula: A = P * (1 + r/100)^t
      maturityAmount = principal * Math.pow((1 + (rate / 100)), tenureYears);
      interestEarned = maturityAmount - principal;
    } else {
      // Simple non-cumulative regular interest payout total
      interestEarned = (principal * (rate / 100)) * tenureYears;
      maturityAmount = principal + interestEarned;
    }

    // Format results in INR
    const formatINR = (val) => `₹${Math.round(val).toLocaleString('en-IN')}`;

    principalDisplay.textContent = formatINR(principal);
    tenureDisplay.textContent = `${tenureMonths} Months (${tenureYears} Year${tenureYears > 1 ? 's' : ''})`;

    maturityValueDisplay.textContent = formatINR(maturityAmount);
    principalBreakdown.textContent = formatINR(principal);
    interestBreakdown.textContent = formatINR(interestEarned);

    // Calculate proportions for visual bar
    const pPct = Math.round((principal / maturityAmount) * 100);
    const iPct = 100 - pPct;

    calcProgressFill.style.width = `${pPct}%`;
    principalPct.textContent = `${pPct}%`;
    interestPct.textContent = `${iPct}%`;

    updateSliderBackground(principalSlider);
    updateSliderBackground(tenureSlider);
  }

  if (principalSlider && tenureSlider) {
    principalSlider.addEventListener('input', calculateReturns);
    tenureSlider.addEventListener('input', calculateReturns);

    // Citizen type toggles
    citizenBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        citizenBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        isSeniorCitizen = btn.getAttribute('data-citizen') === 'senior';
        calculateReturns();
      });
    });

    // Preset amount chips
    presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        presetChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        principalSlider.value = chip.getAttribute('data-amount');
        calculateReturns();
      });
    });

    // Payout radio listeners
    payoutRadios.forEach(radio => {
      radio.addEventListener('change', calculateReturns);
    });

    // Initial calculation run
    calculateReturns();
  }

  /* ==========================================================================
     9. Interactive Stock Performance Chart (Chart.js)
     ========================================================================== */
  const chartCanvas = document.getElementById('stockPerformanceChart');
  const tfBtns = document.querySelectorAll('.tf-btn');
  const chartChangeHeader = document.getElementById('chartChangeHeader');

  // Multi-timeframe datasets for BAJFINANCE
  const stockDatasets = {
    '1Y': {
      labels: ['Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26', 'Oct 26', 'Nov 26'],
      data: [6120, 6250, 6180, 6340, 6510, 6420, 6680, 6750, 6610, 6830, 6890, 6942.50],
      changeText: '▲ +13.4% in Past 1 Year'
    },
    '3Y': {
      labels: ['Q1 24', 'Q2 24', 'Q3 24', 'Q4 24', 'Q1 25', 'Q2 25', 'Q3 25', 'Q4 25', 'Q1 26', 'Q2 26', 'Q3 26', 'Q4 26'],
      data: [5200, 5450, 5800, 5950, 6100, 6300, 6200, 6450, 6600, 6720, 6840, 6942.50],
      changeText: '▲ +33.5% in Past 3 Years'
    },
    '5Y': {
      labels: ['2022', 'Mid 22', '2023', 'Mid 23', '2024', 'Mid 24', '2025', 'Mid 25', '2026', 'Current'],
      data: [3400, 3950, 4400, 4900, 5300, 5850, 6200, 6550, 6800, 6942.50],
      changeText: '▲ +104.2% in Past 5 Years'
    },
    'ALL': {
      labels: ['2012', '2014', '2016', '2018', '2020', '2022', '2024', '2026'],
      data: [140, 390, 1100, 2600, 3300, 5200, 6300, 6942.50],
      changeText: '▲ +4,858% Since Inception'
    }
  };

  function getThemeColors() {
    const isDark = htmlEl.getAttribute('data-theme') === 'dark';
    return {
      textColor: isDark ? '#94a3b8' : '#64748b',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(148, 163, 184, 0.15)',
      tooltipBg: isDark ? '#152238' : '#0b2545'
    };
  }

  function updateChartTheme(chart, theme) {
    const colors = getThemeColors();
    chart.options.scales.x.ticks.color = colors.textColor;
    chart.options.scales.y.ticks.color = colors.textColor;
    chart.options.scales.x.grid.color = colors.gridColor;
    chart.options.scales.y.grid.color = colors.gridColor;
    chart.options.plugins.tooltip.backgroundColor = colors.tooltipBg;
    chart.update();
  }

  if (chartCanvas && window.Chart) {
    const ctx = chartCanvas.getContext('2d');
    const colors = getThemeColors();

    // Create subtle gradient under line
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 360);
    gradientFill.addColorStop(0, 'rgba(0, 114, 188, 0.35)');
    gradientFill.addColorStop(1, 'rgba(0, 114, 188, 0.0)');

    const currentDataSet = stockDatasets['3Y'];

    const stockChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: currentDataSet.labels,
        datasets: [{
          label: 'BAJFINANCE (NSE)',
          data: currentDataSet.data,
          borderColor: '#0072bc',
          borderWidth: 3,
          backgroundColor: gradientFill,
          fill: true,
          tension: 0.36,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#0072bc',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#e5a93c',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: '700' },
            bodyFont: { family: 'Plus Jakarta Sans', size: 14, weight: '600' },
            padding: 12,
            cornerRadius: 10,
            displayColors: false,
            callbacks: {
              label: (ctx) => `Price: ₹${ctx.parsed.y.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: colors.gridColor, drawBorder: false },
            ticks: { color: colors.textColor, font: { family: 'Plus Jakarta Sans', size: 12 } }
          },
          y: {
            position: 'right',
            grid: { color: colors.gridColor, drawBorder: false },
            ticks: {
              color: colors.textColor,
              font: { family: 'Plus Jakarta Sans', size: 12 },
              callback: (val) => `₹${val.toLocaleString('en-IN')}`
            }
          }
        }
      }
    });

    window.stockChartInstance = stockChart;

    // Timeframe switcher buttons
    tfBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tfBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tf = btn.getAttribute('data-timeframe');
        const selected = stockDatasets[tf];

        if (selected) {
          stockChart.data.labels = selected.labels;
          stockChart.data.datasets[0].data = selected.data;
          stockChart.update();

          if (chartChangeHeader) {
            chartChangeHeader.textContent = selected.changeText;
          }
        }
      });
    });
  }

  /* ==========================================================================
     10. Lead Application Modal & Toast Notifications
     ========================================================================== */
  const applyModal = document.getElementById('applyModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const finishModalBtn = document.getElementById('finishModalBtn');
  const leadForm = document.getElementById('leadApplicationForm');
  const modalSuccessState = document.getElementById('modalSuccessState');
  const successApplicantName = document.getElementById('successApplicantName');
  const applicationRefNum = document.getElementById('applicationRefNum');
  const selectedProductSelect = document.getElementById('selectedProduct');

  const openModalButtons = [
    document.getElementById('openApplyModalBtn'),
    document.getElementById('mobileModalBtn'),
    document.getElementById('bannerApplyBtn'),
    document.getElementById('lockRateBtn')
  ];

  function openModalWithProduct(productName) {
    if (applyModal) {
      if (modalSuccessState) modalSuccessState.style.display = 'none';
      if (leadForm) {
        leadForm.style.display = 'flex';
        leadForm.reset();
      }
      if (productName && selectedProductSelect) {
        selectedProductSelect.value = productName;
      }
      applyModal.showModal();
    }
  }

  openModalButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => openModalWithProduct());
    }
  });

  // Connect product card action buttons to pre-populate modal
  document.querySelectorAll('.btn-card-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const prod = btn.getAttribute('data-product');
      openModalWithProduct(prod);
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => applyModal.close());
  }

  if (finishModalBtn) {
    finishModalBtn.addEventListener('click', () => applyModal.close());
  }

  // Close modal when clicking outside dialog window
  if (applyModal) {
    applyModal.addEventListener('click', (e) => {
      const rect = applyModal.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog) {
        applyModal.close();
      }
    });
  }

  // Handle Form Submission
  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submitLeadBtn');
      const originalText = submitBtn.innerHTML;

      // Simulated network submission
      submitBtn.innerHTML = `<span>Processing Verification...</span>`;
      submitBtn.disabled = true;

      setTimeout(() => {
        const nameInput = document.getElementById('applicantName');
        const applicantName = nameInput.value.trim() || 'Valued Customer';
        
        // Generate random reference code
        const randomRef = `BFL-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;

        if (successApplicantName) successApplicantName.textContent = applicantName;
        if (applicationRefNum) applicationRefNum.textContent = randomRef;

        leadForm.style.display = 'none';
        modalSuccessState.style.display = 'block';

        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        showToast('Application registered successfully!');
      }, 1100);
    });
  }

  /* ==========================================================================
     11. Toast Notification Helper
     ========================================================================== */
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(message) {
    if (!toastNotification || !toastMessage) return;
    toastMessage.textContent = message;
    toastNotification.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 3500);
  }

  window.showToast = showToast;
});
