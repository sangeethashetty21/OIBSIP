// Calculator logic: no eval(), left-to-right operator chaining.
const out = document.getElementById('out');
const expr = document.getElementById('expr');
let current = '0', prev = null, op = null, fresh = false, error = false;

function fmt(n) { return String(parseFloat(Number(n).toFixed(10))); }

function render() {
  out.textContent = current;
  expr.textContent = prev !== null && op ? fmt(prev) + ' ' + op : '';
}

function compute(a, b, o) {
  switch (o) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? null : a / b;
  }
}

function clearAll() { current = '0'; prev = null; op = null; fresh = false; error = false; }

function setError() { current = 'Error: ÷ by 0'; prev = null; op = null; error = true; }

function digit(d) {
  if (error) clearAll();
  if (fresh || current === '0') { current = d; fresh = false; }
  else if (current.replace(/[-.]/g, '').length < 12) current += d;
}

function decimal() {
  if (error) clearAll();
  if (fresh) { current = '0.'; fresh = false; return; }
  if (!current.includes('.')) current += '.';
}

function operator(o) {
  if (error) return;
  if (op && !fresh) {
    const r = compute(prev, parseFloat(current), op);
    if (r === null) return setError();
    prev = r; current = fmt(r);
  } else if (!op) {
    prev = parseFloat(current);
  }
  op = o; fresh = true;
}

function equals() {
  if (error || !op || prev === null) return;
  const r = compute(prev, parseFloat(current), op);
  if (r === null) return setError();
  current = fmt(r); prev = null; op = null; fresh = true;
}

function backspace() {
  if (error) return clearAll();
  if (fresh) return;
  current = current.slice(0, -1);
  if (current === '' || current === '-') current = '0';
}

function handle(key) {
  if (/^[0-9]$/.test(key)) digit(key);
  else if (key === '.') decimal();
  else if (key === 'C') clearAll();
  else if (key === 'back') backspace();
  else if (key === '=') equals();
  else operator(key);
  render();
}

document.querySelectorAll('.keys button').forEach(btn =>
  btn.addEventListener('click', () => handle(btn.dataset.key)));

// Keyboard support
const keyMap = { '*': '×', '/': '÷', '-': '−', Enter: '=', Backspace: 'back', Escape: 'C', c: 'C', C: 'C' };
document.addEventListener('keydown', e => {
  if (calcWrap.classList.contains('hidden')) return; // keyboard only works on the calculator screen
  const k = keyMap[e.key] || e.key;
  if (/^[0-9.+=−×÷]$/.test(k) || ['back', 'C'].includes(k)) { e.preventDefault(); handle(k); }
});
render();

// Welcome screen <-> calculator
const welcome = document.getElementById('welcome');
const calcWrap = document.getElementById('calcWrap');
document.getElementById('openBtn').addEventListener('click', () => {
  welcome.classList.add('hidden');
  calcWrap.classList.remove('hidden');
});
document.getElementById('homeBtn').addEventListener('click', () => {
  calcWrap.classList.add('hidden');
  welcome.classList.remove('hidden');
});
