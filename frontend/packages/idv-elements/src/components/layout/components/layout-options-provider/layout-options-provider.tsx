import constate from 'constate';

import { LayoutOptions } from '../../types';

type LayoutOptionsArgs = {
  layout: LayoutOptions;
  onClose: () => void;
};

const useLocalLayoutOptions = (args: LayoutOptionsArgs) => args;

const [LayoutOptionsProvider, useLayoutOptions] = constate(
  useLocalLayoutOptions,
);

export default LayoutOptionsProvider;
export { useLayoutOptions };
