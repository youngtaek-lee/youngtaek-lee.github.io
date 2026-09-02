const notesCategoryGroups = [
  {
    group: 'Framework',
    categories: [
      { slug: 'framework',     label: '프레임워크란?', file: null, date: null },
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
