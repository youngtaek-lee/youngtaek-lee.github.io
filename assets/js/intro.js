// =============================
// Intro — 수리검 드로잉 → 줌 → 뚫기
// =============================
function initIntro() {
  const intro    = document.getElementById('intro');
  const path     = intro ? intro.querySelector('.intro__path') : null;
  const shuriken = intro ? intro.querySelector('.intro__shuriken') : null;
  if (!intro || !path || !shuriken) return;

  document.body.style.overflow = 'hidden';

  // Stroke animation setup
  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;

  gsap.timeline({
    onComplete() {
      intro.remove();
      document.body.style.overflow = '';
      initHeroEntrance();
    },
  })
    // 1. 수리검 선 드로잉
    .to(path, {
      strokeDashoffset: 0,
      duration: 1.4,
      ease: 'power2.inOut',
    })
    // 2. 채우기
    .to(path, {
      fill: '#fff',
      stroke: 'none',
      duration: 0.3,
      ease: 'power2.out',
    }, '-=0.1')
    // 3. 클로즈업 (줌인)
    .to(shuriken, {
      scale: 30,
      duration: 0.75,
      ease: 'power3.in',
    })
    // 4. 뚫기 (인트로 사라짐)
    .to(intro, {
      clipPath: 'circle(0% at 50% 50%)',
      duration: 0.45,
      ease: 'power4.in',
    }, '-=0.4');
}
