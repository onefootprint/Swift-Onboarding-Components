import constate from 'constate';

import type { Options } from '../../types';

type LayoutOptionsArgs = {
  options?: Options;
  onClose?: () => void;
};

const useLocalLayoutOptions = ({ options, onClose }: LayoutOptionsArgs) => ({
  options,
  onClose,
});
const [LayoutOptionsProvider, useLayoutOptions] = constate(
  useLocalLayoutOptions,
);

export default LayoutOptionsProvider;
export { useLayoutOptions };
