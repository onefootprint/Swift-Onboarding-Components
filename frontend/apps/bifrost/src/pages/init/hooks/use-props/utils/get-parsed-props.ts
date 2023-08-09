const getParsedProps = (props: string) => {
  let parsedProps;
  try {
    parsedProps = JSON.parse(decodeURIComponent(props));
  } catch (_) {
    // eslint-disable-next-line no-console
    console.warn(`Could not parse props from url. They will be ignored.`);
  }

  return parsedProps || {};
};

export default getParsedProps;
