const PageWorksList = {
  meta() {
    return {
      title: 'Works',
      description: '이영택의 웹 퍼블리싱 프로젝트 목록 — 브랜드 사이트, 제품 소개 페이지 등 작업물을 소개합니다.',
    };
  },

  render() {
    const items = typeof works !== 'undefined' ? works.filter(w => w.id !== 'more') : [];
    const SHOW_EXTRA_WORKS = true;
    const allExtras = SHOW_EXTRA_WORKS && typeof worksExtra !== 'undefined' ? worksExtra : [];
    const undated = allExtras.filter(e => !e.year);
    const yearNotes = {
      2026: { title: 'New Start', text: '새로운 시작을 위해 다시 쌓아가는 작업' },
      2025: { title: 'Recharge', text: '다음 작업을 위한 재충전의 시간' },
      2024: { title: 'Freelance', text: '프리랜서로 기존 프로젝트 유지보수를 이어간 해' },
      2023: { title: 'Transition', text: '재직을 마치고 프리랜서로 전환한 해' },
      2022: { title: 'In-house', text: '퍼블리싱팀에서 다양한 기업·기관 사이트를 제작' },
      2021: { title: 'Growing', text: '퍼블리싱팀에 합류해 다양한 업종의 사이트를 맡기 시작한 해' },
    };
    const years = [...new Set([...items.map(w => w.year), ...allExtras.map(e => e.year).filter(Boolean), ...Object.keys(yearNotes).map(Number)])].sort((a, b) => b - a);
    const sparkle = '<svg class="works__sparkle" viewBox="-1.1 -1.1 2.2 2.2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M0,-1 L0.092,-0.092 L1,0 L0.092,0.092 L0,1 L-0.092,0.092 L-1,0 L-0.092,-0.092 Z" fill="currentColor"/></svg>';
    const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
    const workRow = (w, i) => `
      <li class="works__item">
        <a href="/works/${w.id}" class="works__item__link">
          <span class="works__item__num">${String(i + 1).padStart(2, '0')}</span>
          <span class="works__item__title">
            <span class="works__item__title__en">${w.title}</span>
            <span class="works__item__title__ko">${w.name}</span>
          </span>
          <span class="works__item__meta">
            <span class="works__item__category">${w.category}</span>
          </span>
          ${sparkle}
        </a>
      </li>`;
    const extraRow = e => `
      <li class="works__item${e.url ? ' works__item--ext' : ' works__item--static'}">
        ${e.url ? `<a href="${e.url}" target="_blank" rel="noopener" class="works__item__link">` : '<span class="works__item__link">'}
          <span class="works__item__title">
            <span class="works__item__title__en">${e.name}</span>
            <span class="works__item__title__ko">${e.name}${e.url ? ' ↗' : ''}</span>
          </span>
          <span class="works__item__meta"><span class="works__item__category">${e.url ? hostOf(e.url) : ''}</span></span>
          ${e.url ? sparkle : ''}
        ${e.url ? '</a>' : '</span>'}
      </li>`;
    return `
      <div class="subpage works-list-page">

        <section class="subpage__section">
          <h1 class="subpage__title">Recent<br>Works</h1>
          ${years.map(y => {
            const note = yearNotes[y];
            const rows = [
              ...items.filter(w => w.year === y).map(workRow),
              ...allExtras.filter(e => e.year === y).map(extraRow),
            ];
            return `
            <h2 class="works-year__label">${y}</h2>
            ${note ? `<div class="works-break">
              <span class="works-break__title">${note.title}</span>
              <span class="works-break__text">${note.text}</span>
            </div>` : ''}
            ${rows.length ? `<ul class="works__list">${rows.join('')}</ul>` : ''}`;
          }).join('')}
          ${undated.length ? `
            <h2 class="works-year__label">Others</h2>
            <ul class="works__list">${undated.map(extraRow).join('')}</ul>` : ''}
        </section>

      </div>
      <img class="works__thumb" id="works-thumb" alt="" aria-hidden="true">
    `;
  },

  init() {
    const titleEl = document.querySelector('#subpage-view .subpage__title');
    let chars;
    if (titleEl) {
      titleEl.innerHTML = titleEl.innerHTML.split(/<br\s*\/?>/i).map(line =>
        line.trim().split('').map(ch =>
          `<span class="reveal-char"><span class="reveal-char__inner">${ch}</span></span>`
        ).join('')
      ).join('<br>');
      chars = titleEl.querySelectorAll('.reveal-char__inner');
      gsap.set(chars, { yPercent: 110 });
    }
    const rowSel = '#subpage-view .works__item, #subpage-view .works-year__label, #subpage-view .works-break';
    gsap.set(rowSel, { x: 150, opacity: 0 });

    let ready = false;
    const waiting = new Set();
    const showRows = els => gsap.to(els, { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.08 });
    ScrollTrigger.batch(rowSel, {
      start: 'top 92%',
      once: true,
      onEnter: batch => { if (ready) showRows(batch); else batch.forEach(el => waiting.add(el)); },
    });

    const doHeroReveal = () => {
      if (chars) gsap.to(chars, { yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06, delay: 0.1 });
      ready = true;
      const pending = [...waiting];
      waiting.clear();
      if (pending.length) gsap.delayedCall(0.2, () => showRows(pending));
    };

    if (document.getElementById('intro') || gsap.isTweening(document.querySelector('.page-transition'))) {
      window.__onCurtainMid = doHeroReveal;
    } else {
      doHeroReveal();
    }

    document.querySelectorAll('#subpage-view .subpage__section-title').forEach(el => {
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

    // 썸네일 hover
    const thumb = document.querySelector('#subpage-view .works__thumb');
    if (thumb) {
      let el = thumb;
      let gl = null;
      document.querySelectorAll('#subpage-view .works__item').forEach(li => {
        const id = (li.querySelector('a')?.getAttribute('href') || '').split('/').pop();
        const work = works.find(w => w.id === id);
        if (!work) return;
        li.addEventListener('mouseenter', () => { thumb.src = work.main; gl?.setImage(work.main); el.classList.add('is-visible'); });
        li.addEventListener('mouseleave', () => { el.classList.remove('is-visible'); });
      });
      gsap.set(thumb, { xPercent: -50, yPercent: -55 });
      const clamp = (v, max) => Math.max(-max, Math.min(max, v));
      const m = { x: 0, y: 0, set: false };
      const p = { x: 0, y: 0, vx: 0, vy: 0 };
      document.addEventListener('mousemove', e => {
        m.x = e.clientX; m.y = e.clientY;
        if (!m.set) { p.x = m.x; p.y = m.y; m.set = true; }
      });
      const tick = () => {
        if (!el.isConnected) { gl?.dispose(); gsap.ticker.remove(tick); return; }
        if (!m.set) return;
        const px = p.x, py = p.y;
        p.x += (m.x - p.x) * 0.35;
        p.y += (m.y - p.y) * 0.35;
        p.vx = p.x - px; p.vy = p.y - py;
        gsap.set(el, { left: p.x, top: p.y });
        gl?.render(p);
      };
      gsap.ticker.add(tick);

      const VERT = `
        uniform float uSpeed, uTime;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 pos = position;
          float w = 1.0 - uv.y;
          pos.x += sin(uv.y * 7.0 - uTime * 9.0 + uv.x * 2.0) * uSpeed * w * 6.0;
          pos.y += sin(uv.x * 6.0 + uTime * 7.0) * uSpeed * w * 3.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }`;
      const FRAG = `
        uniform sampler2D uMap;
        varying vec2 vUv;
        void main() {
          gl_FragColor = texture2D(uMap, vUv);
          #include <colorspace_fragment>
        }`;

      (async () => {
        if (!window.WebGLRenderingContext) return;
        try {
          const THREE = await import('three');
          if (!thumb.isConnected) return;
          const W = 560, H = 380, IW = 300, IH = 169;
          const canvas = document.createElement('canvas');
          canvas.className = 'works__thumb works__thumb--gl';
          canvas.setAttribute('aria-hidden', 'true');
          const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
          renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
          renderer.setSize(W, H, false);
          renderer.setClearColor(0x000000, 0);
          const scene = new THREE.Scene();
          const camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -500, 500);
          const geo = new THREE.PlaneGeometry(IW, IH, 24, 16);
          geo.translate(0, -IH / 2, 0);
          const mat = new THREE.ShaderMaterial({
            uniforms: { uMap: { value: null }, uSpeed: { value: 0 }, uTime: { value: 0 } },
            vertexShader: VERT, fragmentShader: FRAG, transparent: true,
          });
          const pivot = new THREE.Group();
          pivot.position.y = IH * 0.55;
          pivot.add(new THREE.Mesh(geo, mat));
          scene.add(pivot);

          const loader = new THREE.TextureLoader();
          const cache = {};
          let current = '';
          const setImage = src => {
            current = src;
            if (cache[src]) { mat.uniforms.uMap.value = cache[src]; return; }
            loader.load(src, t => {
              t.colorSpace = THREE.SRGBColorSpace;
              cache[src] = t;
              if (current === src) mat.uniforms.uMap.value = t;
            });
          };

          let lastActive = 0;
          const u = mat.uniforms;
          gl = {
            setImage,
            render(s) {
              const now = performance.now();
              if (canvas.classList.contains('is-visible')) lastActive = now;
              if (now - lastActive > 500 || !u.uMap.value) return;
              u.uSpeed.value += (Math.min(1, Math.hypot(s.vx, s.vy) / 22) - u.uSpeed.value) * 0.2;
              u.uTime.value = now / 1000;
              renderer.render(scene, camera);
            },
            dispose() {
              renderer.dispose(); geo.dispose(); mat.dispose();
              Object.values(cache).forEach(t => t.dispose());
            },
          };
          if (el.classList.contains('is-visible')) canvas.classList.add('is-visible');
          if (thumb.getAttribute('src')) { current = thumb.getAttribute('src'); setImage(current); }
          thumb.replaceWith(canvas);
          el = canvas;
          gsap.set(el, { xPercent: -50, yPercent: -50 });
        } catch (err) {
          gl = null;
        }
      })();
    }
  },
};
