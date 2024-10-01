import type { GetServerSideProps } from 'next';

type GetOnboardingConfigRequest = {
  key: string;
};

const { API_BASE_URL } = process.env;

const getOnboardingConfig = async (params: GetOnboardingConfigRequest) => {
  const response = await fetch(`${API_BASE_URL}/hosted/onboarding/config`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Onboarding-Config-Key': params.key,
    },
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const obConfig = await response.json();
  return obConfig;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (!query.ob_key) {
    return { notFound: true };
  }
  try {
    const obConfig = await getOnboardingConfig({ key: query.ob_key as string });
    return { props: { obConfig } };
  } catch (_e) {
    return { notFound: true };
  }
};

export { default } from './preview';
