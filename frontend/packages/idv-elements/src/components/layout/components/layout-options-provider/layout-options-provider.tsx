import { FootprintAppearance } from '@onefootprint/footprint-js';
import constate from 'constate';
import { useEffect, useState } from 'react';

import type { Options } from '../../types';
import applyAppearance from './utils/apply-appearance';

type LayoutOptionsArgs = {
  options?: Options;
  appearance?: FootprintAppearance;
  onClose?: () => void;
};

const useLocalLayoutOptions = (args: LayoutOptionsArgs) => {
  const { options, onClose, appearance: defaultAppearance } = args;
  const fixContainerSize = options?.fixContainerSize;
  const [appearance, setAppearance] = useState<FootprintAppearance | undefined>(
    args.appearance || {},
  );

  useEffect(() => {
    if (defaultAppearance) {
      setAppearance(defaultAppearance);
    }
  }, [defaultAppearance]);

  useEffect(() => {
    applyAppearance(appearance, fixContainerSize);
  }, [appearance, fixContainerSize, args]);

  return {
    appearance,
    options,
    onClose,
  };
};
const [LayoutOptionsProvider, useLayoutOptions] = constate(
  useLocalLayoutOptions,
);

export default LayoutOptionsProvider;
export { useLayoutOptions };
