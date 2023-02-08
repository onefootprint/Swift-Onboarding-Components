import type { GetServerSideProps } from 'next';

import { API_BASE_URL } from '../../config/constants';

const getServerSideProps: GetServerSideProps = async context => {
  const obKey = context.query['ob-key'];
  const res = await fetch(`${API_BASE_URL}/org/onboarding_config`, {
    headers: {
      'X-Onboarding-Config-Key': obKey as string,
    },
  });
  const data = await res.json();
  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      tenant: {
        logoUrl: data.logo_url,
        name: data.org_name,
        obKey,
      },
    },
  };
};

export default getServerSideProps;
