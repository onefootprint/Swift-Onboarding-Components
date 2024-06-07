import { LAUNCH_DARKLY_CLIENT_SIDE_ID } from '@onefootprint/global-constants';
import { withLDProvider } from 'launchdarkly-react-client-sdk';
import type { GetServerSideProps } from 'next';

import Router from './router';

export default withLDProvider({
  clientSideID: LAUNCH_DARKLY_CLIENT_SIDE_ID,
  options: {
    streaming: false,
    allAttributesPrivate: true,
    disableSyncEventPost: true,
  },
  reactOptions: {
    useCamelCaseFlagKeys: false,
  },
})(Router);

export const getServerSideProps: GetServerSideProps = async ({ query, res }) => {
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=3600');

  return { props: { language: query.lng ?? 'en' } };
};
