// =============================
// Skills 데이터 + 렌더링
// =============================
const ICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/';

const skills = [
  { name: 'HTML5',       icon: `${ICON}html5/html5-original.svg` },
  { name: 'CSS3',        icon: `${ICON}css3/css3-original.svg` },
  { name: 'JavaScript',  icon: `${ICON}javascript/javascript-original.svg` },
  { name: 'jQuery',      icon: `${ICON}jquery/jquery-original.svg` },
  { name: 'GSAP',        icon: `https://cdn.inflearn.com/public/files/posts/404ca137-474a-4b4d-9b1e-8b4cde6e2ed5/gsap.png` },
  { name: 'Git',         icon: `${ICON}git/git-original.svg` },
  { name: 'Figma',       icon: `${ICON}figma/figma-original.svg` },
  { name: 'Photoshop',   icon: `${ICON}photoshop/photoshop-original.svg` },
  { name: 'Illustrator', icon: `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/illustrator/illustrator-original.svg` },
];

function renderSkills() {
  const grid = document.querySelector('.skills__grid');
  if (!grid) return;

  grid.innerHTML = skills.map(s => `
    <div class="skill-item">
      <div class="skill-item__inner">
        <img class="skill-item__icon" src="${s.icon}" alt="${s.name}">
        <span class="skill-item__name">${s.name}</span>
      </div>
    </div>
  `).join('');

}
