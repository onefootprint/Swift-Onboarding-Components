import type { GetServerSideProps } from 'next';

import { API_BASE_URL } from '../../config/constants';

const getServerSideProps: GetServerSideProps = async context => {
  const obKey = context.query['ob-key'];
  if (!obKey) {
    return { notFound: true };
  }
  try {
    const request = await fetch(`${API_BASE_URL}/org/onboarding_config`, {
      headers: {
        'X-Onboarding-Config-Key': obKey as string,
      },
    });
    if (!request.ok) {
      throw new Error('Network response was not OK');
    }
    const response = await request.json();
    return {
      props: {
        tenant: {
          logoUrl: response.logo_url,
          name: response.org_name,
          obKey,
        },
      },
    };
  } catch (_e) {
    return { notFound: true };
  }
};

export default getServerSideProps;
