/* -------------------------------------------------------------
 * IZISTOK INTERACTIVE LOGIC & ANIMATIONS
 * GSAP ScrollTrigger, Simulator calculations, and dynamic UI
 * ------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Set current year in footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* -------------------------------------------------------------
   * 1. NAVBAR MORPHING LOGIC
   * ------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  /* -------------------------------------------------------------
   * 1b. LIGHT/DARK THEME TOGGLE LOGIC
   * ------------------------------------------------------------- */
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    
    if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }

    themeToggle.addEventListener('click', () => {
      const isLight = document.documentElement.classList.toggle('light-mode');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
  }

  /* -------------------------------------------------------------
   * 2. INTERACTIVE SIMULATOR LOGIC
   * ------------------------------------------------------------- */
  const priceSlider = document.getElementById('sim-price');
  const costSlider = document.getElementById('sim-cost');
  const volumeSlider = document.getElementById('sim-volume');

  const valPrice = document.getElementById('val-price');
  const valCost = document.getElementById('val-cost');
  const valVolume = document.getElementById('val-volume');

  const metricCa = document.getElementById('metric-ca');
  const metricMargin = document.getElementById('metric-margin');
  const metricMarginPercent = document.getElementById('metric-margin-percent');
  const metricStock = document.getElementById('metric-stock');
  const metricTax = document.getElementById('metric-tax');

  const visCostVal = document.getElementById('vis-cost-val');
  const visTaxVal = document.getElementById('vis-tax-val');
  const visNetVal = document.getElementById('vis-net-val');

  const barStock = document.getElementById('bar-stock');
  const barTax = document.getElementById('bar-tax');
  const barNet = document.getElementById('bar-net');

  function runSimulation() {
    if (!priceSlider || !costSlider || !volumeSlider) return;

    // Retrieve input values safely
    const price = parseFloat(priceSlider.value) || 0;
    const cost = parseFloat(costSlider.value) || 0;
    const volume = parseInt(volumeSlider.value) || 0;

    // Force cost to be less than price to keep simulation logical
    if (cost >= price) {
      costSlider.value = Math.max(1, Math.floor(price * 0.4));
      valCost.textContent = costSlider.value + ' FCFA';
      runSimulation();
      return;
    }

    // Update displays
    valPrice.textContent = `${price} FCFA`;
    valCost.textContent = `${cost} FCFA`;
    valVolume.textContent = `${volume} unités`;

    // Calculations (TTC and HT)
    const caTtc = price * volume;
    const tva = Math.round(caTtc - (caTtc / 1.2)); // 20% standard French VAT included
    const caHt = caTtc - tva;
    const stockValue = cost * volume;
    const netMargin = caHt - stockValue;
    const marginPercent = caHt > 0 ? Math.round((netMargin / caHt) * 100) : 0;

    // Update results (Security: use textContent to avoid XSS)
    metricCa.textContent = `${caTtc.toLocaleString('fr-FR')} FCFA`;
    metricMargin.textContent = `${netMargin.toLocaleString('fr-FR')} FCFA`;
    metricMarginPercent.textContent = `${marginPercent}% de marge brute HT`;
    metricStock.textContent = `${stockValue.toLocaleString('fr-FR')} FCFA`;
    metricTax.textContent = `${tva.toLocaleString('fr-FR')} FCFA`;

    // Update visual bars values
    visCostVal.textContent = stockValue.toLocaleString('fr-FR');
    visTaxVal.textContent = tva.toLocaleString('fr-FR');
    visNetVal.textContent = netMargin.toLocaleString('fr-FR');

    // Proportions for visual progress bars
    const total = stockValue + tva + Math.max(0, netMargin);
    if (total > 0) {
      const stockWidth = Math.max(5, (stockValue / total) * 100);
      const taxWidth = Math.max(5, (tva / total) * 100);
      const netWidth = Math.max(5, (Math.max(0, netMargin) / total) * 100);

      barStock.style.width = `${stockWidth}%`;
      barTax.style.width = `${taxWidth}%`;
      barNet.style.width = `${netWidth}%`;
    } else {
      barStock.style.width = '0%';
      barTax.style.width = '0%';
      barNet.style.width = '0%';
    }
  }

  // Attach simulator events
  if (priceSlider && costSlider && volumeSlider) {
    priceSlider.addEventListener('input', runSimulation);
    costSlider.addEventListener('input', runSimulation);
    volumeSlider.addEventListener('input', runSimulation);
    // Initial run
    runSimulation();
  }



  /* -------------------------------------------------------------
   * 4. FAQ ACCORDION TRANSITIONS
   * ------------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (question && answer) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all other items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-answer').style.maxHeight = null;
          }
        });

        // Toggle current item
        if (isActive) {
          item.classList.remove('active');
          answer.style.maxHeight = null;
        } else {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });

  /* -------------------------------------------------------------
   * 5. MOUSE SPOTLIGHT EFFECT (FEATURE CARDS)
   * ------------------------------------------------------------- */
  const cards = document.querySelectorAll('.feature-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  /* -------------------------------------------------------------
   * 6. MAGNETIC CTA BUTTON EFFECT
   * ------------------------------------------------------------- */
  const magneticBtns = document.querySelectorAll('.magnetic-btn');
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      if (typeof gsap !== 'undefined') {
        gsap.to(btn, {
          x: x * 0.35,
          y: y * 0.35,
          scale: 1.03,
          duration: 0.3,
          ease: 'power3.out'
        });
      }
    });

    btn.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(btn, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)'
        });
      }
    });
  });

  /* -------------------------------------------------------------
   * 7. SECURE CONTACT FORM HANDLING
   * ------------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');
  const btnSubmit = document.getElementById('btn-submit');

  if (contactForm && formFeedback && btnSubmit) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Retrieve and sanitize inputs safely
      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const phone = document.getElementById('form-phone').value.trim();
      const company = document.getElementById('form-company').value.trim();
      const message = document.getElementById('form-message').value.trim();

      if (!name || !email || !company || !message) {
        showFeedback("Veuillez remplir tous les champs obligatoires.", "error");
        return;
      }

      // Safe email syntax validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showFeedback("Veuillez saisir une adresse e-mail valide.", "error");
        return;
      }

      // Show loading status
      btnSubmit.disabled = true;
      const originalText = btnSubmit.innerHTML;
      btnSubmit.textContent = "Envoi en cours...";

      // Simulate API Request with timeout
      setTimeout(() => {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalText;
        
        // Success response
        showFeedback(`Merci ${escapeHTML(name)} ! Votre demande de démo pour ${escapeHTML(company)} a bien été envoyée. Notre équipe vous recontactera très rapidement.`, "success");
        contactForm.reset();
      }, 1200);
    });
  }

  function showFeedback(text, type) {
    if (!formFeedback) return;
    formFeedback.textContent = text;
    formFeedback.className = `form-feedback ${type}`;
    
    // Clear feedback after 8 seconds
    setTimeout(() => {
      formFeedback.classList.add('hidden');
    }, 8000);
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* -------------------------------------------------------------
   * 8. GSAP SCROLL ANIMATIONS (CINEMATIC ENTRY)
   * ------------------------------------------------------------- */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Initial Hero Entrance Animation
    const heroTl = gsap.timeline();
    heroTl.from('.navbar', {
      y: -60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    })
    .from('.hero-badge', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.6')
    .from('.hero-title', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.5')
    .from('.hero-subtitle', {
      y: 25,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out'
    }, '-=0.6');
    // Only animate CTA buttons and benefits on desktop/tablet to ensure they are always visible on mobile
    if (window.innerWidth > 768) {
      heroTl.from('.hero-ctas .btn', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out'
      }, '-=0.5')
      .from('.benefit-item', {
        y: 15,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out'
      }, '-=0.4');
    }

    heroTl.from('.mockup-window', {
      rotateX: 12,
      rotateY: -12,
      y: 50,
      opacity: 0,
      duration: 1.1,
      ease: 'power2.out',
      clearProps: 'transform'
    }, '-=0.6')
    .from('.mockup-chat-widget', {
      scale: 0.8,
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'back.out(1.4)',
      clearProps: 'transform'
    }, '-=0.4');

    // Only run scroll animations on desktop/tablet to ensure 100% reliability and performance on mobile
    if (window.innerWidth > 768) {
      // Scroll Animations: Features Stagger Fade Up
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: '.features-section',
          start: 'top 90%',
          toggleActions: 'play none none none'
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      });

      // Scroll Animations: Simulator fade-in
      gsap.from('.simulator-panel', {
        scrollTrigger: {
          trigger: '.simulator-section',
          start: 'top 90%'
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });

      gsap.from('.simulator-dashboard', {
        scrollTrigger: {
          trigger: '.simulator-section',
          start: 'top 90%'
        },
        x: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });

      // Scroll Animations: FAQ questions
      gsap.from('.faq-item', {
        scrollTrigger: {
          trigger: '.faqs-section',
          start: 'top 90%'
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      });

      // Scroll Animations: Contact Section
      gsap.from('.contact-info', {
        scrollTrigger: {
          trigger: '.contact-section',
          start: 'top 90%'
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });

      // Recalculate ScrollTrigger positions on startup
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    }
  }
});
