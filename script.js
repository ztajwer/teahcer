const isPhone = window.matchMedia('(max-width: 700px)').matches;
const splash = document.querySelector('#splash');
const enterButton = document.querySelector('#enter-button');
const audio = document.querySelector('#bg-audio');
const musicToggle = document.querySelector('#music-toggle');
const musicLabel = document.querySelector('#music-label');
const canvas = document.querySelector('#confetti-canvas');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let particles = [];
let animationFrame = null;
let audioStarted = false;
let audioStartPromise = null;
let canvasContext = null;
let gallerySwitchTimer = 0;

function setMusicState(playing) {
  musicToggle?.classList.toggle('is-muted', !playing);
  musicToggle?.setAttribute('aria-pressed', String(playing));
  if (musicLabel) musicLabel.textContent = playing ? 'music on' : 'music off';
}

function startMusic() {
  if (!audio) return;
  if (audioStartPromise) return;
  if (!audio.paused) {
    setMusicState(true);
    return;
  }
  audio.loop = true;
  audio.volume = 0.34;
  const promise = audio.play();
  if (promise?.then) {
    audioStartPromise = promise;
    promise.then(() => {
      audioStarted = true;
      audioStartPromise = null;
      setMusicState(true);
    }).catch(() => {
      audioStartPromise = null;
      setMusicState(false);
    });
  } else {
    audioStarted = true;
    setMusicState(true);
  }
}

function enterExperience() {
  if (!isPhone) return;
  document.body.classList.add('is-ready');
  splash?.classList.add('is-hidden');
  startMusic();
  burstConfetti(48, window.innerWidth / 2, window.innerHeight * .2);
}

enterButton?.addEventListener('click', enterExperience);
setMusicState(false);

musicToggle?.addEventListener('click', () => {
  if (!audioStarted || audio.paused) startMusic();
  else { audio.pause(); setMusicState(false); }
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && audioStarted && audio.paused) startMusic();
});

document.querySelector('#scroll-letter')?.addEventListener('click', () => {
  document.querySelector('#letter')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  burstConfetti(20, window.innerWidth * .48, window.innerHeight * .3);
});

const letterBox = document.querySelector('#letter-box');
const letterOpen = document.querySelector('#letter-open');
const letterCaption = document.querySelector('#letter-caption');
letterOpen?.addEventListener('click', () => {
  const open = letterBox.classList.toggle('is-open');
  letterOpen.setAttribute('aria-expanded', String(open));
  letterOpen.querySelector('span').textContent = open ? 'tap to fold' : 'tap to unfold';
  letterCaption.textContent = open ? 'A few words we hope you keep close.' : 'A note for the teacher who leaves light behind.';
  if (open) burstConfetti(34, window.innerWidth * .5, window.innerHeight * .5);
});

const galleryItems = [
  { image: 'assets/optimized/teacher-look-1.webp', kicker: 'THE PRESENCE', title: 'Walk in like<br /><em>you belong.</em>', note: 'The kind of calm confidence that makes everyone around you stand a little taller.', alt: 'Muhammad Tayyab Bashir in a cream blazer' },
  { image: 'assets/optimized/teacher-smile.webp', kicker: 'THE WARMTH', title: 'Leave a little<br /><em>light everywhere.</em>', note: 'The smile, the welcome, the energy that makes learning feel human.', alt: 'Muhammad Tayyab Bashir smiling in a warm shirt' },
  { image: 'assets/optimized/teacher-strength.webp', kicker: 'THE DISCIPLINE', title: 'Strong enough<br /><em>to keep going.</em>', note: 'You show us that consistency is its own kind of superpower.', alt: 'Muhammad Tayyab Bashir at the gym' },
  { image: 'assets/optimized/teacher-outdoor.webp', kicker: 'THE ADVENTURE', title: 'Keep finding<br /><em>new views.</em>', note: 'There is always another horizon when you teach us to stay curious.', alt: 'Muhammad Tayyab Bashir outdoors' },
  { image: 'assets/optimized/teacher-look-2.webp', kicker: 'THE JOY', title: 'Make room for<br /><em>the good stuff.</em>', note: 'Because the best kind of success still leaves room for a real smile.', alt: 'Muhammad Tayyab Bashir taking a selfie' },
  { image: 'assets/optimized/teacher-look-3.webp', kicker: 'THE EXAMPLE', title: 'Show up as<br /><em>your best self.</em>', note: 'Not by being perfect — by being present, prepared, and real.', alt: 'Muhammad Tayyab Bashir beside a pool' },
  { image: 'assets/optimized/teacher-fitverse.webp', kicker: 'THE BUILDER', title: 'Build it with<br /><em>your whole heart.</em>', note: 'You bring the same focus to every room, every goal, every person.', alt: 'Muhammad Tayyab Bashir at FitVerse' },
  { image: 'assets/optimized/teacher-look-5.webp', kicker: 'THE FIGHT', title: 'Believe in<br /><em>miracles.</em>', note: 'And then put in the work that gives them somewhere to land.', alt: 'Muhammad Tayyab Bashir training at the gym' },
  { image: 'assets/optimized/must-award.webp', kicker: 'THE MOMENT', title: 'Celebrate the<br /><em>wins.</em>', note: 'Because you have a way of turning hard work into a room full of possibility.', alt: 'Muhammad Tayyab Bashir receiving an award' },
  { image: 'assets/optimized/must-panel.webp', kicker: 'THE ROOM', title: 'Make the room<br /><em>braver.</em>', note: 'You don’t need a stage to make people listen. You bring your own light.', alt: 'Muhammad Tayyab Bashir presenting to a panel' },
  { image: 'assets/optimized/must-present.webp', kicker: 'THE VOICE', title: 'Speak with<br /><em>purpose.</em>', note: 'The kind of clarity that makes good ideas land.', alt: 'Muhammad Tayyab Bashir speaking at an event' },
];
let galleryIndex = 0;
const galleryStage = document.querySelector('#gallery-stage');
const galleryImage = document.querySelector('#gallery-main');
const galleryCurrent = document.querySelector('#gallery-current');
const gallerySticker = document.querySelector('#gallery-sticker');
const galleryKicker = document.querySelector('#gallery-kicker');
const galleryTitle = document.querySelector('#gallery-title');
const galleryNote = document.querySelector('#gallery-note');
const galleryThumbs = [...document.querySelectorAll('.gallery-thumb')];

function preloadGalleryItem(index) {
  const item = galleryItems[(index + galleryItems.length) % galleryItems.length];
  const image = new Image();
  image.decoding = 'async';
  image.src = item.image;
}

function showGallery(index) {
  galleryIndex = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[galleryIndex];
  galleryStage?.classList.add('is-switching');
  window.clearTimeout(gallerySwitchTimer);
  gallerySwitchTimer = window.setTimeout(() => {
    if (galleryImage) { galleryImage.src = item.image; galleryImage.alt = item.alt; }
    if (galleryCurrent) galleryCurrent.textContent = String(galleryIndex + 1).padStart(2, '0');
    if (gallerySticker) gallerySticker.textContent = item.kicker;
    if (galleryKicker) galleryKicker.textContent = item.kicker;
    if (galleryTitle) galleryTitle.innerHTML = item.title;
    if (galleryNote) galleryNote.textContent = item.note;
    galleryStage?.classList.remove('is-switching');
  }, 170);
  preloadGalleryItem(galleryIndex + 1);
  galleryThumbs.forEach((thumb, thumbIndex) => thumb.classList.toggle('is-active', thumbIndex === galleryIndex));
  const thumbsContainer = galleryThumbs[galleryIndex]?.parentElement;
  const activeThumb = galleryThumbs[galleryIndex];
  if (thumbsContainer && activeThumb) thumbsContainer.scrollTo({ left: activeThumb.offsetLeft - (thumbsContainer.clientWidth / 2) + (activeThumb.offsetWidth / 2), behavior: 'smooth' });
}

document.querySelector('#gallery-prev')?.addEventListener('click', () => showGallery(galleryIndex - 1));
document.querySelector('#gallery-next')?.addEventListener('click', () => showGallery(galleryIndex + 1));
galleryThumbs.forEach((thumb) => thumb.addEventListener('click', () => showGallery(Number(thumb.dataset.index))));

let touchStart = 0;
galleryStage?.addEventListener('touchstart', (event) => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
galleryStage?.addEventListener('touchend', (event) => {
  const distance = event.changedTouches[0].clientX - touchStart;
  if (Math.abs(distance) > 35) showGallery(distance < 0 ? galleryIndex + 1 : galleryIndex - 1);
}, { passive: true });

document.querySelectorAll('.orbit-star').forEach((star) => {
  star.addEventListener('click', () => {
    const message = document.querySelector('#star-message');
    if (message) message.textContent = star.dataset.message;
    burstConfetti(20, star.getBoundingClientRect().left + 12, star.getBoundingClientRect().top + 12);
    star.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.45)' }, { transform: 'scale(1)' }], { duration: 420, easing: 'ease-out' });
  });
});

const pinnedNote = document.querySelector('#pinned-text');
document.querySelectorAll('.lesson-card').forEach((card, index) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.lesson-card').forEach((item) => item.classList.remove('is-pinned'));
    card.classList.add('is-pinned');
    if (pinnedNote) pinnedNote.textContent = ['Keep moving — it is already part of you.', 'Take responsibility — your future is yours to build.', 'Believe in miracles — then make one happen.'][index];
    burstConfetti(18, card.getBoundingClientRect().left + card.offsetWidth / 2, card.getBoundingClientRect().top + 30);
  });
});

document.querySelector('#celebrate-button')?.addEventListener('click', () => {
  burstConfetti(140, window.innerWidth / 2, window.innerHeight * .4);
  document.querySelector('#celebrate-button span').textContent = 'Gratitude delivered ✦';
  document.querySelector('#celebrate-button').animate([{ transform: 'scale(1)' }, { transform: 'scale(.94)' }, { transform: 'scale(1)' }], { duration: 380 });
});

const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxCaption = document.querySelector('#lightbox-caption');
const closeLightbox = () => {
  lightbox?.classList.remove('is-open');
  lightbox?.setAttribute('aria-hidden', 'true');
};
document.querySelectorAll('[data-lightbox]').forEach((card) => {
  card.addEventListener('click', () => {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;
    lightboxImage.src = card.dataset.lightbox;
    lightboxImage.alt = card.querySelector('img')?.alt || 'Teacher’s Day memory';
    lightboxCaption.textContent = card.dataset.caption || 'A memory worth keeping.';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  });
});
document.querySelector('#lightbox-close')?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); }), { threshold: .12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const sectionLinks = [...document.querySelectorAll('.bottom-nav a')];
const navSections = sectionLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
const navObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (!entry.isIntersecting) return;
  sectionLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}` || (entry.target.id === 'top' && link.getAttribute('href') === '#top')));
}), { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
navSections.forEach((section) => navObserver.observe(section));

function setupCanvas() {
  if (!canvas || !isPhone) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  canvasContext = canvasContext || canvas.getContext('2d');
  canvasContext?.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function burstConfetti(amount, originX, originY) {
  if (!isPhone || !canvas || reducedMotion) return;
  if (!canvasContext) setupCanvas();
  if (!canvasContext) return;
  const colors = ['#f5681e', '#ffad68', '#ffd4ae', '#201a17', '#fff9f1', '#db4c12'];
  for (let i = 0; i < amount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const power = 3 + Math.random() * 8;
    particles.push({ x: originX, y: originY, vx: Math.cos(angle) * power, vy: Math.sin(angle) * power - 4, gravity: .16 + Math.random() * .11, drag: .985, size: 4 + Math.random() * 6, rotation: Math.random() * Math.PI, rotationSpeed: (Math.random() - .5) * .24, color: colors[Math.floor(Math.random() * colors.length)], life: 1 });
  }
  if (particles.length > 220) particles = particles.slice(-220);
  if (!animationFrame) animateConfetti();
}

function animateConfetti() {
  const context = canvasContext;
  if (!context) return;
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles = particles.filter((particle) => particle.life > 0 && particle.y < window.innerHeight + 45);
  particles.forEach((particle) => {
    particle.vx *= particle.drag; particle.vy += particle.gravity; particle.x += particle.vx; particle.y += particle.vy; particle.rotation += particle.rotationSpeed; particle.life -= .009;
    context.save(); context.globalAlpha = Math.max(particle.life, 0); context.translate(particle.x, particle.y); context.rotate(particle.rotation); context.fillStyle = particle.color; context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * .65); context.restore();
  });
  if (particles.length) animationFrame = requestAnimationFrame(animateConfetti);
  else { cancelAnimationFrame(animationFrame); animationFrame = null; }
}

if (isPhone) window.addEventListener('resize', setupCanvas, { passive: true });
