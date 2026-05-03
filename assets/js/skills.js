// =============================
// Skills 데이터 + 렌더링
// =============================
const ICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/';

const skills = [
  { name: 'HTML5',       icon: `${ICON}html5/html5-plain.svg` },
  { name: 'CSS3',        icon: `${ICON}css3/css3-plain.svg` },
  { name: 'JavaScript',  icon: `${ICON}javascript/javascript-plain.svg` },
  { name: 'jQuery',      icon: `${ICON}jquery/jquery-plain.svg` },
  { name: 'GSAP',        icon: `assets/images/gsap.svg` },
  { name: 'Git',         icon: `${ICON}git/git-plain.svg` },
  { name: 'Figma',       icon: `${ICON}figma/figma-plain.svg` },
  { name: 'Photoshop',   icon: `${ICON}photoshop/photoshop-plain.svg` },
  { name: 'Illustrator', icon: `${ICON}illustrator/illustrator-plain.svg` },
];

function renderSkills() {
  const grid = document.querySelector('.skills__grid');
  if (!grid) return;

  grid.innerHTML = skills.map(s => `
    <div class="skill-item">
      <span class="skill-item__name">${s.name}</span>
      <img class="skill-item__icon" src="${s.icon}" alt="${s.name}">
    </div>
  `).join('');

}
