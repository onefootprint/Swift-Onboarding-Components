import { TenantPreviewApi } from '@onefootprint/types/src/api/get-tenants';
import useSession from 'src/hooks/use-session';
import { Article, SecurityTypes } from '../api-reference.types';

type AdditionalArticleProps = {
  /** True if the API is deprecated/phased out and the authed tenant doesn't have access to it. */
  isHidden: boolean;
  /** True if the API is deprecated/phased out */
  isPhasedOut: boolean;
  /** The list of `TenantPreviewApi`s required to access this API. */
  requiredPreviewGates: TenantPreviewApi[];
  previewGateStatus: PreviewGateStatus;
};

export enum PreviewGateStatus {
  /** No preview gate is required for this API */
  ungated = 'ungated',
  /** A preview gate is required for this API and the tenant does not have access to it */
  gatedNoAccess = 'gatedNoAccess',
  /** A preview gate is required for this API and the tenant has access to it */
  gatedWithAccess = 'gatedWithAccess',
  /** A preview gate is required for this API and the authed user is a firm employee */
  gatedWithAccessFirmEmployee = 'gatedWithAccessFirmEmployee',
}

export type HydratedArticle = Article & AdditionalArticleProps;

const useHydrateArticles = (articles: Article[]): HydratedArticle[] => {
  const {
    data: { user },
  } = useSession();

  return articles.map(article => {
    const isPhasedOut = article.tags?.includes('PhasedOut') || false;
    const requiredPreviewGates = (article.security || [])
      .flatMap(s => s[SecurityTypes.apiKey] || [])
      .filter(s => s.startsWith('preview:'))
      .map(s => s.replace('preview:', '') as TenantPreviewApi);
    if (requiredPreviewGates.length > 1) {
      console.error(
        `API with multiple required preview gates: ${article.method} ${article.path}, ${requiredPreviewGates}`,
      );
    }
    const requiredPreviewGate: TenantPreviewApi | undefined = requiredPreviewGates[0];
    const canAccessGatedApi =
      !requiredPreviewGate || user?.tenant?.allowedPreviewApis?.includes(requiredPreviewGate) || user?.isFirmEmployee;
    const isHidden = isPhasedOut && !canAccessGatedApi;

    return {
      ...article,
      isHidden,
      isPhasedOut,
      requiredPreviewGates,
      // TODO
      previewGateStatus: PreviewGateStatus.ungated,
    };
  });
};

export default useHydrateArticles;
