import { HydratedArticle } from 'src/pages/api-reference/hooks';
import { SubSection } from '../nav.types';

/**
 * A stable operation that groups _adjacent_ apiArticles that have the same section name.
 * This preserves the order of the input apiArticles so they are displayed in navigation in the same
 * order in which they are displayed in the site body
 */
const groupBySubsection = (apiArticles: HydratedArticle[]) => {
  const sections: SubSection[] = [];
  apiArticles.forEach(api => {
    const currentSection = sections.length ? sections[sections.length - 1] : undefined;
    if (currentSection?.title === api.section) {
      currentSection.apiArticles.push({
        api,
      });
    } else {
      sections.push({
        title: api.section,
        apiArticles: [
          {
            api,
          },
        ],
      });
    }
  });
  return sections;
};

export default groupBySubsection;
