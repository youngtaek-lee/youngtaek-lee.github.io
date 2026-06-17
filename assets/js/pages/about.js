async function buildGithubCalendar(el, calAnim) {
  const CELL = 14, GAP = 3, STEP = 17, LABEL_H = 22;
  const COLORS = [
    'rgba(237,217,192,0.10)',
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

  contributions.sort((a, b) => (a.date < b.date ? -1 : 1));
  const dayMap = new Map(contributions.map(c => [c.date, c]));
  const firstDate = new Date(contributions[0].date + 'T00:00:00');
  const lastDate = new Date(contributions[contributions.length - 1].date + 'T00:00:00');
  // 첫째 날이 속한 주의 일요일로 시작
  const gridStart = new Date(firstDate);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  // 마지막 날이 속한 주의 토요일로 끝
  const gridEnd = new Date(lastDate);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const weeks = [];
  const cur = new Date(gridStart);
  while (cur <= gridEnd) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
      week.push(dayMap.get(key) ?? null);
      cur.setDate(cur.getDate() + 1);
    }
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

  const allRects = Array.from(el.querySelectorAll('rect'));
  const rowMap = new Map();
  allRects.forEach(r => {
    const y = r.getAttribute('y');
    if (!rowMap.has(y)) rowMap.set(y, []);
    rowMap.get(y).push(r);
  });
  // 아래 행부터 등장 (y값 내림차순)
  const rows = [...rowMap.entries()]
    .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
    .map(([, rs]) => rs);

  gsap.set(allRects, { opacity: 0, y: -8 });

  const animateCols = () => {
    rows.forEach((group, i) => {
      gsap.to(group, { opacity: 1, y: 0, duration: 0.4, delay: i * 0.06, ease: 'power2.out' });
    });
  };

  if (calAnim?.ready) {
    animateCols();
  } else if (calAnim) {
    calAnim.trigger = animateCols;
  }

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
          <div class="skill-cards">
            ${[
              { name: 'HTML5',       desc: '시맨틱 마크업 & 구조화',   icon: `<i class="devicon-html5-plain"></i>`,       color: '#E34F26' },
              { name: 'CSS3',        desc: '레이아웃 & 스타일링',       icon: `<i class="devicon-css3-plain"></i>`,        color: '#1572B6' },
              { name: 'JavaScript',  desc: '인터랙션 & 로직 구현',      icon: `<i class="devicon-javascript-plain"></i>`,  color: '#F7DF1E' },
              { name: 'jQuery',      desc: 'DOM 조작 & 플러그인',       icon: `<i class="devicon-jquery-plain"></i>`,      color: '#0769AD' },
              { name: 'GSAP',        desc: '고성능 웹 애니메이션',      color: '#88CE02', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M9.83 7.59c.817.005 1.437.238 1.842.692c.383.431.567 1.054.547 1.85l-.014.061a.16.16 0 0 1-.148.095h-1.659a.2.2 0 0 1-.199-.195q.002-.634-.39-.71l-.12-.011c-.342 0-.564.211-.57.579c-.007.41.225.783.885 1.423c.868.816 1.217 1.539 1.2 2.493c-.027 1.544-1.077 2.543-2.673 2.543c-.815 0-1.438-.219-1.853-.649c-.42-.437-.612-1.078-.572-1.906a.17.17 0 0 1 .049-.112a.16.16 0 0 1 .112-.045h1.716a.2.2 0 0 1 .069.017a.17.17 0 0 1 .083.098q.008.03.002.06c-.019.298.034.521.151.645a.4.4 0 0 0 .311.121c.317 0 .503-.225.51-.615c.006-.337-.102-.634-.682-1.232c-.751-.734-1.424-1.492-1.403-2.684a2.48 2.48 0 0 1 .774-1.781c.514-.482 1.216-.737 2.032-.737m-5.783.028c.747-.006 1.334.224 1.742.685c.432.487.651 1.221.652 2.182a.16.16 0 0 1-.161.158H4.479a.13.13 0 0 1-.084-.036a.13.13 0 0 1-.035-.085c-.014-.623-.188-.946-.532-.984l-.071-.004c-.69.001-1.097.938-1.313 1.458a5.5 5.5 0 0 0-.426 2.301c.015.366.074.88.42 1.093c.308.189.747.064 1.013-.146c.265-.209.479-.571.569-.901q.02-.07.001-.098q-.01-.011-.032-.015l-.504-.004a.18.18 0 0 1-.129-.06a.1.1 0 0 1-.025-.05a.1.1 0 0 1 0-.056l.316-1.374a.18.18 0 0 1 .157-.134v-.003h3.035l.021.001c.079.01.135.084.134.164v.004l-.316 1.371c-.017.078-.095.135-.184.135h-.381a.064.064 0 0 0-.061.046c-.352 1.194-.829 2.016-1.458 2.509c-.536.42-1.195.616-2.077.616c-.792 0-1.326-.255-1.779-.758c-.598-.666-.845-1.754-.695-3.067c.27-2.463 1.546-4.948 4.004-4.948m16.969.132c2.01 0 3.014.912 2.983 2.711c-.037 2.108-1.321 3.658-3.254 4.016q-.413.073-.833.068l-.934-.004a.06.06 0 0 0-.058.057q0 .015.008.029a.1.1 0 0 0 .022.021l.794.414q.098.053.076.164l-.207.933c-.017.078-.08.123-.171.123h-1.703a.2.2 0 0 1-.071-.015a.2.2 0 0 1-.058-.044a.12.12 0 0 1-.025-.107l1.896-8.241c.019-.086.1-.124.172-.124zm-3.743.012a.2.2 0 0 1 .051.033a.2.2 0 0 1 .034.052a.2.2 0 0 1 .011.059l-.011 8.213a.14.14 0 0 1-.003.058a.14.14 0 0 1-.081.091a.14.14 0 0 1-.064.013h-1.813a.16.16 0 0 1-.111-.045a.2.2 0 0 1-.033-.051a.2.2 0 0 1-.012-.06l.039-.797c.002-.087 0-.111-.051-.117l-.068-.002h-1.714c-.124 0-.133.011-.177.125l-.356.857q-.048.09-.192.09h-1.795c-.109 0-.187-.108-.146-.209l3.718-8.199c.025-.049.063-.123.149-.123h2.566q.03 0 .059.012M15.5 9.985c-.008-.032-.034-.029-.055.013a1 1 0 0 0-.04.093l-1.284 3.183l-.016.048q-.002.01-.001.019l.007.017a.04.04 0 0 0 .015.012a.04.04 0 0 0 .017.006l1.072.014c.119-.01.125-.016.137-.137c.002-.043.154-3.231.148-3.268m4.612-.403a.06.06 0 0 0-.04.017a.06.06 0 0 0-.018.04a.06.06 0 0 0 .03.051l.842.445c.042.023.043.063.029.132c-.007.031-.54 2.375-.539 2.377c.003.003.019.011.099.011h.036c.895-.036 1.383-1.094 1.401-2.121c.009-.555-.18-.896-.523-.946l-.071-.006z"/></svg>`, color: null },
              { name: 'Three.js',    desc: '3D 웹 그래픽 렌더링',       icon: `<i class="devicon-threejs-original"></i>`,  color: '#ffffff' },
              { name: 'Git',         desc: '버전 관리 & 협업',          icon: `<i class="devicon-git-plain"></i>`,         color: '#F05032' },
              { name: 'Figma',       desc: '디자인 시안 해석',          icon: `<i class="devicon-figma-plain"></i>`,       color: '#F24E1E' },
              { name: 'Photoshop',   desc: '이미지 편집 & 보정',        icon: `<i class="devicon-photoshop-plain"></i>`,   color: '#31A8FF' },
              { name: 'Illustrator', desc: '벡터 그래픽 & 에셋',        icon: `<i class="devicon-illustrator-plain"></i>`, color: '#FF9A00' },
            ].map(s => `
              <div class="skill-card"${s.color ? ` style="--icon-color:${s.color}"` : ''}>
                <div class="skill-card__icon">${s.icon}</div>
                <span class="skill-card__name">${s.name}</span>
                <span class="skill-card__desc">${s.desc}</span>
              </div>
            `).join('')}
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
    let chars;
    if (titleEl) {
      titleEl.innerHTML = titleEl.textContent.split('').map(ch =>
        `<span class="reveal-char"><span class="reveal-char__inner">${ch}</span></span>`
      ).join('');
      chars = titleEl.querySelectorAll('.reveal-char__inner');
      gsap.set(chars, { yPercent: 110 });
    }

    const introP = document.querySelector('.about-intro__text p');
    let inners;
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
      inners = introP.querySelectorAll('.reveal-word__inner');
      gsap.set(inners, { yPercent: 110 });
    }

    const doHeroReveal = () => {
      if (chars) gsap.to(chars, { yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, delay: 0.1 });
      if (inners) gsap.to(inners, { yPercent: 0, duration: 0.6, ease: 'power2.out', stagger: 0.07, delay: 0.45 });
    };

    if (document.getElementById('intro') || gsap.isTweening(document.querySelector('.page-transition'))) {
      window.__onCurtainMid = doHeroReveal;
    } else {
      doHeroReveal();
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



    gsap.from('.skill-card', {
      y: 24, opacity: 0, duration: 0.5, ease: 'power2.out',
      stagger: 0.06,
      clearProps: 'transform',
      scrollTrigger: { trigger: '.about-skills', start: 'top 80%' },
    });

    // Work Process animations — 초기 뷰포트 내 위치하므로 ScrollTrigger 대신 delay 사용
    // delay 2.0s = 전환 패널 잔여(0.7s) + 섹션 타이틀 차 애니메이션 완료(~1.2s)
    if (document.querySelector('.ptl')) {
      gsap.timeline({ delay: 1.0 })
        .from('.ptl', { y: 30, opacity: 0, duration: 0.6, ease: 'power2.out' })
        .from('.ptl__header', { y: 24, opacity: 0, duration: 0.55, ease: 'power2.out' }, '-=0.3')
        .from('.ptl__phases .ptl__phase', { y: 10, opacity: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out' }, '-=0.25')
        .from('.ptl__bar--1', { y: 20, opacity: 0, duration: 0.55, ease: 'power2.out' }, '-=0.15')
        .from('.ptl__bar--2', { y: 20, opacity: 0, duration: 0.55, ease: 'power2.out' }, `<+=${0.55 * 0.5}`)
        .from('.ptl__bar--3', { y: 20, opacity: 0, duration: 0.55, ease: 'power2.out' }, `<+=${0.55 * (2/3)}`)
        .from('.ptl__weeks .ptl__week', { y: 8, opacity: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' }, '-=0.2')
        .from('.ptl__footer', { y: 14, opacity: 0, duration: 0.45, ease: 'power2.out' }, '-=0.1');
    }

    // Commit Log animations — 폴드 아래 위치, ScrollTrigger 사용
    const calAnim = { ready: false, trigger: null };
    if (document.querySelector('.about-github__card')) {
      gsap.timeline({
        scrollTrigger: { trigger: '.about-github', start: 'top 82%', once: true },
        onComplete: () => {
          calAnim.ready = true;
          calAnim.trigger?.();
        },
      })
        .from('.about-github__card', { y: 30, opacity: 0, duration: 0.6, ease: 'power2.out' })
        .from('.about-github__label', { y: 10, opacity: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3')
        .from('.about-github__card-title', { y: 12, opacity: 0, duration: 0.45, ease: 'power2.out' }, '-=0.3')
        .from('.about-github__link', { opacity: 0, duration: 0.4, ease: 'power2.out', immediateRender: false }, '-=0.2');
    }

    const calEl = document.getElementById('about-github-calendar');
    if (calEl) buildGithubCalendar(calEl, calAnim);

  },
};