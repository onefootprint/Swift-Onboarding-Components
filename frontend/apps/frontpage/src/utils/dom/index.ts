import { CURRENT_PARAMS_KEY } from 'src/config/constants';

export const addCurrentParamsToUrl = (baseUrl: string): string => {
  if (typeof window === 'undefined') return baseUrl;
  if (!baseUrl) return '';

  const currentParams = new URLSearchParams(window.location.search);
  const params =
    currentParams.toString().length > 0
      ? currentParams
      : new URLSearchParams(sessionStorage.getItem(CURRENT_PARAMS_KEY) || '');

  if (params.toString().length === 0) {
    return baseUrl;
  }

  const [urlBase, hash] = baseUrl.split('#');
  const separator = urlBase.includes('?') ? '&' : '?';
  const newUrl = `${urlBase}${separator}${params.toString()}`;
  return hash ? `${newUrl}#${hash}` : newUrl;
};

export const storeCurrentUrlParamsInSession = () => {
  if (typeof window === 'undefined') return;

  const currentUrlSearch = window.location.search;
  if (currentUrlSearch) {
    sessionStorage.setItem(CURRENT_PARAMS_KEY, currentUrlSearch);
  }
};
