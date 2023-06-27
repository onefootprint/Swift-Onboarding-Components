import { EMBEDDED_COMPONENTS_BASE_URL } from '@onefootprint/global-constants';
import styled from '@onefootprint/styled';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import createWidget from '../../utils/create-widget';
import { SecureRenderProps } from './types';
import isValidDI from './utils/is-valid-di';

const props = {
  authToken: {
    type: 'string',
    required: true,
  },
  id: {
    type: 'string',
    required: true,
    validate: ({ value }: { value?: string }) => {
      if (!isValidDI(value)) {
        throw new TypeError('Expected the id to be a valid data identifier');
      }
    },
  },
  label: {
    type: 'string',
    required: false,
  },
  canCopy: {
    type: 'boolean',
    required: false,
  },
  isHidden: {
    type: 'boolean',
    required: false,
  },
};

export const initSecureRenderChild = () =>
  createWidget({
    tag: 'secure-render',
    url: `${EMBEDDED_COMPONENTS_BASE_URL}/secure-render`,
    props,
  });

export const initSecureRenderParent = () =>
  createWidget({
    tag: 'secure-render',
    url: `${EMBEDDED_COMPONENTS_BASE_URL}/secure-render`,
    dimensions: {
      width: '100%',
      height: '100%',
    },
    props,
  });

export const SecureRenderWidget = (renderProps: SecureRenderProps) => {
  // This ID has to be unique to this component in case multiple widgets are rendered
  // on the same page
  const randomSeed = Math.floor(Math.random() * 1000);
  const containerId = `footprint-secure-render-${randomSeed}`;

  useEffectOnce(() => {
    const widget = initSecureRenderParent();
    const component = widget({ ...renderProps });
    component.render(`#${containerId}`);
  });

  return <Container id={containerId} />;
};

const Container = styled.div`
  width: 100%;
  height: 100%;
`;
