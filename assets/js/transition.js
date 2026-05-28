// =============================
// Page Transition — 촤르륵
// =============================
function initPageTransition() {
  const panel = document.createElement('div');
  panel.className = 'page-transition';
  const trail = document.createElement('div');
  trail.className = 'page-transition__trail';
  document.body.append(panel, trail);
}

function playPageTransition(onMid, onReveal) {
  const panel = document.querySelector('.page-transition');
  const trail = document.querySelector('.page-transition__trail');
  if (!panel || !trail) { onMid(); onReveal?.(); return; }

  gsap.set([panel, trail], { y: '100%' });

  gsap.timeline()
    .to(panel, { y: '0%', duration: 0.65, ease: 'power3.inOut' })
    .to(trail, { y: '0%', duration: 0.65, ease: 'power3.inOut' }, 0.1)
    .call(onMid, null, 0.75)
    .to(panel, { y: '-100%', duration: 1.0, ease: 'power3.inOut' }, 0.85)
    .to(trail, { y: '-100%', duration: 1.0, ease: 'power3.inOut' }, 1.0)
    .call(() => onReveal?.(), null, 1.85);
}
