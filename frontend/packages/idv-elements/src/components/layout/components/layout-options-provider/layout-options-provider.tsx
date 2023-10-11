import constate from 'constate';
import { useState } from 'react';

import type { Options } from '../../types';
import type {
  NavigationHeaderBGVariant,
  NavigationHeaderPositionTypes,
} from '../navigation-header/types';

type LayoutOptionsArgs = {
  options?: Options;
  onClose?: () => void;
};

export type HeaderOptions = {
  background: NavigationHeaderBGVariant;
  position: NavigationHeaderPositionTypes;
};

export type FooterOptions = {
  visible: boolean;
  position: 'sticky' | 'relative';
  height: number;
};

const hasUpdatedProp = ({
  newProps,
  oldProps,
}: {
  newProps: Object;
  oldProps: Object;
}) => {
  let hasNewPropVal = false;
  Object.keys(newProps).every(key => {
    if (
      oldProps[key as keyof typeof oldProps] !==
      newProps[key as keyof typeof newProps]
    ) {
      hasNewPropVal = true;
      return false;
    }
    return true;
  });
  return hasNewPropVal;
};

const useLocalLayoutOptions = ({ options, onClose }: LayoutOptionsArgs) => {
  const [header, setHeader] = useState<HeaderOptions>({
    background: 'primary',
    position: 'sticky',
  });
  const updateHeader = (headerOptions: Partial<HeaderOptions>) => {
    if (hasUpdatedProp({ newProps: headerOptions, oldProps: header }))
      setHeader(prev => ({ ...prev, ...headerOptions }));
  };

  const [footer, setFooter] = useState<FooterOptions>({
    visible: true,
    position: 'sticky',
    height: 0,
  });
  const updateFooter = (footerOptions: Partial<FooterOptions>) => {
    if (hasUpdatedProp({ newProps: footerOptions, oldProps: footer }))
      setFooter(prev => ({ ...prev, ...footerOptions }));
  };

  return {
    options,
    onClose,
    header: {
      options: header,
      set: updateHeader,
    },
    footer: {
      options: footer,
      set: updateFooter,
    },
  };
};

const [LayoutOptionsProvider, useLayoutOptions] = constate(
  useLocalLayoutOptions,
);

export default LayoutOptionsProvider;
export { useLayoutOptions };
