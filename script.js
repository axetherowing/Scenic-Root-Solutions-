/* ===========================
   SCRIPT.JS - Scenic Root Solutions
   =========================== */

// ---- Mobile Navigation ----
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('main-nav');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mainNav.classList.toggle('open');
});

// Close nav on link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mainNav.classList.remove('open');
  });
});

// ---- Header Scroll Effect ----
const siteHeader = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    siteHeader.classList.add('scrolled');
  } else {
    siteHeader.classList.remove('scrolled');
  }
}, { passive: true });

// ---- Active Nav Link on Scroll ----
const sections = document.querySelectorAll('section[id], header[id]');
const navLinks = document.querySelectorAll('.nav-link');

const observerOptions = { rootMargin: '-40% 0px -55% 0px' };
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, observerOptions);

sections.forEach(section => navObserver.observe(section));

// ---- Scroll Reveal Animations ----
const revealElements = document.querySelectorAll(
  '.service-card, .review-card, .about-grid, .trust-item, .contact-info, .contact-form, .section-title, .section-label'
);

revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger animation for grid items
      const delay = entry.target.closest('.services-grid, .reviews-grid, .trust-bar-inner')
        ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 120
        : 0;
      setTimeout(() => {
        entry.target.classList.add('in-view');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// ==== GALLERY CAROUSEL (CSS BASED) ====
// No JS needed for the CSS infinite scrolling loop

// ---- Contact Form Submission (FormSubmit) ----
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
  const submitBtn = contactForm.querySelector('[type="submit"]');

  submitBtn.addEventListener('click', () => {
    console.log("button clicked");
  });

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log("form submitted");
    
    // Check if form is valid (handles case where browser hides validation bubble)
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span style="display:inline-block;animation:spin 0.8s linear infinite">⏳</span> Sending...';

    const formData = new FormData(contactForm);
    formData.append('_subject', 'New Tree Service Request');
    formData.append('_captcha', 'false'); // Disable standard captcha if using ajax

    fetch('https://formsubmit.co/ajax/h8464190@gmail.com', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        formSuccess.style.display = 'block';
        contactForm.reset();
        setTimeout(() => { formSuccess.style.display = 'none'; }, 6000);
      } else {
        alert(data.message || "There was an error sending your request. Please try again later.");
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    })
    .catch(error => {
      console.error("Fetch Error:", error);
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      alert("Network Error: Could not reach FormSubmit. Please try again.");
    });
  });
}

// ---- Phone number formatting ----
const phoneInput = document.getElementById('phone');
if (phoneInput) {
  phoneInput.addEventListener('input', function () {
    let val = this.value.replace(/\D/g, '');
    if (val.length > 10) val = val.slice(0, 10);
    let formatted = '';
    if (val.length > 0) formatted = '(' + val.slice(0, 3);
    if (val.length > 3) formatted += ') ' + val.slice(3, 6);
    if (val.length > 6) formatted += '-' + val.slice(6);
    this.value = formatted;
  });
}

// ---- Smooth hero parallax ----
const heroBgImg = document.querySelector('.hero-bg-img');
if (heroBgImg) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY < window.innerHeight) {
      heroBgImg.style.transform = `translateY(${scrollY * 0.35}px)`;
    }
  }, { passive: true });
}

// ---- Spinner animation keyframe ----
const style = document.createElement('style');
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);
