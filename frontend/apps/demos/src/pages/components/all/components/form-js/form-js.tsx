import footprint, {
  FootprintComponentKind,
  FootprintFormType,
  FootprintVariant,
} from '@onefootprint/footprint-js';
import styled from '@onefootprint/styled';
import { Button } from '@onefootprint/ui';
import React, { useEffect } from 'react';

const authToken = 'tok_SkgpMYfPAqkl3AaLrtsQsfNxKqxbWF88LN'; // process.env.NEXT_PUBLIC_COMPONENTS_AUTH_TOKEN as string;

const FormJsIntegration = () => {
  const launchForm = (variant: FootprintVariant, containerId?: string) => {
    const component = footprint.init({
      kind: FootprintComponentKind.Form,
      variant,
      authToken,
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
  width: 500px;
  min-width: 500px;
  height: 500px;
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default FormJsIntegration;
