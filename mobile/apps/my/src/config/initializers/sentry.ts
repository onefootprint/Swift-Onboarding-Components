import * as Sentry from '@sentry/react-native';

const configureSentry = () => {
  Sentry.init({
    dsn: 'https://8080d0a1920cd4eff9d24fbf32ca4115@o1280774.ingest.sentry.io/4505835034968064',
  });
};

export default configureSentry;
