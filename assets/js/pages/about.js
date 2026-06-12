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
              { name: 'GSAP',        desc: '고성능 웹 애니메이션',      icon: `<img src="assets/images/gsap.svg" class="skill-card__img-icon" alt="">`, color: null },
              { name: 'Three.js',    desc: '3D 웹 그래픽 렌더링',       icon: `<i class="devicon-threejs-original"></i>`,  color: '#ffffff' },
              { name: 'Git',         desc: '버전 관리 & 협업',          icon: `<i class="devicon-git-plain"></i>`,         color: '#F05032' },
              { name: 'Figma',       desc: '디자인 시안 해석',          icon: `<i class="devicon-figma-plain"></i>`,       color: '#F24E1E' },
              { name: 'Photoshop',   desc: '이미지 편집 & 보정',        icon: `<svg viewBox="0 0 32 32" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#001E36"/><text x="3" y="24" font-family="Arial,sans-serif" font-weight="bold" font-size="19" fill="#31A8FF">Ps</text></svg>`, color: null },
              { name: 'Illustrator', desc: '벡터 그래픽 & 에셋',        icon: `<svg viewBox="0 0 32 32" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="5" fill="#310000"/><text x="2" y="24" font-family="Arial,sans-serif" font-weight="bold" font-size="19" fill="#FF9A00">Ai</text></svg>`, color: null },
            ].map(s => `
              <div class="skill-card">
                <div class="skill-card__icon"${s.color ? ` style="color:${s.color}"` : ''}>${s.icon}</div>
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

    // Skill cards: 호버 카드 오른쪽을 열어서 100% 노출, 이후 카드는 밀려남
    const skillCardEls = [...document.querySelectorAll('.skill-card')];
    if (skillCardEls.length) {
      // 카드별 개별 기울기 & 브랜드 컬러 기반 어두운 배경
      const angles  = [-2, 1, -1.5, 2.5, -0.5, 1.5, -2.2, 0.8, -1, 2];
      const bgColors = [
        '#1e0f0a', // HTML5       — dark orange-red
        '#0a121b', // CSS3        — dark blue
        '#151207', // JavaScript  — dark yellow
        '#091018', // jQuery      — dark navy
        '#0e1505', // GSAP        — dark green
        '#111010', // Three.js    — neutral dark
        '#1e0d09', // Git         — dark red-orange
        '#1c0c08', // Figma       — dark red
        '#08111b', // Photoshop   — dark cyan-blue
        '#170f04', // Illustrator — dark amber
      ];
      skillCardEls.forEach((card, i) => {
        card.style.setProperty('--card-rotate', `${angles[i]}deg`);
        card.style.setProperty('--card-bg', bgColors[i]);
      });

      // aspect-ratio로 결정된 초기 높이를 측정 후 고정 — 너비 변화 시 높이 흔들림 방지
      const lockHeights = () => {
        skillCardEls.forEach(c => c.style.height = '');
        const h = skillCardEls[0].offsetHeight;
        skillCardEls.forEach(c => c.style.height = h + 'px');
      };
      requestAnimationFrame(lockHeights);
      window.addEventListener('resize', lockHeights);

      const isSingleRow = () => window.innerWidth > 768;

      skillCardEls.forEach((card, i) => {
        card.addEventListener('mouseenter', () => {
          if (!isSingleRow()) return;
          if (skillCardEls[i + 1]) {
            const overlap = card.offsetWidth * 0.1;
            skillCardEls[i + 1].style.marginLeft = `-${overlap}px`;
          }
        });
        card.addEventListener('mouseleave', () => {
          if (skillCardEls[i + 1]) skillCardEls[i + 1].style.marginLeft = '';
        });
      });
    }
  },
};