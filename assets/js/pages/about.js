const PageAbout = {
  render() {
    return `
      <div class="subpage about-page">

        <section class="subpage__hero">
          <p class="subpage__label">About</p>
          <h1 class="subpage__title">Lee Youngtaek<br>Web UI Publisher</h1>
        </section>

        <section class="subpage__section about-intro">
          <div class="about-intro__text">
            <p>웹 퍼블리셔 이영택입니다.<br>디자인의 언어를 코드로 번역하며,<br>시각적 완성도와 정확한 구현을 추구합니다.</p>
          </div>
        </section>

        <section class="subpage__section about-process" id="process">
          <h2 class="subpage__section-title">Process</h2>
          <ol class="process-list">
            <li class="process-item">
              <span class="process-item__num">01</span>
              <div>
                <h3 class="process-item__title">기획 & 분석</h3>
                <p class="process-item__desc">디자인 의도와 사용자 흐름을 파악하고 구조를 잡습니다.</p>
              </div>
            </li>
            <li class="process-item">
              <span class="process-item__num">02</span>
              <div>
                <h3 class="process-item__title">마크업 & 스타일링</h3>
                <p class="process-item__desc">시맨틱한 HTML과 유지보수 가능한 CSS로 구현합니다.</p>
              </div>
            </li>
            <li class="process-item">
              <span class="process-item__num">03</span>
              <div>
                <h3 class="process-item__title">인터랙션 & 애니메이션</h3>
                <p class="process-item__desc">GSAP 기반의 자연스러운 인터랙션을 입힙니다.</p>
              </div>
            </li>
            <li class="process-item">
              <span class="process-item__num">04</span>
              <div>
                <h3 class="process-item__title">QA & 배포</h3>
                <p class="process-item__desc">크로스브라우저 확인, 성능 점검 후 배포합니다.</p>
              </div>
            </li>
          </ol>
        </section>

        <section class="subpage__section about-skills" id="skills">
          <h2 class="subpage__section-title">Skills</h2>
          <div class="skills-tags">
            ${['HTML5', 'CSS3', 'JavaScript', 'jQuery', 'GSAP', 'Three.js', 'Git', 'Figma', 'Photoshop', 'Illustrator']
              .map(s => `<span class="skill-tag">${s}</span>`).join('')}
          </div>
        </section>

      </div>
    `;
  },

  init() {
    gsap.from('.subpage__title', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out' });
    gsap.from('.subpage__label', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' });
    gsap.from('.about-intro__text', { y: 30, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power2.out' });

    gsap.from('.process-item', {
      y: 40, opacity: 0, duration: 0.7, ease: 'power2.out',
      stagger: 0.1,
      scrollTrigger: { trigger: '.about-process', start: 'top 75%' },
    });

    gsap.from('.skill-tag', {
      y: 20, opacity: 0, duration: 0.5, ease: 'power2.out',
      stagger: 0.05,
      scrollTrigger: { trigger: '.about-skills', start: 'top 80%' },
    });
  },
};
