import type { FootprintFormRef } from '@onefootprint/footprint-js';
import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import styled, { css } from '@onefootprint/styled';
import { Button, Divider, media } from '@onefootprint/ui';
import React, { useEffect } from 'react';

type DemoFormProps = {
  authToken: string;
};

const DemoForm = ({ authToken }: DemoFormProps) => {
  const [ref, setRef] = React.useState<FootprintFormRef | undefined>();

  useEffect(() => {
    if (!authToken) return () => {};

    const component = footprint.init({
      kind: FootprintComponentKind.Form,
      authToken,
      title: 'Add a New Card',
      variant: 'inline',
      containerId: 'footprint-secure-form',
      getRef: formRef => {
        setRef(formRef);
      },
      onComplete: () => console.log('complete'),
    });
    component.render();

    return () => {
      component.destroy();
    };
  }, [authToken]);

  const triggerSave = async () => {
    await ref?.save();
    console.log('saved via ref');
  };

  return (
    <>
      <SecureFormContainer id="footprint-secure-form" />
      <StyledDivider />
      <Button variant="secondary" onClick={triggerSave}>
        Custom Save via Ref
      </Button>
    </>
  );
};

const SecureFormContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[2]};
      min-height: 400px;
    `}
  `}
`;

const StyledDivider = styled(Divider)`
  margin: ${({ theme }) => theme.spacing[4]} 0;
`;

export default DemoForm;
