import constate from 'constate';

import { LayoutOptions } from '../../types';

// TODO: belce: explore converting this to a hook that can be called from children instead
type LayoutOptionsArgs = {
  layout: LayoutOptions;
  onClose?: () => void;
};

const useLocalLayoutOptions = (args: LayoutOptionsArgs) => args;

const [LayoutOptionsProvider, useLayoutOptions] = constate(
  useLocalLayoutOptions,
);

export default LayoutOptionsProvider;
export { useLayoutOptions };
