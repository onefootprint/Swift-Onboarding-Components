import type { FootprintVariant } from '@onefootprint/footprint-js';
import footprint, {
  FootprintComponentKind,
  FootprintFormType,
} from '@onefootprint/footprint-js';
import styled, { css } from '@onefootprint/styled';
import { Button } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { COMPONENTS_AUTH_TOKEN } from 'src/config/constants';

const FormJsIntegration = () => {
  const launchForm = (variant: FootprintVariant, containerId?: string) => {
    const component = footprint.init({
      kind: FootprintComponentKind.Form,
      variant,
      authToken: COMPONENTS_AUTH_TOKEN ?? '',
      type: FootprintFormType.cardAndNameAndAddress,
      containerId,
    });
    component.render();
    return component;
  };

  useEffect(() => {
    const component = launchForm('inline', 'my-form');

    return () => {
      component.destroy();
    };
  }, []);

  return (
    <>
      <Button onClick={() => launchForm('modal')}>Modal</Button>
      <Button onClick={() => launchForm('drawer')}>Drawer</Button>
      <Container id="my-form" />
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[7]};
    border: 1px solid ${theme.borderColor.primary};
    width: 500px;
    min-width: 500px;
    height: 500px;
    min-height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
  `}
`;

export default FormJsIntegration;
