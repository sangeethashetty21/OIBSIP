// Optional enhancements: portrait fallback, scroll-reveal, back-to-top.
const img = document.getElementById('portrait');
if (img.complete && img.naturalWidth === 0) img.remove();
img.addEventListener('error', () => img.remove()); // show the monogram if kalam.jpg is missing

const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => toTop.classList.toggle('show', window.scrollY > 500));
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
