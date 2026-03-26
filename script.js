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

// ==== GALLERY CAROUSEL ====
const track = document.getElementById('gallery-track');
const slides = track ? Array.from(track.children) : [];
const nextBtn = document.querySelector('.next-btn');
const prevBtn = document.querySelector('.prev-btn');
const dotsContainer = document.getElementById('gallery-dots');

if (track && slides.length > 0) {
  let currentIndex = 0;
  const slideCount = slides.length;
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let autoPlayInterval;

  function getItemsPerView() {
    if (window.innerWidth > 900) return 3;
    if (window.innerWidth > 600) return 2;
    return 1;
  }

  function getMaxIndex() {
    const max = slideCount - getItemsPerView();
    return max > 0 ? max : 0;
  }

  // Setup dots based on number of stops
  dotsContainer.innerHTML = '';
  for(let i=0; i <= getMaxIndex(); i++) {
    const dot = document.createElement('button');
    dot.classList.add('carousel-dot');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    
    dot.addEventListener('click', () => {
      goToSlide(i);
      resetAutoPlay();
    });
    dotsContainer.appendChild(dot);
  }
  const dots = Array.from(dotsContainer.children);

  function getSlideWidth() {
    const gap = window.innerWidth > 900 ? 20 : (window.innerWidth > 600 ? 20 : 0);
    return slides[0].getBoundingClientRect().width + gap;
  }
  
  function updateDots(index) {
    dots.forEach(dot => dot.classList.remove('active'));
    if(dots[index]) dots[index].classList.add('active');
  }

  function setPositionByIndex() {
    currentTranslate = currentIndex * -getSlideWidth();
    prevTranslate = currentTranslate;
    track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    track.style.transform = `translateX(${currentTranslate}px)`;
    updateDots(currentIndex);
  }

  function goToSlide(index) {
    const maxIndex = getMaxIndex();
    if (index < 0) {
      currentIndex = maxIndex;
    } else if (index > maxIndex) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }
    setPositionByIndex();
  }

  function goNext() { goToSlide(currentIndex + 1); }
  function goPrev() { goToSlide(currentIndex - 1); }

  if(nextBtn) nextBtn.addEventListener('click', () => { goNext(); resetAutoPlay(); });
  if(prevBtn) prevBtn.addEventListener('click', () => { goPrev(); resetAutoPlay(); });

  // Auto Scroll
  function startAutoPlay() {
    autoPlayInterval = setInterval(goNext, 3000); // 3 seconds per requirement
  }
  function stopAutoPlay() {
    clearInterval(autoPlayInterval);
  }
  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // Hover to pause
  const carouselContainer = document.querySelector('.carousel-container');
  if(carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopAutoPlay);
    carouselContainer.addEventListener('mouseleave', startAutoPlay);
  }

  // Touch / Drag events
  track.addEventListener('touchstart', touchStart, {passive: true});
  track.addEventListener('touchend', touchEnd);
  track.addEventListener('touchmove', touchMove, {passive: true});
  track.addEventListener('mousedown', touchStart);
  track.addEventListener('mouseup', touchEnd);
  track.addEventListener('mousemove', touchMove);
  track.addEventListener('mouseleave', () => { if(isDragging) touchEnd(); });

  function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
  }

  function touchStart(event) {
    isDragging = true;
    track.classList.add('grabbing');
    startPos = getPositionX(event);
    track.style.transition = 'none'; // remove transition for direct following
    stopAutoPlay();
  }

  function touchMove(event) {
    if (!isDragging) return;
    const currentPosition = getPositionX(event);
    const movedBy = currentPosition - startPos;
    track.style.transform = `translateX(${prevTranslate + movedBy}px)`;
  }

  function touchEnd() {
    isDragging = false;
    track.classList.remove('grabbing');
    // Extract pixel value from transform
    const currentTransform = track.style.transform;
    const pxMatch = currentTransform.match(/translateX\(([-\d.]+)px\)/);
    const translatedX = pxMatch ? Number(pxMatch[1]) : prevTranslate;
    const movedBy = translatedX - prevTranslate;
    
    // threshold to register as drag
    if (movedBy < -50) goNext();
    else if (movedBy > 50) goPrev();
    else setPositionByIndex(); // snap back
    
    startAutoPlay();
  }

  // Handle Resize
  window.addEventListener('resize', () => {
    // wait slightly for resize to settle
    setTimeout(() => {
	    // Regenerate dots on resize
      const maxIndex = getMaxIndex();
	    dotsContainer.innerHTML = '';
	    for(let i=0; i <= maxIndex; i++) {
	      const dot = document.createElement('button');
	      dot.classList.add('carousel-dot');
	      dot.setAttribute('aria-label', `Slide ${i + 1}`);
	      if (i === (currentIndex > maxIndex ? maxIndex : currentIndex)) dot.classList.add('active');
	      dot.addEventListener('click', () => { goToSlide(i); resetAutoPlay(); });
	      dotsContainer.appendChild(dot);
	    }
	    // Update references
	    dots.length = 0;
	    dots.push(...Array.from(dotsContainer.children));
	    
	    goToSlide(currentIndex > maxIndex ? maxIndex : currentIndex);
    }, 100);
  });

  startAutoPlay();
}

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
