import type { FootprintVariant } from '@onefootprint/footprint-js';
import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import { Button } from '@onefootprint/ui';
import { DEMO_FORM_AUTH_TOKEN } from 'src/config/constants';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

const FormJsIntegration = () => {
  const launchForm = (variant: FootprintVariant, containerId?: string) => {
    const component = footprint.init({
      kind: FootprintComponentKind.Form,
      variant,
      authToken: DEMO_FORM_AUTH_TOKEN ?? '',
      containerId,
    });
    component.render();
    return component;
  };

  useEffectOnce(() => {
    const component = launchForm('inline', 'my-form');

    return () => {
      component.destroy();
    };
  });

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
