const body = document.body;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const setupTheme = () => {
  const storedTheme = localStorage.getItem('portfolio-theme');
  if (storedTheme === 'light') {
    body.classList.add('theme-light');
  }

  const toggle = document.querySelector('.theme-toggle');
  const label = toggle?.querySelector('.toggle-label');

  if (toggle && label) {
    const isLight = body.classList.contains('theme-light');
    label.textContent = isLight ? 'LIGHT' : 'DARK';
  }
};

const toggleTheme = () => {
  const isLight = body.classList.toggle('theme-light');
  localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');

  const toggle = document.querySelector('.theme-toggle');
  const label = toggle?.querySelector('.toggle-label');
  if (label) {
    label.textContent = isLight ? 'LIGHT' : 'DARK';
  }
};

const initHeader = () => {
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 12);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
};

const initMobileMenu = () => {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.mobile-menu');
  const navLinks = menu?.querySelectorAll('a');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.querySelectorAll('span')[0].style.transform = isOpen ? 'translateY(3px) rotate(45deg)' : 'none';
    toggle.querySelectorAll('span')[1].style.transform = isOpen ? 'translateY(-3px) rotate(-45deg)' : 'none';
  });

  navLinks?.forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelectorAll('span')[0].style.transform = 'none';
      toggle.querySelectorAll('span')[1].style.transform = 'none';
    });
  });
};

const revealOnLoad = () => {
  const revealItems = document.querySelectorAll('.reveal, .reveal-scroll');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => observer.observe(item));
  requestAnimationFrame(() => body.classList.add('loaded'));
};

const initCursor = () => {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  body.classList.add('has-cursor');

  document.addEventListener('pointermove', (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });

  const hoverTargets = document.querySelectorAll('a, button, .project, .skill-row');
  hoverTargets.forEach((element) => {
    element.addEventListener('mouseenter', () => {
      const targetText = element.closest('.project') ? 'OPEN' : 'VIEW';
      cursor.classList.add('expand');
      if (targetText === 'OPEN') {
        cursor.classList.add('view-open');
      } else {
        cursor.classList.remove('view-open');
      }
    });

    element.addEventListener('mouseleave', () => {
      cursor.classList.remove('expand', 'view-open');
    });
  });
};

const initPhoto = () => {
  const candidates = ['portrait.jpg', 'portrait.jpeg', 'portrait.png', 'portrait.webp'];
  const image = document.querySelector('[data-photo-role="hero"] img');
  const frame = document.querySelector('.portrait-frame');
  if (!image || !frame) return;

  const applyPhotoLayout = () => {
    const isPortrait = image.naturalWidth > 0 && image.naturalHeight > 0 ? image.naturalHeight > image.naturalWidth : false;
    frame.classList.toggle('photo-portrait', isPortrait);
    frame.classList.toggle('photo-landscape', !isPortrait);
    image.style.objectPosition = 'center center';
    image.style.objectFit = 'cover';
  };

  const basePath = 'assets/images/';
  let matched = false;

  candidates.forEach((candidate) => {
    if (matched) return;
    const src = `${basePath}${candidate}`;
    const testImage = new Image();
    testImage.onload = () => {
      matched = true;
      image.src = src;
      image.alt = 'Portrait of Ritesh Sahebrav Rajput';
      image.onload = applyPhotoLayout;
      applyPhotoLayout();
    };
    testImage.onerror = () => {};
    testImage.src = src;
  });

  if (!matched) {
    image.src = image.dataset.fallback || 'assets/images/portrait-placeholder.svg';
    image.onload = applyPhotoLayout;
    applyPhotoLayout();
  }
};

const initProjectImages = () => {
  const projectAssets = document.querySelectorAll('.project-asset');

  projectAssets.forEach((asset) => {
    const projectName = asset.dataset.projectName;
    const fallback = asset.dataset.fallback || asset.src;
    const baseNames = [
      projectName,
      projectName.replace('project-', '')
    ];

    const candidates = [];
    baseNames.forEach((baseName) => {
      ['jpg', 'jpeg', 'png', 'webp'].forEach((ext) => {
        candidates.push(`${baseName}.${ext}`);
        candidates.push(`project-${baseName}.${ext}`);
      });
    });

    let matched = false;
    candidates.forEach((candidate) => {
      if (matched) return;
      const src = `assets/images/${candidate}`;
      const testImage = new Image();
      testImage.onload = () => {
        matched = true;
        asset.src = src;
      };
      testImage.onerror = () => {};
      testImage.src = src;
    });

    if (!matched) {
      asset.src = fallback;
    }
  });
};

const initForm = () => {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const fields = {
    name: form.querySelector('#name'),
    email: form.querySelector('#email'),
    message: form.querySelector('#message')
  };

  const statusMessage = form.querySelector('.form-status');

  const setError = (field, message) => {
    const errorElement = field.parentElement.querySelector('.error-message');
    field.classList.add('invalid');
    errorElement.textContent = message;
  };

  const clearError = (field) => {
    const errorElement = field.parentElement.querySelector('.error-message');
    field.classList.remove('invalid');
    errorElement.textContent = '';
  };

  Object.values(fields).forEach((field) => {
    field.addEventListener('input', () => clearError(field));
    field.addEventListener('blur', () => clearError(field));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let valid = true;

    if (!fields.name.value.trim()) {
      setError(fields.name, 'Please enter your name.');
      valid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!fields.email.value.trim() || !emailPattern.test(fields.email.value.trim())) {
      setError(fields.email, 'Please enter a valid email address.');
      valid = false;
    }

    if (!fields.message.value.trim() || fields.message.value.trim().length < 10) {
      setError(fields.message, 'Please share a message with at least 10 characters.');
      valid = false;
    }

    if (!valid) {
      statusMessage.textContent = 'Please review the form and try again.';
      return;
    }

    statusMessage.textContent = 'Form ready — frontend validation passed. Connect this to your email backend when ready.';
    form.reset();
  });
};

const initParallax = () => {
  if (prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

  const portrait = document.querySelector('.portrait-frame');
  if (!portrait) return;

  const handleMove = (event) => {
    const rect = portrait.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    portrait.style.transform = `translate3d(${x * 12}px, ${y * -10}px, 0)`;
  };

  document.addEventListener('pointermove', handleMove);
};

const init = () => {
  setupTheme();
  initHeader();
  initMobileMenu();
  revealOnLoad();
  initPhoto();
  initProjectImages();
  initCursor();
  initForm();
  initParallax();

  document.querySelector('.theme-toggle')?.addEventListener('click', toggleTheme);
};

document.addEventListener('DOMContentLoaded', init);
