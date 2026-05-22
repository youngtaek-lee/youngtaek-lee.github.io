const PageAbout = {
  render() {
    return `
      <div class="subpage about-page">

<section class="subpage__section about-intro">
          <div class="about-intro__text">
            <p>안녕하세요, 이영택입니다.<br>웹퍼블리셔로 일하며 디자인과 코드 사이 어딘가에 서 있습니다.<br>시각적인 것을 정확하게 구현하는 데 집착하고,<br>요즘은 그 경계를 허물며 프론트엔드 개발자로 영역을 넓혀가는 중입니다.<br>같이 만들어보고 싶은 게 있다면 연락주세요.</p>
          </div>
        </section>

        <section class="subpage__section about-process" id="process">
          <h2 class="subpage__section-title">Work Process</h2>
          <div class="process-cards">

            <div class="process-card">
              <span class="process-card__num">01</span>
              <div class="process-card__icon">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse class="pc-eye" cx="24" cy="24" rx="20" ry="11" stroke="currentColor" stroke-width="1.5"/>
                  <circle class="pc-iris" cx="24" cy="24" r="5" stroke="currentColor" stroke-width="1.5"/>
                  <circle cx="24" cy="24" r="2" fill="currentColor"/>
                  <line class="pc-scan" x1="4" y1="24" x2="44" y2="24" stroke="var(--color-accent)" stroke-width="1" stroke-dasharray="4 3"/>
                </svg>
              </div>
              <h3 class="process-card__title">디자인 해석</h3>
              <p class="process-card__desc">디자이너의 의도를 파악하고 구현 가능한 구조로 분석합니다.</p>
            </div>

            <div class="process-card">
              <span class="process-card__num">02</span>
              <div class="process-card__icon">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline class="pc-bracket-l" points="18,10 8,24 18,38" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline class="pc-bracket-r" points="30,10 40,24 30,38" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <line class="pc-slash" x1="27" y1="12" x2="21" y2="36" stroke="var(--color-accent)" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <h3 class="process-card__title">마크업 & 스타일링</h3>
              <p class="process-card__desc">시맨틱한 HTML과 유지보수 가능한 CSS로 화면을 구현합니다.</p>
            </div>

            <div class="process-card">
              <span class="process-card__num">03</span>
              <div class="process-card__icon">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path class="pc-cursor" d="M14 10 L14 34 L20 28 L24 38 L27 37 L23 27 L31 27 Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                  <circle class="pc-ripple1" cx="31" cy="20" r="5" stroke="var(--color-accent)" stroke-width="1"/>
                  <circle class="pc-ripple2" cx="31" cy="20" r="9" stroke="var(--color-accent)" stroke-width="0.8"/>
                </svg>
              </div>
              <h3 class="process-card__title">인터랙션 & QA</h3>
              <p class="process-card__desc">GSAP 기반 애니메이션과 크로스브라우징 검수를 진행합니다.</p>
            </div>

            <div class="process-card">
              <span class="process-card__num">04</span>
              <div class="process-card__icon">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="5" stroke="currentColor" stroke-width="1.5"/>
                  <path class="pc-gear" d="M24 8v4M24 36v4M8 24h4M36 24h4M12.7 12.7l2.8 2.8M32.5 32.5l2.8 2.8M35.3 12.7l-2.8 2.8M15.5 32.5l-2.8 2.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <circle class="pc-gear-ring" cx="24" cy="24" r="11" stroke="var(--color-accent)" stroke-width="1" stroke-dasharray="3 2"/>
                </svg>
              </div>
              <h3 class="process-card__title">유지보수</h3>
              <p class="process-card__desc">버그 수정, 브라우저 업데이트 대응, 성능 개선을 지속합니다.</p>
            </div>

          </div>
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
    gsap.from('.about-intro__text', { y: 30, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power2.out' });

    gsap.from('.process-card', {
      y: 40, opacity: 0, duration: 0.7, ease: 'power2.out',
      stagger: 0.12,
      scrollTrigger: { trigger: '.about-process', start: 'top 75%' },
    });

    gsap.from('.skill-tag', {
      y: 20, opacity: 0, duration: 0.5, ease: 'power2.out',
      stagger: 0.05,
      scrollTrigger: { trigger: '.about-skills', start: 'top 80%' },
    });
  },
};
