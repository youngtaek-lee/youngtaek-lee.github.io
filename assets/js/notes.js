const notesCategoryGroups = [
  {
    group: 'Concepts',
    categories: [
      { slug: 'ioc',              label: 'IoC란?',                    file: '/content/notes/ioc.md', date: '2026-09-03' },
      { slug: 'lib-vs-framework', label: 'Framework vs Library', file: '/content/notes/lib-vs-framework.md', date: '2026-09-04' },
    ],
  },
  {
    group: 'Analytics',
    categories: [
      { slug: 'statcounter', label: 'StatCounter', file: '/content/notes/statcounter.md', date: '2026-09-22' },
    ],
  },
  {
    group: 'Tools',
    categories: [
      { slug: 'claude-in-chrome', label: 'Claude in Chrome', file: '/content/notes/claude-in-chrome.md', date: '2026-09-22' },
    ],
  },
  {
    group: 'Framework',
    categories: [
      { slug: 'framework',     label: 'Framework',    file: null, date: null },
    ],
    subgroups: [
      {
        subgroup: 'CSS Framework',
        categories: [
          { slug: 'tailwind',  label: 'Tailwind',  file: null, date: null },
          { slug: 'bootstrap', label: 'Bootstrap', file: null, date: null },
        ],
      },
      {
        subgroup: 'JS Framework',
        categories: [
          { slug: 'react',     label: 'React', file: null, date: null },
          { slug: 'vue',       label: 'Vue',   file: null, date: null },
        ],
      },
    ],
  },
  {
    group: 'HTML',
    categories: [
      { slug: 'semantic',      label: '시맨틱 마크업', file: null, date: null },
      { slug: 'a11y',          label: '웹 접근성',     file: null, date: null },
      { slug: 'forms',         label: '폼',            file: null, date: null },
      { slug: 'seo',           label: 'SEO/메타 태그', file: null, date: null },
    ],
  },
];

function notesGroupAllCategories(group) {
  const own = group.categories || [];
  const nested = (group.subgroups || []).flatMap(sg => sg.categories);
  return [...own, ...nested];
}

const notesAllCategories = notesCategoryGroups.flatMap(notesGroupAllCategories);
const notesCategorySlugs = notesAllCategories.map(c => c.slug);
