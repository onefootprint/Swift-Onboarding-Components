import { EMBEDDED_COMPONENTS_BASE_URL } from '@onefootprint/global-constants';
import styled from '@onefootprint/styled';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import createWidget from '../../utils/create-widget';
import { SecureFormProps, SecureFormType } from './types';

const props = {
  authToken: {
    type: 'string',
    required: true,
  },
  cardAlias: {
    type: 'string',
    required: true,
    validate: ({ value }: { value?: string }) => {
      if (value && !/^[A-Za-z0-9\-_]+$/.test(value)) {
        throw new TypeError(
          'Expected the cardAlias to be alphanumeric, dashes, or underscores',
        );
      }
    },
  },
  title: {
    type: 'string',
    required: false,
  },
  type: {
    type: 'string',
    required: false,
    validate: ({ value }: { value?: string }) => {
      const possibleValues: string[] = Object.values(SecureFormType);
      if (value && possibleValues.indexOf(value) === -1) {
        throw new TypeError(
          `Expected type to be one of ${possibleValues.join(', ')}`,
        );
      }
    },
  },
  variant: {
    type: 'string',
    required: false,
    validate: ({ value }: { value?: string }) => {
      const possibleValues: string[] = ['card', 'modal'];
      if (value && possibleValues.indexOf(value) === -1) {
        throw new TypeError(
          `Expected variant to be one of ${possibleValues.join(', ')}`,
        );
      }
    },
  },
  onSave: {
    type: 'function',
    required: false,
  },
  onCancel: {
    type: 'function',
    required: false,
  },
  onClose: {
    type: 'function',
    required: false,
  },
};

export const initSecureFormChild = () =>
  createWidget({
    tag: 'secure-form',
    url: `${EMBEDDED_COMPONENTS_BASE_URL}/secure-form`,
    props,
  });

export const initSecureFormParent = () =>
  createWidget({
    tag: 'secure-form',
    url: `${EMBEDDED_COMPONENTS_BASE_URL}/secure-form`,
    dimensions: {
      width: '100%',
      height: '100%',
    },
    props,
  });

export const SecureFormWidget = (formProps: SecureFormProps) => {
  // This ID has to be unique to this component in case multiple widgets are rendered
  // on the same page
  const randomSeed = Math.floor(Math.random() * 1000);
  const containerId = `footprint-secure-form-${randomSeed}`;

  useEffectOnce(() => {
    const widget = initSecureFormParent();
    const component = widget({ ...formProps });
    component.render(`#${containerId}`);
  });

  return <Container id={containerId} />;
};

const Container = styled.div`
  width: 100%;
  height: 100%;
`;
