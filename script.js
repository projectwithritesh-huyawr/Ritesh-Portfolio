const body = document.body;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const apiBase = (window.PORTFOLIO_CONFIG?.API_BASE_URL || '').trim().replace(/\/+$/, '');

const apiRequest = async (path, options = {}) => {
  if (!apiBase) throw new Error('API is not configured.');
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
  });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.message || 'Request failed.');
  return result.data;
};

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

const createProjectCard = (project, index) => {
  const card = document.createElement('article');
  card.className = `project${project.featured ? ' project-featured' : ''}`;

  const content = document.createElement('div');
  content.className = 'project-content';
  const head = document.createElement('div');
  head.className = 'project-head';
  const number = document.createElement('p');
  number.className = 'project-number';
  number.textContent = String(index + 1).padStart(2, '0');
  const type = document.createElement('div');
  type.className = 'project-type';
  const category = document.createElement('span');
  category.className = 'category';
  category.textContent = project.category;
  type.append(category);
  head.append(number, type);

  const main = document.createElement('div');
  main.className = 'project-main';
  const copy = document.createElement('div');
  copy.className = 'project-copy';
  const title = document.createElement('h3');
  title.textContent = project.title.toUpperCase();
  const description = document.createElement('p');
  description.textContent = project.description;
  copy.append(title, description);

  const technologies = document.createElement('div');
  technologies.className = 'project-tech';
  technologies.setAttribute('aria-label', 'Project technologies');
  (project.technologies || []).forEach((technology) => {
    const tag = document.createElement('span');
    tag.textContent = technology;
    technologies.append(tag);
  });

  const actions = document.createElement('div');
  actions.className = 'project-actions';
  [[project.liveUrl, 'VIEW PROJECT'], [project.githubUrl, 'GITHUB']].forEach(([url, label]) => {
    if (!url) return;
    const link = document.createElement('a');
    link.className = 'inline-link';
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.append(document.createTextNode(label));
    const arrow = document.createElement('span');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    link.append(arrow);
    actions.append(link);
  });
  main.append(copy, technologies, actions);
  content.append(head, main);

  const preview = document.createElement('div');
  preview.className = 'project-preview';
  preview.setAttribute('aria-hidden', 'true');
  const image = document.createElement('img');
  image.className = 'project-asset';
  image.src = project.image || 'assets/images/portrait-placeholder.svg';
  image.alt = `${project.title} project preview`;
  preview.append(image);
  card.append(content, preview);
  return card;
};

const loadProjects = async () => {
  if (!apiBase) return;
  try {
    const projects = await apiRequest('/projects');
    if (!Array.isArray(projects) || projects.length === 0) return;
    const container = document.querySelector('#work .container');
    container.querySelectorAll('.project').forEach((project) => project.remove());
    projects.forEach((project, index) => container.append(createProjectCard(project, index)));
  } catch {
    // Keep the authored project content visible while the API is unavailable.
  }
};

const loadSkills = async () => {
  if (!apiBase) return;
  try {
    const skills = await apiRequest('/skills');
    if (!Array.isArray(skills) || skills.length === 0) return;
    const groups = new Map();
    skills.forEach((skill) => {
      if (!groups.has(skill.category)) groups.set(skill.category, []);
      groups.get(skill.category).push(skill.name);
    });

    const list = document.querySelector('.skill-list');
    list.replaceChildren();
    [...groups.entries()].forEach(([category, names], index) => {
      const row = document.createElement('div');
      row.className = 'skill-row';
      const number = document.createElement('div');
      number.className = 'skill-index';
      number.textContent = String(index + 1).padStart(2, '0');
      const text = document.createElement('div');
      text.className = 'skill-text';
      const header = document.createElement('div');
      header.className = 'skill-header';
      const title = document.createElement('h3');
      title.textContent = category;
      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      header.append(title, arrow);
      const tags = document.createElement('div');
      tags.className = 'skill-tags';
      names.forEach((name) => {
        const tag = document.createElement('span');
        tag.textContent = name;
        tags.append(tag);
      });
      text.append(header, tags);
      row.append(number, text);
      list.append(row);
    });
  } catch {
    // Keep the authored skills visible while the API is unavailable.
  }
};

const trackVisit = () => {
  if (!apiBase) return;
  apiRequest('/visitors', {
    method: 'POST',
    body: JSON.stringify({ page: window.location.pathname.replace(/[^a-zA-Z0-9/_-]/g, '').slice(0, 120) || '/' })
  }).catch(() => {});
};

const initForm = () => {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const fields = {
    name: form.querySelector('#name'),
    email: form.querySelector('#email'),
    subject: form.querySelector('#subject'),
    message: form.querySelector('#message')
  };

  const statusMessage = form.querySelector('.form-status');
  const submitButton = form.querySelector('.submit-button');

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

  form.addEventListener('submit', async (event) => {
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

    if (!fields.subject.value.trim() || fields.subject.value.trim().length > 160) {
      setError(fields.subject, 'Please enter a subject.');
      valid = false;
    }

    if (!fields.message.value.trim() || fields.message.value.trim().length < 10) {
      setError(fields.message, 'Please share a message with at least 10 characters.');
      valid = false;
    }

    if (!valid) {
      statusMessage.textContent = 'PLEASE REVIEW THE FORM AND TRY AGAIN.';
      statusMessage.classList.add('is-error');
      return;
    }

    statusMessage.classList.remove('is-error');
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.textContent = 'SENDING...';

    try {
      const result = await apiRequest('/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: fields.name.value.trim(),
          email: fields.email.value.trim(),
          subject: fields.subject.value.trim(),
          message: fields.message.value.trim()
        })
      });
      statusMessage.textContent = result.message || 'MESSAGE SENT ✓';
      form.reset();
    } catch {
      statusMessage.textContent = 'UNABLE TO SEND — TRY AGAIN';
      statusMessage.classList.add('is-error');
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      submitButton.innerHTML = 'SEND MESSAGE <span aria-hidden="true">↗</span>';
    }
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
  loadProjects();
  loadSkills();
  trackVisit();
  initCursor();
  initForm();
  initParallax();

  document.querySelector('.theme-toggle')?.addEventListener('click', toggleTheme);
};

document.addEventListener('DOMContentLoaded', init);
