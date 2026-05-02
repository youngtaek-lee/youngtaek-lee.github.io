// =============================
// Skills 데이터 + 렌더링
// =============================
const ICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/';

const skills = [
  { name: 'HTML5',       icon: `${ICON}html5/html5-original.svg` },
  { name: 'CSS3',        icon: `${ICON}css3/css3-original.svg` },
  { name: 'JavaScript',  icon: `${ICON}javascript/javascript-plain.svg` },
  { name: 'jQuery',      icon: `${ICON}jquery/jquery-original.svg` },
  { name: 'GSAP',        icon: `${ICON}gsap/gsap-original.svg` },
  { name: 'Git',         icon: `${ICON}git/git-original.svg` },
  { name: 'Figma',       icon: `${ICON}figma/figma-original.svg` },
  { name: 'Photoshop',   icon: `${ICON}photoshop/photoshop-plain.svg` },
  { name: 'Illustrator', icon: `${ICON}illustrator/illustrator-plain.svg` },
];

function renderSkills() {
  const grid = document.querySelector('.skills__grid');
  if (!grid) return;

  grid.innerHTML = skills.map(s => `
    <div class="skill-item">
      <span class="skill-item__name">${s.name}</span>
      <img class="skill-item__icon" src="${s.icon}" alt="${s.name}" loading="lazy">
    </div>
  `).join('');

}
