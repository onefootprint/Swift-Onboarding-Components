import { FootprintAppearance } from '@onefootprint/footprint-js';
import constate from 'constate';
import { useEffect, useState } from 'react';

import type { LayoutOptions } from '../../types';
import applyAppearance from './utils/apply-appearance';

type LayoutOptionsParams = {
  appearance?: FootprintAppearance;
  onClose?: () => void;
  options: LayoutOptions;
};

const useLocalLayoutOptions = ({
  appearance: initialAppearance = {},
  onClose,
  options,
}: LayoutOptionsParams) => {
  const [appearance, setAppearance] =
    useState<FootprintAppearance>(initialAppearance);

  useEffect(() => {
    applyAppearance(appearance);
  }, [appearance]);

  return { appearance, setAppearance, onClose, options };
};

const [LayoutOptionsProvider, useLayoutOptions] = constate(
  useLocalLayoutOptions,
);

export default LayoutOptionsProvider;
export { useLayoutOptions };
