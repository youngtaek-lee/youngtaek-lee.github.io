// =============================
// Intro — 스파클 → 인트로 UP + 메인 딸려올라옴
// =============================
function initIntro() {
  const intro  = document.getElementById('intro');
  const wrap   = document.getElementById('introSparkle');
  const gray   = intro ? intro.querySelector('.intro__sparkle--gray')   : null;
  const orange = intro ? intro.querySelector('.intro__sparkle--orange') : null;
  if (!intro || !wrap || !gray || !orange) {
    initHeroEntrance();
    return;
  }

  document.body.style.overflow = 'hidden';

  // 오렌지 트레일 레이어 — 인트로 바로 뒤에서 살짝 늦게 따라올라감
  const trail = document.createElement('div');
  trail.style.cssText = 'position:fixed;inset:0;background:var(--basic-orange);z-index:99989;pointer-events:none;';
  document.body.appendChild(trail);

  // hero-wrap은 ScrollTrigger trigger라 건드리지 않고, 내부 .hero(section)만 이동
  // intro가 fixed로 덮여있어 클립 없어도 됨
  const heroSection = document.querySelector('.hero');
  if (heroSection) gsap.set(heroSection, { y: 160, opacity: 0 });

  const tl = gsap.timeline();
  tl.to(gray,   { opacity: 1, duration: 0.5, ease: 'power2.inOut' })
    .to(orange,  { clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'power2.inOut' }, '+=0.15')
    .to(intro,   { y: '-100%', duration: 1.2, ease: 'power3.inOut',
        onStart: () => { window.__onIntroComplete?.(); window.__onIntroComplete = null; },
        onComplete: () => intro.remove() }, '+=0.2')
    .to(trail,   { y: '-100%', duration: 1.2, ease: 'power3.inOut',
        onComplete: () => trail.remove() }, '<+=0.15');

  if (heroSection) tl.to(heroSection, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.inOut' }, '<-0.15');

  tl.call(() => {
    document.body.style.overflow = '';
    initHeroEntrance();
  });
}
