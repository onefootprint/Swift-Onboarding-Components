import type { Article } from '../../../api-reference.types';

type Section = {
  title: string;
  subsections: Article[];
};

/// A stable operation that groups _adjacent_ articles that have the same section name.
/// This preserves the order of the input articles so they are displayed in navigation in the same
/// order in which they are displayed in the site body
const groupBySection = (articles: Article[]) => {
  const sections: Section[] = [];
  articles.forEach(a => {
    const currentSection = sections.length ? sections[sections.length - 1] : undefined;
    if (currentSection?.title === a.section) {
      currentSection.subsections.push(a);
    } else {
      sections.push({
        title: a.section,
        subsections: [a],
      });
    }
  });
  return sections;
};

export default groupBySection;
