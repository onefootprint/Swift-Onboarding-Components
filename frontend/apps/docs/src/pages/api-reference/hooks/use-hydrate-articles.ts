import { TenantPreviewApi } from '@onefootprint/types/src/api/get-tenants';
import useSession from 'src/hooks/use-session';
import { Article, SecurityTypes } from '../api-reference.types';

type AdditionalArticleProps = {
  /** True if this API should be hidden when the tenant doesn't have access to it. */
  hideWhenLocked: boolean;
  /** True if the API is should be hidden from the docs site. */
  isHidden: boolean;
  /** True if the authenticated tenant has access to hit this API (with regards to preview gates). */
  canAccessApi: boolean;
  /** Though an API may have multiple tags associated with it, this is the singular "identifying" tag that
   * controls some high-level visibility rules.
   */
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

  const canAccessPreviewApi = (previewApi: TenantPreviewApi) =>
    user?.tenant?.allowedPreviewApis?.includes(previewApi) || false;

  return articles.map(article => {
    const hasTag = (tag: string) => article.tags?.includes(tag) || false;

    const requiredPreviewGates = (article.security || [])
      .flatMap(s => s[SecurityTypes.apiKey] || [])
      .filter(s => s.startsWith('preview:'))
      .map(s => s.replace('preview:', '') as TenantPreviewApi);
    if (requiredPreviewGates.length > 1) {
      console.error(
        `API with multiple required preview gates: ${article.method} ${article.path}, ${requiredPreviewGates}`,
      );
    }

    const tag = Object.values(ArticleTag).filter(t => hasTag(t))[0];
    const requiredPreviewGate: TenantPreviewApi | undefined = requiredPreviewGates[0];
    let canAccessApi = !requiredPreviewGate || canAccessPreviewApi(requiredPreviewGate);

    const isClientVaultingApi = article.security?.some(s => Object.keys(s).includes(SecurityTypes.clientToken));
    if (isClientVaultingApi) {
      // Client-vaulting APIs have some custom visibility logic.
      // We don't actually impose a preview API guard on the client vaulting APIs aside from generating the
      // client_token. But we want to hide all client vaulting APIs if the tenant doesn't have access to
      // generate the client_token
      canAccessApi = canAccessPreviewApi(TenantPreviewApi.ClientVaultingDocs);
    }

    // Employees should always be able to see every API
    const hideWhenLocked = hasTag('HideWhenLocked');
    const isHidden = hideWhenLocked && !canAccessApi && !user?.isFirmEmployee;

    return {
      ...article,
      hideWhenLocked,
      isHidden,
      canAccessApi,
      tag,
    };
  });
};

export default useHydrateArticles;
