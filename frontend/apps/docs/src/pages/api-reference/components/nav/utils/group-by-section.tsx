import { HydratedArticle } from 'src/pages/api-reference/hooks';
import { SubSection } from '../nav.types';

/**
 * A stable operation that groups _adjacent_ apiArticles that have the same section name.
 * This preserves the order of the input apiArticles so they are displayed in navigation in the same
 * order in which they are displayed in the site body
 */
const groupBySubsection = (apiArticles: HydratedArticle[]) => {
  const sections: SubSection[] = [];
  apiArticles.forEach(a => {
    const currentSection = sections.length ? sections[sections.length - 1] : undefined;
    if (currentSection?.title === a.section) {
      currentSection.apiArticles.push(a);
    } else {
      sections.push({
        title: a.section,
        apiArticles: [a],
      });
    }
  });
  return sections;
};

export default groupBySubsection;
