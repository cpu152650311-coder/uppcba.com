/* ============================================================
   uppcba.com — reveal.js
   PASS B — Vanilla JS interaction layer (8 behaviors)
   Zero dependencies. ES5-compatible patterns.
   ============================================================ */

(function () {
  'use strict';

  /* ------------------------------------------------------------
     Utility
     ------------------------------------------------------------ */
  var qsa = function (s) { return document.querySelectorAll(s); };
  var qs  = function (s) { return document.querySelector(s); };

  /* ------------------------------------------------------------
     1. NAV SCROLL — transparent-on-hero -> solid on scroll > 80px
     ------------------------------------------------------------ */
  var siteNav = qs('.site-nav');
  if (siteNav) {
    var onScroll = function () {
      if (window.scrollY > 80) {
        siteNav.classList.add('scrolled');
      } else {
        siteNav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // set initial state
  }

  /* ------------------------------------------------------------
     2. MOBILE MENU — hamburger toggles .nav-open on .site-nav
     ------------------------------------------------------------ */
  var hamburger = qs('.nav-hamburger');
  if (hamburger && siteNav) {
    hamburger.addEventListener('click', function () {
      siteNav.classList.toggle('nav-open');
    });
  }

  /* ------------------------------------------------------------
     3. MODAL — [data-modal-open] opens, .modal-close + overlay click close
     ------------------------------------------------------------ */
  var modalOverlay = qs('.modal-overlay');

  // Open modal via [data-modal-open]
  qsa('[data-modal-open]').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var targetId = this.getAttribute('data-modal-open');
      var targetModal;
      if (targetId && targetId.charAt(0) === '#') {
        targetModal = qs(targetId);
      }
      if (targetModal) {
        targetModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Close modal via .modal-close button
  qsa('.modal-close').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var modal = this.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // Close modal via overlay click (click outside .modal-content)
  qsa('.modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // Close modal on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      qsa('.modal-overlay.open').forEach(function (modal) {
        modal.classList.remove('open');
      });
      document.body.style.overflow = '';
    }
  });

  /* ------------------------------------------------------------
     4. FAQ ACCORDION — click .faq-question toggles .open, close siblings
     ------------------------------------------------------------ */
  qsa('.faq-question').forEach(function (question) {
    question.addEventListener('click', function () {
      var faqItem = this.closest('.faq-item');
      if (!faqItem) return;

      var isOpen = faqItem.classList.contains('open');

      // Close all siblings in the same faq-list
      var faqList = faqItem.closest('.faq-list');
      if (faqList) {
        qsa('.faq-item.open', faqList).forEach(function (item) {
          item.classList.remove('open');
        });
      }

      // Toggle current (re-open if it was open; open if it was closed)
      if (!isOpen) {
        faqItem.classList.add('open');
      }
    });
  });

  /* ------------------------------------------------------------
     5. COUNTER ANIMATION — IntersectionObserver on .stat-value
     ------------------------------------------------------------ */
  var statElements = qsa('.stat-card .stat-value');
  if (statElements.length > 0 && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          animateCounter(el);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    statElements.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  function animateCounter(el) {
    var text = el.textContent.trim();
    // Extract numeric portion (handles "99.7%", "20+", "50,000", etc.)
    var match = text.match(/[\d,]+\.?\d*/);
    if (!match) return;

    var raw = match[0].replace(/,/g, '');
    var target = parseFloat(raw);
    if (isNaN(target)) return;

    var suffix = text.slice(match.index + match[0].length); // "%", "+", etc.
    var prefix = text.slice(0, match.index);
    var hasCommas = match[0].indexOf(',') !== -1;
    var isFloat = raw.indexOf('.') !== -1;
    var decimals = isFloat ? raw.split('.')[1].length : 0;

    var duration = 1800; // ms
    var startTime = null;

    function formatValue(val) {
      if (isFloat) {
        return val.toFixed(decimals);
      }
      return Math.floor(val).toString();
    }

    function addCommas(str) {
      if (!hasCommas) return str;
      var parts = str.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = target * eased;

      var formatted = formatValue(current);
      formatted = addCommas(formatted);
      el.textContent = prefix + formatted + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Final value: restore original text exactly
        el.textContent = prefix + addCommas(formatValue(target)) + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  /* ------------------------------------------------------------
     6. FORM SUBMIT — preventDefault, show .form-success, reset
        Handles standard forms AND forms inside modals
     ------------------------------------------------------------ */
  qsa('form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic HTML5 validation
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Hide any existing success/error messages
      var existingSuccess = form.querySelector('.form-success');
      if (existingSuccess) existingSuccess.remove();
      var existingError = form.querySelector('.form-error');
      if (existingError) existingError.remove();

      // Show success message
      var successMsg = document.createElement('div');
      successMsg.className = 'form-success';
      successMsg.textContent = 'Thank you! Your inquiry has been submitted. We will respond within 24 hours.';
      successMsg.style.cssText = 'padding:12px 0;font-weight:600;';
      form.appendChild(successMsg);

      // Reset form after short delay
      setTimeout(function () {
        form.reset();
        // Remove success after a few seconds
        setTimeout(function () {
          if (successMsg.parentNode) successMsg.remove();
        }, 4000);
      }, 600);
    });
  });

  /* ------------------------------------------------------------
     7. SMOOTH SCROLL — anchor links smooth-scroll to target sections
     ------------------------------------------------------------ */
  qsa('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (!href || href === '#') return;

      var target = qs(href);
      if (!target) return;

      e.preventDefault();

      // Close mobile nav if open
      if (siteNav) {
        siteNav.classList.remove('nav-open');
      }

      var navHeight = siteNav ? siteNav.offsetHeight : 68;
      var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });

  /* ------------------------------------------------------------
     8. PRODUCTS DROPDOWN — hover + click on Products nav link
     ------------------------------------------------------------ */
  var navLinks = qsa('.nav-links > li, .nav-links > a');
  var productsTrigger = null;
  var productsDropdown = null;

  // Find the Products nav item (look for text "Products" in link)
  qsa('.nav-links a').forEach(function (link) {
    if (link.textContent.trim().toLowerCase() === 'products') {
      productsTrigger = link.parentNode; // the <li> if wrapped, or the <a> itself
      // Look for an adjacent or child dropdown
      var sibling = link.nextElementSibling;
      if (sibling && sibling.classList.contains('nav-dropdown')) {
        productsDropdown = sibling;
      }
      // If no sibling dropdown found, check parent's children
      if (!productsDropdown && productsTrigger) {
        var dd = qs('.nav-dropdown', productsTrigger);
        if (dd) productsDropdown = dd;
      }
    }
  });

  if (productsTrigger && productsDropdown) {
    var dropdownTimeout = null;

    // Hover: show dropdown
    productsTrigger.addEventListener('mouseenter', function () {
      clearTimeout(dropdownTimeout);
      productsDropdown.classList.add('open');
    });

    productsTrigger.addEventListener('mouseleave', function () {
      dropdownTimeout = setTimeout(function () {
        productsDropdown.classList.remove('open');
      }, 200);
    });

    productsDropdown.addEventListener('mouseenter', function () {
      clearTimeout(dropdownTimeout);
      productsDropdown.classList.add('open');
    });

    productsDropdown.addEventListener('mouseleave', function () {
      dropdownTimeout = setTimeout(function () {
        productsDropdown.classList.remove('open');
      }, 200);
    });

    // Click: toggle on touch devices, follow link on desktop
    var triggerLink = qs('a', productsTrigger) || productsTrigger;
    triggerLink.addEventListener('click', function (e) {
      // On touch devices or when dropdown is closed, toggle it
      if ('ontouchstart' in window || !productsDropdown.classList.contains('open')) {
        e.preventDefault();
        productsDropdown.classList.toggle('open');
      }
      // Otherwise let the click navigate to products.html
    });
  }

})();
