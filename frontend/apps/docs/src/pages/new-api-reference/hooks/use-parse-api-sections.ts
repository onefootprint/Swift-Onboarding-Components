import { useEffect } from 'react';
import getSectionMeta from 'src/utils/section';
import staticApiData from '../../api-reference/assets/public-api-docs.json';
import useHydrateArticles from '../../api-reference/hooks';
import getArticles from '../../api-reference/utils/get-articles';
import { ApiArticleProps, ApiReferenceArticle } from '../index.page';

/** The open API spec for all public-facing APIs, exported by the backend. */
const staticApiArticles = getArticles(staticApiData);

/**
 * Parses all markdown files that describe individual APIs and joins them the with information from the open
 * API specs they document.
 */
const useParseApiSections = (apiSections: ApiReferenceArticle[]) => {
  const publicApiArticles = useHydrateArticles(staticApiArticles);
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

  const findArticle = ({ method, path }: ApiArticleProps) =>
    publicApiArticles.find(api => api.method === method && api.path === path);

  const sections = apiSections.map(article => ({
    content: article.content,
    title: article.data.title,
    id: getSectionMeta(article.data.title).id,
    // Each markdown file also includes a YAML list of the apis to be included in this section, specified
    // by the method and path. Use these to look up the open API reference for this API that is exported
    // by the backend.
    apiArticles: article.data.apis.map(api => {
      const article = findArticle(api);
      if (!article) {
        throw Error(`No article found for ${api.method} ${api.path}`);
      }
      if (!api.title) {
        throw Error(`No title found for ${api.method} ${api.path}`);
      }
      return {
        title: api.title,
        api: article,
      };
    }),
  }));

  return sections;
};

export default useParseApiSections;
