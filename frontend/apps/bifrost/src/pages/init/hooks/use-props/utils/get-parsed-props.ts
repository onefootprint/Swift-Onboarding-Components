import { Logger } from '@onefootprint/idv-elements';

const getParsedProps = (props: string) => {
  let parsedProps;
  try {
    parsedProps = JSON.parse(decodeURIComponent(props));
  } catch (_) {
    // eslint-disable-next-line no-console
    console.warn(`Could not parse props from url. They will be ignored.`);
    Logger.warn(
      `Could not parse props from url. They will be ignored.`,
      'bifrost-use-props',
    );
  }

  return parsedProps || {};
};

export default getParsedProps;
