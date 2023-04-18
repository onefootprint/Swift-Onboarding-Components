import type { GetServerSideProps } from 'next';

import { API_BASE_URL } from '../../config/constants';

const getServerSideProps: GetServerSideProps = async context => {
  console.log('tenant request', API_BASE_URL);
  const obKey = context.query['ob-key'];
  if (!obKey) {
    return { notFound: true };
  }
  const response = await fetch(`${API_BASE_URL}/org/onboarding_config`, {
    headers: {
      'X-Onboarding-Config-Key': obKey as string,
    },
  }).then(res => res.json());

  if (response.error || !response.ok) {
    return { notFound: true };
  }

  return {
    props: {
      tenant: {
        logoUrl: response.logo_url,
        name: response.org_name,
        obKey,
      },
    },
  };
};

export default getServerSideProps;
