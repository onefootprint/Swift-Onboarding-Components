import * as Sentry from '@sentry/react-native';

import { IS_DEV } from '../constants';

const configureSentry = () => {
  if (IS_DEV) return;
  Sentry.init({
    dsn: 'https://8080d0a1920cd4eff9d24fbf32ca4115@o1280774.ingest.sentry.io/4505835034968064',
  });
};

export default configureSentry;
