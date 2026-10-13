// Front-end auth demo. Users live in localStorage; passwords are salted + SHA-256 hashed.
// NOTE: client-side auth is for learning only, never use it to protect real data.
const USERS = 'oibsip-users', SESSION = 'oibsip-session', STARTED = 'oibsip-session-start';

const getUsers = () => { try { return JSON.parse(localStorage.getItem(USERS)) || {}; } catch { return {}; } };
const setUsers = u => localStorage.setItem(USERS, JSON.stringify(u));
const hex = bytes => [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
const newSalt = () => hex(crypto.getRandomValues(new Uint8Array(16)));
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return hex(new Uint8Array(buf));
}
const fmt = ts => new Date(ts).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

function show(el, text, type) { el.textContent = text; el.className = 'msg ' + type; }
function fail(msg, text) {
  show(msg, text, 'err');
  const card = document.getElementById('card');
  card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
}
const HASH_HELP = 'Could not secure your password. Open this project with Live Server (localhost) and try again.';

// Show / hide password buttons
document.querySelectorAll('[data-toggle]').forEach(btn =>
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.toggle);
    const reveal = input.type === 'password';
    input.type = reveal ? 'text' : 'password';
    btn.textContent = reveal ? 'Hide' : 'Show';
  }));

const page = document.body.dataset.page;

if (page === 'register') {
  const form = document.getElementById('form'), msg = document.getElementById('msg');
  const meter = document.getElementById('meter'), label = document.getElementById('meterLabel');
  const ruleLen = document.getElementById('ruleLen'), ruleNum = document.getElementById('ruleNum');

  form.pw.addEventListener('input', () => {
    const pw = form.pw.value;
    const len = pw.length >= 8, num = /\d/.test(pw);
    ruleLen.classList.toggle('ok', len);
    ruleNum.classList.toggle('ok', num);
    const score = (len ? 1 : 0) + (num ? 1 : 0) + (/[A-Z]/.test(pw) && /[a-z]/.test(pw) ? 1 : 0) + (/[^A-Za-z0-9]/.test(pw) ? 1 : 0);
    const level = pw ? [['Weak', '#e5484d', 25], ['Weak', '#e5484d', 25], ['Okay', '#f5a524', 55], ['Good', '#3ab38a', 80], ['Strong', '#17855a', 100]][score] : ['Strength', '#dfe3ee', 0];
    meter.style.width = level[2] + '%'; meter.style.background = level[1]; label.textContent = level[0];
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const user = form.user.value.trim().toLowerCase(), pw = form.pw.value;
    if (!user || !pw) return fail(msg, 'Fill in both fields.');
    if (pw.length < 8 || !/\d/.test(pw)) return fail(msg, 'Password needs 8+ characters and at least 1 number.');
    const users = getUsers();
    if (users[user]) return fail(msg, 'That username is already taken.');
    try {
      const salt = newSalt();
      users[user] = { salt, hash: await sha256(salt + pw), created: Date.now() };
      setUsers(users);
    } catch { return fail(msg, HASH_HELP); }
    show(msg, 'Account created. Redirecting to login...', 'ok');
    document.getElementById('submitBtn').disabled = true;
    setTimeout(() => location.href = 'index.html', 1000);
  });
}

if (page === 'login') {
  if (sessionStorage.getItem(SESSION)) location.replace('dashboard.html'); // already signed in
  const form = document.getElementById('form'), msg = document.getElementById('msg');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const user = form.user.value.trim().toLowerCase(), pw = form.pw.value;
    if (!user || !pw) return fail(msg, 'Fill in both fields.');
    let ok = false;
    try {
      const rec = getUsers()[user];
      ok = !!rec && (await sha256(rec.salt + pw)) === rec.hash;
    } catch { return fail(msg, HASH_HELP); }
    // Same message whether the username or the password is wrong.
    if (!ok) return fail(msg, 'Incorrect username or password.');
    sessionStorage.setItem(SESSION, user);
    sessionStorage.setItem(STARTED, Date.now());
    location.href = 'dashboard.html';
  });
}

if (page === 'dashboard') {
  const user = sessionStorage.getItem(SESSION);
  if (!user) {
    location.replace('index.html'); // protected page
  } else {
    const rec = getUsers()[user] || {};
    document.getElementById('who').textContent = user;
    document.getElementById('avatar').textContent = user[0];
    document.getElementById('hello').textContent = 'Welcome, ' + user + '!';
    document.getElementById('since').textContent = rec.created ? fmt(rec.created) : '-';
    document.getElementById('loginTime').textContent = fmt(Number(sessionStorage.getItem(STARTED)) || Date.now());
    document.body.classList.remove('locked');
  }
  document.getElementById('logout').addEventListener('click', () => {
    sessionStorage.removeItem(SESSION);
    sessionStorage.removeItem(STARTED);
    location.replace('index.html');
  });
}
