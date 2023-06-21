// @ts-ignore
import * as zoid from 'zoid/dist/zoid.frameworks';

const isSSR = typeof window === 'undefined';

type Options = {
  tag: string;
  url: string;
  dimensions?: {
    width: string;
    height: string;
  };
  props?: Record<string, any>;
  prerenderTemplate?: () => HTMLElement;
};

const createWidget = ({
  tag,
  url,
  dimensions,
  props,
  prerenderTemplate,
}: Options) => {
  if (isSSR) return null;
  return zoid.create({
    tag,
    url,
    dimensions,
    props,
    prerenderTemplate,
  });
};

export default createWidget;
