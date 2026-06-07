async function buildGithubCalendar(el) {
  const CELL = 14, GAP = 3, STEP = 17, LABEL_H = 22;
  const COLORS = [
    'rgba(22,20,21,0.12)',
    'rgba(241,90,41,0.28)',
    'rgba(241,90,41,0.52)',
    'rgba(241,90,41,0.76)',
    '#F15A29',
  ];
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  el.innerHTML = '<div style="opacity:0.35;font-size:0.75rem;padding:8px 0">Loading...</div>';

  let contributions;
  try {
    const res = await fetch('https://github-contributions-api.jogruber.de/v4/youngtaek-lee');
    const json = await res.json();
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 1);
    contributions = json.contributions.filter(c => new Date(c.date + 'T00:00:00') >= cutoff);
    if (!contributions?.length) throw new Error();
  } catch {
    el.innerHTML = '<p style="opacity:0.4;font-size:0.8rem">데이터를 불러올 수 없습니다.</p>';
    return;
  }

  const weeks = [];
  let week = [];
  const startDow = new Date(contributions[0].date + 'T00:00:00').getDay();
  for (let i = 0; i < startDow; i++) week.push(null);
  for (const c of contributions) {
    week.push(c);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const monthLabels = [];
  let prevM = -1;
  weeks.forEach((w, wi) => {
    const real = w.find(Boolean);
    if (!real) return;
    const m = new Date(real.date + 'T00:00:00').getMonth();
    if (m !== prevM) { monthLabels.push({ x: wi * STEP, label: MONTHS[m] }); prevM = m; }
  });

  const W = weeks.length * STEP - GAP;
  const H = LABEL_H + 7 * STEP - GAP;
  const total = contributions.reduce((s, c) => s + c.count, 0);

  const rects = weeks.flatMap((w, wi) =>
    w.map((day, di) =>
      day ? `<rect x="${wi*STEP}" y="${LABEL_H+di*STEP}" width="${CELL}" height="${CELL}" fill="${COLORS[day.level]}" rx="2"/>` : ''
    )
  ).join('');

  const labels = monthLabels.map(({ x, label }) =>
    `<text x="${x}" y="0" dominant-baseline="hanging" font-size="10" fill="currentColor" opacity="0.5">${label}</text>`
  ).join('');

  const legendCells = COLORS.map(c =>
    `<span class="about-github__legend-cell" style="background:${c}"></span>`
  ).join('');

  el.innerHTML = `
    <div class="about-github__wrap">
      <svg viewBox="0 0 ${W} ${H}" style="display:block;width:100%;min-width:${W}px;height:auto">${labels}${rects}</svg>
    </div>
    <div class="about-github__footer">
      <span class="about-github__count">${total} contributions in the last year</span>
      <div class="about-github__legend">
        <span>Less</span>${legendCells}<span>More</span>
      </div>
    </div>
  `;

  gsap.from(el, { opacity: 0, y: 20, duration: 0.7, ease: 'power2.out' });

  requestAnimationFrame(() => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    window.__lenis?.resize();
  });
}

const PageAbout = {
  render() {
    return `
      <div class="subpage about-page">

        <section class="subpage__hero">
          <h1 class="subpage__title">Hello</h1>
          <div class="about-intro__text">
            <p>안녕하세요, 이영택입니다.<br>웹퍼블리셔로 일하며 디자인과 코드 사이 어딘가에 서 있습니다.<br>시각적인 것을 정확하게 구현하는 데 집착하고,<br>요즘은 그 경계를 허물며 프론트엔드 개발자로 영역을 넓혀가는 중입니다.<br>같이 만들어보고 싶은 게 있다면 연락주세요.</p>
          </div>
        </section>

        <section class="subpage__section about-process" id="process">
          <h2 class="subpage__section-title">Work Process</h2>
          <div class="ptl">

            <div class="ptl__header">
              <div>
                <span class="ptl__label">Web Publishing</span>
                <h3 class="ptl__title">How I work</h3>
              </div>
            </div>

            <div class="ptl__phases">
              <div class="ptl__phase">Review</div>
              <div class="ptl__phase">Build</div>
              <div class="ptl__phase">Collab</div>
            </div>

            <div class="ptl__chart">
              <div class="ptl__bar ptl__bar--1">
                <span class="ptl__bar-name">디자인 해석</span>
                <span class="ptl__bar-desc">시안 검토, 구조 파악, 에셋 정리</span>
              </div>
              <div class="ptl__bar ptl__bar--2">
                <span class="ptl__bar-name">마크업 & 퍼블리싱</span>
                <span class="ptl__bar-desc">HTML/CSS 구조화, 반응형 구현, 크로스브라우징</span>
              </div>
              <div class="ptl__bar ptl__bar--3">
                <span class="ptl__bar-name">인터랙션 & 개발 협업</span>
                <span class="ptl__bar-desc">GSAP 애니메이션, 컴포넌트 구조화, 개발자 소통 및 수정 대응</span>
              </div>
            </div>

            <div class="ptl__weeks">
              <span class="ptl__week">Phase 1</span>
              <span class="ptl__week">Phase 2</span>
              <span class="ptl__week">Phase 3</span>
              <span class="ptl__week">Phase 4</span>
              <span class="ptl__week">Phase 5</span>
              <span class="ptl__week">Phase 6</span>
            </div>

            <div class="ptl__footer">
              <svg class="ptl__footer-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M8 0L9.18 6.82L16 8L9.18 9.18L8 16L6.82 9.18L0 8L6.82 6.82L8 0Z" fill="currentColor"/>
              </svg>
              <p class="ptl__footer-text">
                45개 이상의 실무 프로젝트를 통해 정립된 웹 퍼블리싱 프로세스입니다.
              </p>
            </div>

          </div>
        </section>

        <section class="subpage__section about-skills" id="skills">
          <h2 class="subpage__section-title">Skills</h2>
          <div class="skills-tags">
            ${['HTML5','CSS3','JavaScript','jQuery','GSAP','Three.js','Git','Figma','Photoshop','Illustrator']
              .map(s => `<span class="skill-tag">${s}</span>`).join('')}
          </div>
        </section>

        <section class="subpage__section about-github" id="github">
          <h2 class="subpage__section-title">Commit Log</h2>
          <div class="about-github__card">
            <div class="about-github__header">
              <div>
                <span class="about-github__label">GitHub</span>
                <h3 class="about-github__card-title">Contributions</h3>
              </div>
              <a href="https://github.com/youngtaek-lee" target="_blank" rel="noopener" class="about-github__link" aria-label="GitHub 프로필">
                <img src="assets/images/github-icon.png" alt="GitHub" width="20" height="20">
              </a>
            </div>
            <div id="about-github-calendar"></div>
          </div>
        </section>

      </div>
    `;
  },

  init() {
    const titleEl = document.querySelector('.subpage__title');
    if (titleEl) {
      titleEl.innerHTML = titleEl.textContent.split('').map(ch =>
        `<span class="reveal-char"><span class="reveal-char__inner">${ch}</span></span>`
      ).join('');
      const chars = titleEl.querySelectorAll('.reveal-char__inner');
      gsap.from(chars, { yPercent: 110, duration: 0.7, ease: 'power3.out', stagger: 0.08 });
    }

    const introP = document.querySelector('.about-intro__text p');
    if (introP) {
      const CHUNK = 3;
      const nodes = Array.from(introP.childNodes);
      let html = '';
      let lineWords = [];

      const flushLine = () => {
        for (let i = 0; i < lineWords.length; i += CHUNK) {
          if (i > 0) html += ' ';
          html += `<span class="reveal-word"><span class="reveal-word__inner">${lineWords.slice(i, i + CHUNK).join(' ')}</span></span>`;
        }
        lineWords = [];
      };

      nodes.forEach(node => {
        if (node.nodeName === 'BR') {
          flushLine();
          html += '<br>';
        } else if (node.nodeType === Node.TEXT_NODE) {
          lineWords.push(...node.textContent.trim().split(/\s+/).filter(Boolean));
        }
      });
      flushLine();

      introP.innerHTML = html;
      const inners = introP.querySelectorAll('.reveal-word__inner');
      gsap.from(inners, { yPercent: 110, duration: 0.6, ease: 'power2.out', stagger: 0.07, delay: 0.35 });
    }

    document.querySelectorAll('.subpage__section-title').forEach(el => {
      el.innerHTML = el.textContent.split('').map(ch =>
        ch === ' '
          ? '<span class="reveal-char" style="width:0.3em;display:inline-block"></span>'
          : `<span class="reveal-char"><span class="reveal-char__inner">${ch}</span></span>`
      ).join('');
      const chars = el.querySelectorAll('.reveal-char__inner');
      gsap.from(chars, {
        yPercent: 110, duration: 0.6, ease: 'power3.out', stagger: 0.06,
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });



    gsap.from('.skill-tag', {
      y: 20, opacity: 0, duration: 0.5, ease: 'power2.out',
      stagger: 0.05,
      scrollTrigger: { trigger: '.about-skills', start: 'top 80%' },
    });

    const calEl = document.getElementById('about-github-calendar');
    if (calEl) buildGithubCalendar(calEl);
  },
};