const apiBase = (window.PORTFOLIO_CONFIG?.API_BASE_URL || '').trim().replace(/\/+$/, '');
const tokenKey = 'ritesh-portfolio-admin-token';
const loginShell = document.querySelector('#login-shell');
const adminShell = document.querySelector('#admin-shell');
const loginForm = document.querySelector('#login-form');
const loginFeedback = document.querySelector('#login-feedback');
const globalFeedback = document.querySelector('#global-feedback');
const editorDialog = document.querySelector('#editor-dialog');
const editorForm = document.querySelector('#editor-form');
const messageDialog = document.querySelector('#message-dialog');
const state = { projects: [], skills: [], messages: [], view: 'overview', editorType: '', editingId: '' };

const request = async (path, options = {}) => {
  if (!apiBase) throw new Error('SETUP REQUIRED: Set API_BASE_URL in config.js.');
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers };
  const token = sessionStorage.getItem(tokenKey);
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${apiBase}${path}`, { ...options, headers });
  let result;
  try { result = await response.json(); } catch { throw new Error('The API response could not be read.'); }
  if (!response.ok) throw new Error(result.message || 'The request could not be completed.');
  return result;
};

const setFeedback = (element, message, isError = false) => {
  element.textContent = message;
  element.classList.toggle('error', isError);
};

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

const formatDate = (date) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date));
const createButton = (label, action, extraClass = '') => {
  const button = element('button', `row-action ${extraClass}`.trim(), label);
  button.type = 'button';
  button.addEventListener('click', action);
  return button;
};

const selectView = (name) => {
  state.view = name;
  document.querySelectorAll('[data-view]').forEach((panel) => {
    const isActive = panel.dataset.view === name;
    panel.hidden = !isActive;
    panel.classList.toggle('active', isActive);
  });
  document.querySelectorAll('[data-view-target]').forEach((button) => {
    button.classList.toggle('active', button.dataset.viewTarget === name && button.classList.contains('nav-item'));
  });
  const titles = { overview: 'Overview', messages: 'Messages', projects: 'Projects', skills: 'Skills' };
  document.querySelector('#view-title').textContent = titles[name];
};

const renderMetrics = (visitorCount = 0) => {
  const metrics = [
    ['Total Projects', state.projects.length],
    ['Total Messages', state.messages.length],
    ['Unread Messages', state.messages.filter((message) => message.status === 'unread').length],
    ['Total Skills', state.skills.length],
    ['Visitor Count', visitorCount]
  ];
  const grid = document.querySelector('#metric-grid');
  grid.replaceChildren(...metrics.map(([label, value]) => {
    const metric = element('div', 'metric');
    metric.append(element('span', 'metric-label', label), element('strong', 'metric-value', String(value)));
    return metric;
  }));
};

const showMessage = async (id) => {
  try {
    const result = await request(`/messages/${id}`);
    const message = result.data;
    document.querySelector('#detail-subject').textContent = message.subject;
    document.querySelector('#detail-from').textContent = `${message.name} · ${message.email}`;
    document.querySelector('#detail-date').textContent = formatDate(message.createdAt);
    document.querySelector('#detail-body').textContent = message.message;
    document.querySelector('#detail-email').href = `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`;
    messageDialog.showModal();
    await loadDashboard();
  } catch (error) { setFeedback(globalFeedback, error.message, true); }
};

const renderMessages = () => {
  const table = document.querySelector('#messages-table');
  const recent = document.querySelector('#recent-messages');
  const filter = document.querySelector('#message-filter').value;
  const messages = filter ? state.messages.filter((message) => message.status === filter) : state.messages;
  table.replaceChildren();
  recent.replaceChildren();
  document.querySelector('#messages-empty').hidden = messages.length > 0;

  messages.forEach((message) => {
    const row = element('tr');
    const from = element('td');
    from.append(element('span', 'table-primary', message.name), element('span', 'table-secondary', message.email));
    const subject = element('td', '', message.subject);
    const date = element('td', '', formatDate(message.createdAt));
    const status = element('td');
    status.append(element('span', `status-label ${message.status}`, message.status));
    const actions = element('td');
    const actionGroup = element('div', 'row-actions');
    actionGroup.append(createButton('VIEW', () => showMessage(message._id)));
    if (message.status !== 'read') actionGroup.append(createButton('MARK READ', () => setMessageStatus(message._id, 'read')));
    if (message.status !== 'replied') actionGroup.append(createButton('MARK REPLIED', () => setMessageStatus(message._id, 'replied')));
    actionGroup.append(createButton('DELETE', () => deleteMessage(message._id), 'danger'));
    actions.append(actionGroup);
    row.append(from, subject, date, status, actions);
    table.append(row);

    if (recent.childElementCount < 5) {
      const item = element('button', 'compact-message');
      item.type = 'button';
      item.append(element('strong', '', message.name), element('span', '', message.subject), element('time', '', formatDate(message.createdAt)));
      item.addEventListener('click', () => showMessage(message._id));
      recent.append(item);
    }
  });
  if (!messages.length) recent.append(element('p', 'empty-state', 'No messages yet.'));
};

const renderProjects = () => {
  const table = document.querySelector('#projects-table');
  table.replaceChildren();
  document.querySelector('#projects-empty').hidden = state.projects.length > 0;
  state.projects.forEach((project) => {
    const row = element('tr');
    const title = element('td');
    title.append(element('span', 'table-primary', project.title), element('span', 'table-secondary', project.slug));
    const actions = element('td');
    const group = element('div', 'row-actions');
    group.append(
      createButton(project.featured ? 'UNFEATURE' : 'FEATURE', () => saveProject({ ...project, featured: !project.featured })),
      createButton('EDIT', () => openEditor('project', project)),
      createButton('DELETE', () => deleteItem('projects', project._id, project.title), 'danger')
    );
    actions.append(group);
    row.append(title, element('td', '', project.category), element('td', '', project.featured ? 'Yes' : 'No'), element('td', '', String(project.order)), actions);
    table.append(row);
  });
};

const renderSkills = () => {
  const table = document.querySelector('#skills-table');
  table.replaceChildren();
  document.querySelector('#skills-empty').hidden = state.skills.length > 0;
  state.skills.forEach((skill) => {
    const row = element('tr');
    const name = element('td');
    name.append(element('span', 'table-primary', skill.name));
    const actions = element('td');
    const group = element('div', 'row-actions');
    group.append(createButton('EDIT', () => openEditor('skill', skill)), createButton('DELETE', () => deleteItem('skills', skill._id, skill.name), 'danger'));
    actions.append(group);
    row.append(name, element('td', '', skill.category), element('td', '', skill.icon || '—'), element('td', '', String(skill.order)), actions);
    table.append(row);
  });
};

const loadDashboard = async () => {
  const [projects, skills, messages, visitors] = await Promise.all([
    request('/projects'), request('/skills'), request('/messages'), request('/visitors/stats')
  ]);
  state.projects = projects.data;
  state.skills = skills.data;
  state.messages = messages.data;
  renderProjects();
  renderSkills();
  renderMessages();
  const stats = visitors.data;
  document.querySelector('#visit-total').textContent = String(stats.totalVisits);
  const pages = document.querySelector('#popular-pages');
  pages.replaceChildren(...stats.popularPages.map((page) => {
    const row = element('div', 'popular-page');
    row.append(element('span', '', page.page), element('span', '', String(page.visits)));
    return row;
  }));
  renderMetrics(stats.totalVisits);
};

const showDashboard = async () => {
  loginShell.hidden = true;
  adminShell.hidden = false;
  try {
    const result = await request('/auth/me');
    document.querySelector('#admin-name').textContent = result.data.name;
    await loadDashboard();
    selectView(state.view);
    setFeedback(globalFeedback, 'Workspace ready.');
  } catch (error) {
    sessionStorage.removeItem(tokenKey);
    adminShell.hidden = true;
    loginShell.hidden = false;
    setFeedback(loginFeedback, error.message, true);
  }
};

const setMessageStatus = async (id, status) => {
  try {
    await request(`/messages/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await loadDashboard();
    setFeedback(globalFeedback, `Message marked ${status}.`);
  } catch (error) { setFeedback(globalFeedback, error.message, true); }
};

const deleteMessage = async (id) => {
  if (!window.confirm('Delete this message permanently?')) return;
  try {
    await request(`/messages/${id}`, { method: 'DELETE' });
    await loadDashboard();
    setFeedback(globalFeedback, 'Message deleted.');
  } catch (error) { setFeedback(globalFeedback, error.message, true); }
};

const deleteItem = async (collection, id, title) => {
  if (!window.confirm(`Delete “${title}” permanently?`)) return;
  try {
    await request(`/${collection}/${id}`, { method: 'DELETE' });
    await loadDashboard();
    setFeedback(globalFeedback, 'Item deleted.');
  } catch (error) { setFeedback(globalFeedback, error.message, true); }
};

const saveProject = async (project) => {
  const { _id, __v, createdAt, updatedAt, ...fields } = project;
  try {
    await request(_id ? `/projects/${_id}` : '/projects', {
      method: _id ? 'PUT' : 'POST',
      body: JSON.stringify(fields)
    });
    if (editorDialog.open) editorDialog.close();
    await loadDashboard();
    setFeedback(globalFeedback, 'Project saved.');
  } catch (error) { setFeedback(editorDialog.open ? document.querySelector('#editor-feedback') : globalFeedback, error.message, true); }
};

const saveSkill = async (skill) => {
  const { _id, __v, createdAt, updatedAt, ...fields } = skill;
  try {
    await request(_id ? `/skills/${_id}` : '/skills', {
      method: _id ? 'PUT' : 'POST',
      body: JSON.stringify(fields)
    });
    if (editorDialog.open) editorDialog.close();
    await loadDashboard();
    setFeedback(globalFeedback, 'Skill saved.');
  } catch (error) { setFeedback(editorDialog.open ? document.querySelector('#editor-feedback') : globalFeedback, error.message, true); }
};

const projectFields = [
  { key: 'title', label: 'Title', required: true },
  { key: 'category', label: 'Category', required: true },
  { key: 'description', label: 'Description', type: 'textarea', wide: true, required: true },
  { key: 'technologies', label: 'Technologies (comma-separated)', wide: true },
  { key: 'image', label: 'Image URL or site path', wide: true },
  { key: 'githubUrl', label: 'GitHub URL' },
  { key: 'liveUrl', label: 'Live URL' },
  { key: 'order', label: 'Display order', type: 'number' },
  { key: 'featured', label: 'Featured project', type: 'checkbox' }
];
const skillFields = [
  { key: 'name', label: 'Skill name', required: true },
  { key: 'category', label: 'Category', required: true },
  { key: 'icon', label: 'Icon (optional)' },
  { key: 'order', label: 'Display order', type: 'number' }
];

const openEditor = (type, item = {}) => {
  state.editorType = type;
  state.editingId = item._id || '';
  const fields = type === 'project' ? projectFields : skillFields;
  document.querySelector('#editor-title').textContent = `${item._id ? 'Edit' : 'Add'} ${type}`;
  document.querySelector('#editor-kicker').textContent = `PORTFOLIO / ${type.toUpperCase()}`;
  document.querySelector('#editor-submit').innerHTML = `${item._id ? 'SAVE CHANGES' : 'ADD ITEM'} <span aria-hidden="true">↗</span>`;
  setFeedback(document.querySelector('#editor-feedback'), '');
  const container = document.querySelector('#editor-fields');
  container.replaceChildren(...fields.map((field) => {
    const label = element('label', field.wide || field.type === 'textarea' ? 'wide' : '');
    label.append(document.createTextNode(field.label));
    const input = element(field.type === 'textarea' ? 'textarea' : 'input');
    input.name = field.key;
    if (field.type && field.type !== 'textarea') input.type = field.type;
    if (field.required) input.required = true;
    if (field.type === 'number') { input.min = '0'; input.max = '10000'; input.value = item[field.key] ?? 0; }
    else if (field.type === 'checkbox') input.checked = Boolean(item[field.key]);
    else if (field.key === 'technologies') input.value = (item[field.key] || []).join(', ');
    else input.value = item[field.key] || '';
    label.append(input);
    return label;
  }));
  editorDialog.showModal();
};

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submit = loginForm.querySelector('button[type="submit"]');
  submit.disabled = true;
  setFeedback(loginFeedback, 'SIGNING IN...');
  try {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: loginForm.email.value, password: loginForm.password.value })
    });
    sessionStorage.setItem(tokenKey, result.data.token);
    loginForm.reset();
    await showDashboard();
  } catch (error) { setFeedback(loginFeedback, error.message, true); }
  finally { submit.disabled = false; }
});

document.querySelectorAll('[data-view-target]').forEach((button) => button.addEventListener('click', () => selectView(button.dataset.viewTarget)));
document.querySelector('#message-filter').addEventListener('change', renderMessages);
document.querySelector('#add-project').addEventListener('click', () => openEditor('project'));
document.querySelector('#add-skill').addEventListener('click', () => openEditor('skill'));
document.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));

editorForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(editorForm).entries());
  const fields = state.editorType === 'project' ? projectFields : skillFields;
  fields.filter((field) => field.type === 'checkbox').forEach((field) => { data[field.key] = editorForm.elements[field.key].checked; });
  fields.filter((field) => field.type === 'number').forEach((field) => { data[field.key] = Number(data[field.key]) || 0; });
  if (state.editorType === 'project') data.technologies = (data.technologies || '').split(',').map((name) => name.trim()).filter(Boolean);
  if (state.editingId) data._id = state.editingId;
  if (state.editorType === 'project') await saveProject(data);
  else await saveSkill(data);
});

document.querySelector('#signout-button').addEventListener('click', async () => {
  try { await request('/auth/logout', { method: 'POST' }); } catch { /* Expired sessions can still sign out locally. */ }
  sessionStorage.removeItem(tokenKey);
  adminShell.hidden = true;
  loginShell.hidden = false;
  setFeedback(loginFeedback, 'Signed out.');
});

if (sessionStorage.getItem(tokenKey)) showDashboard();
else if (!apiBase) setFeedback(loginFeedback, 'SETUP REQUIRED: Set API_BASE_URL in config.js.', true);
