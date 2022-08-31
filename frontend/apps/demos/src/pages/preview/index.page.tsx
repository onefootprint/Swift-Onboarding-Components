import type { GetServerSideProps } from 'next';

type GetOnboardingConfigRequest = {
  key: string;
};

const { API_BASE_URL } = process.env;

const getOnboardingConfig = async (params: GetOnboardingConfigRequest) => {
  const response = await fetch(`${API_BASE_URL}/org/onboarding_config`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Onboarding-Config-Key': params.key,
    },
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const tenant = await response.json();
  return tenant;
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (!query.ob_key) {
    return { notFound: true };
  }
  try {
    const tenant = await getOnboardingConfig({ key: query.ob_key as string });
    return { props: { tenant } };
  } catch (error) {
    return { notFound: true };
  }
};

export { default } from './preview';
