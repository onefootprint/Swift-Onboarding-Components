import type { FootprintAppearance } from '@onefootprint/footprint-js';

import parse from '../parse';

const AUTH_HEADER = 'x-fp-authorization';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getD2PStatus = async (authToken: string): Promise<FootprintAppearance> => {
  const response = await fetch(`${API_BASE_URL}/hosted/onboarding/d2p/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      [AUTH_HEADER]: authToken,
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = await response.json();
  const appearance = parse(data.meta.style_params) as FootprintAppearance;
  return {
    variant: appearance.variant,
    fontSrc: appearance.fontSrc,
    rules: appearance.rules,
    variables: appearance.variables,
  };
};

const useStyleParams = async (authToken: string = ''): Promise<FootprintAppearance | null> => {
  if (!authToken) return null;

  try {
    const response = await getD2PStatus(authToken);
    return response;
  } catch (_) {
    return null;
  }
};

export default useStyleParams;
