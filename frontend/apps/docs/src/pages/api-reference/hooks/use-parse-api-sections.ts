import { useEffect } from 'react';
import getSectionMeta from 'src/utils/section';
import useHydrateArticles from '.';
import type { ApiReferenceArticle } from '../../api-reference/index.page';
import staticApiData from '../assets/public-api-docs.json';
import type { ApiArticleSection } from '../components/articles';

/**
 * Parses all markdown files that describe individual APIs and joins them the with information from the open
 * API specs they document.
 */
const useParseApiSections = (apiSections: ApiReferenceArticle[]): ApiArticleSection[] => {
  const publicApiArticles = useHydrateArticles(staticApiData);
  useEffect(() => {
    // Alert if there's a new public API that isn't documented on this site.
    // All APIs in the public-api-docs.json should be included in articles on the API reference site.
    const allDocumentedApis = apiSections.flatMap(article => article.data.apis);
    const undocumentedApis = publicApiArticles.filter(
      api => !allDocumentedApis.some(docApi => docApi.method === api.method && docApi.path === api.path),
    );
    if (undocumentedApis.length) {
      const undocumentedApisList = undocumentedApis.map(api => ({
        method: api.method,
        path: api.path,
      }));
      console.error(`Found undocumented APIs: ${JSON.stringify(undocumentedApisList)}`);
    }
  }, [apiSections, publicApiArticles]);

  const findArticle = ({ method, path }: { method: string; path: string }) =>
    publicApiArticles.find(api => api.method === method && api.path === path);

  const sections = apiSections.map(article => ({
    title: article.data.title,
    id: getSectionMeta(article.data.title).id,
    content: article.content,
    // Each markdown file also includes a YAML list of the apis to be included in this section, specified
    // by the method and path. Use these to look up the open API reference for this API that is exported
    // by the backend.
    subsections: article.data.apis.map(({ method, path, title, description }) => {
      const api = findArticle({ method, path });
      if (!api) {
        throw Error(`No article found for ${method} ${path}`);
      }
      if (!title) {
        throw Error(`No title found for ${method} ${path}`);
      }
      return { title, description, api };
    }),
  }));

  return sections;
};

export default useParseApiSections;
