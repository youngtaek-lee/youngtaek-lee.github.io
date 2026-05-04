// =============================
// Skills 데이터 + 렌더링
// =============================
const ICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/';

const skills = [
  { name: 'HTML5',       label: 'HTML',        icon: `${ICON}html5/html5-plain.svg` },
  { name: 'CSS3',        label: 'CSS',         icon: `${ICON}css3/css3-plain.svg` },
  { name: 'JavaScript',  label: '자바스크립트', icon: `${ICON}javascript/javascript-plain.svg` },
  { name: 'jQuery',      label: '제이쿼리',    icon: `${ICON}jquery/jquery-plain.svg` },
  { name: 'GSAP',        label: 'GSAP',        icon: `assets/images/gsap.svg` },
  { name: 'Git',         label: 'Git',         icon: `${ICON}git/git-plain.svg` },
  { name: 'Figma',       label: '피그마',      icon: `${ICON}figma/figma-plain.svg` },
  { name: 'Photoshop',   label: '포토샵',      icon: `${ICON}photoshop/photoshop-plain.svg` },
  { name: 'Illustrator', label: '일러스트',    icon: `${ICON}illustrator/illustrator-plain.svg` },
];

function renderSkills() {
  const grid = document.querySelector('.skills__grid');
  if (!grid) return;

  grid.innerHTML = skills.map(s => `
    <div class="skill-item">
      <span class="skill-item__name">${s.name}</span>
      <div class="skill-item__inner">
        <img class="skill-item__icon" src="${s.icon}" alt="${s.name}">
        <span class="skill-item__label">${s.label}</span>
      </div>
    </div>
  `).join('');

}
