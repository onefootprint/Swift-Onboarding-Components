import { TenantPreviewApi } from '@onefootprint/types/src/api/get-tenants';
import useSession from 'src/hooks/use-session';
import { Article, SecurityTypes } from '../api-reference.types';

type AdditionalArticleProps = {
  /** True if the API is deprecated/phased out and the authed tenant doesn't have access to it. */
  isHidden: boolean;
  /** True if the authenticated tenant has access to hit this API (with regards to preview gates). */
  canAccessApi: boolean;
  tag?: ArticleTag;
};

export enum ArticleTag {
  preview = 'Preview',
  phasedOut = 'PhasedOut',
  publicApi = 'PublicApi',
}

export type HydratedArticle = Article & AdditionalArticleProps;

const useHydrateArticles = (articles: Article[]): HydratedArticle[] => {
  const {
    data: { user },
  } = useSession();

  return articles.map(article => {
    const requiredPreviewGates = (article.security || [])
      .flatMap(s => s[SecurityTypes.apiKey] || [])
      .filter(s => s.startsWith('preview:'))
      .map(s => s.replace('preview:', '') as TenantPreviewApi);
    if (requiredPreviewGates.length > 1) {
      console.error(
        `API with multiple required preview gates: ${article.method} ${article.path}, ${requiredPreviewGates}`,
      );
    }

    const tag = Object.values(ArticleTag).filter(t => article.tags?.includes(t))[0];
    const requiredPreviewGate: TenantPreviewApi | undefined = requiredPreviewGates[0];
    const canAccessApi =
      !requiredPreviewGate || user?.tenant?.allowedPreviewApis?.includes(requiredPreviewGate) || false;

    // Employees should always be able to see every API
    const isHidden = tag === ArticleTag.phasedOut && !canAccessApi && !user?.isFirmEmployee;

    return {
      ...article,
      isHidden,
      canAccessApi,
      tag,
    };
  });
};

export default useHydrateArticles;
