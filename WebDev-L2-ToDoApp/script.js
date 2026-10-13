// To-Do app: add, complete, edit inline, delete, counts, timestamps, localStorage.
const KEY = 'oibsip-todo-tasks';
let tasks = load();
let editingId = null;

const form = document.getElementById('addForm');
const input = document.getElementById('taskInput');
const pendingList = document.getElementById('pendingList');
const doneList = document.getElementById('doneList');

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch {}
}
const stamp = ts => new Date(ts).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

function addTask(text) {
  tasks.unshift({ id: Date.now(), text, done: false, added: Date.now(), completed: null });
  save(); render();
}
function toggle(id) {
  const t = tasks.find(t => t.id === id);
  t.done = !t.done;
  t.completed = t.done ? Date.now() : null;
  save(); render();
}
function remove(id) { tasks = tasks.filter(t => t.id !== id); save(); render(); }
function saveEdit(id, value) {
  const v = value.trim();
  if (v) tasks.find(t => t.id === id).text = v;
  editingId = null; save(); render();
}

function makeItem(t) {
  const li = document.createElement('li');
  li.className = 'item' + (t.done ? ' done' : '');

  const cb = document.createElement('input');
  cb.type = 'checkbox'; cb.checked = t.done;
  cb.setAttribute('aria-label', 'Mark complete');
  cb.addEventListener('change', () => toggle(t.id));

  const body = document.createElement('div');
  body.className = 'body';
  if (editingId === t.id) {
    const ei = document.createElement('input');
    ei.className = 'edit-input'; ei.value = t.text; ei.maxLength = 120;
    ei.addEventListener('keydown', e => {
      if (e.key === 'Enter') saveEdit(t.id, ei.value);
      if (e.key === 'Escape') { editingId = null; render(); }
    });
    body.append(ei);
    setTimeout(() => ei.focus(), 0);
  } else {
    const span = document.createElement('span');
    span.className = 'text'; span.textContent = t.text;
    const time = document.createElement('time');
    time.textContent = 'Added ' + stamp(t.added) + (t.completed ? ' · Completed ' + stamp(t.completed) : '');
    body.append(span, time);
  }

  const actions = document.createElement('div');
  actions.className = 'actions';
  const edit = document.createElement('button');
  edit.className = 'ghost';
  edit.textContent = editingId === t.id ? 'Save' : 'Edit';
  edit.addEventListener('click', () => {
    if (editingId === t.id) saveEdit(t.id, body.querySelector('input').value);
    else { editingId = t.id; render(); }
  });
  const del = document.createElement('button');
  del.className = 'del'; del.textContent = 'Delete';
  del.addEventListener('click', () => remove(t.id));
  actions.append(edit, del);

  li.append(cb, body, actions);
  return li;
}

function fill(list, items, emptyMsg) {
  list.replaceChildren();
  if (!items.length) {
    const li = document.createElement('li');
    li.className = 'empty'; li.textContent = emptyMsg;
    list.append(li);
    return;
  }
  items.forEach(t => list.append(makeItem(t)));
}

function render() {
  const pending = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);
  document.getElementById('pendingCount').textContent = pending.length + ' pending';
  document.getElementById('doneCount').textContent = done.length + ' completed';
  const pct = tasks.length ? Math.round(done.length / tasks.length * 100) : 0;
  document.getElementById('bar').style.width = pct + '%';
  document.getElementById('progressText').textContent = pct + '% done';
  document.getElementById('clearDone').hidden = done.length === 0;
  fill(pendingList, pending, 'Nothing pending. Add a task above to get started.');
  fill(doneList, done, 'No completed tasks yet. Tick one off when you finish it.');
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const v = input.value.trim();
  if (!v) return;
  addTask(v);
  input.value = '';
  input.focus();
});
render();

// Date header + clear completed
document.getElementById('today').textContent =
  new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
document.getElementById('clearDone').addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done); save(); render();
});

// Welcome screen <-> app
const welcome = document.getElementById('welcome');
const appBox = document.getElementById('app');
document.getElementById('startBtn').addEventListener('click', () => {
  welcome.classList.add('hidden');
  appBox.classList.remove('hidden');
  document.getElementById('taskInput').focus();
});
document.getElementById('homeBtn').addEventListener('click', () => {
  appBox.classList.add('hidden');
  welcome.classList.remove('hidden');
});