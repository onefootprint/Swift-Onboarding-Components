import type { FootprintFormRef } from '@onefootprint/footprint-js';
import footprint, { FootprintComponentKind } from '@onefootprint/footprint-js';
import styled, { css } from '@onefootprint/styled';
import { Button, Divider, media, useToast } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';

type DemoFormProps = {
  authToken: string;
};

const DemoForm = ({ authToken }: DemoFormProps) => {
  const [ref, setRef] = React.useState<FootprintFormRef | undefined>();
  const [isCustomSaveLoading, setIsCustomSaveLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!authToken) return () => {};

    const component = footprint.init({
      kind: FootprintComponentKind.Form,
      authToken,
      title: 'Add a New Card',
      variant: 'inline',
      containerId: 'footprint-secure-form',
      getRef: (formRef: FootprintFormRef) => {
        setRef(formRef);
      },
      onComplete: () => {
        toast.show({
          title: 'Success',
          description: 'Successfully completed form',
        });
      },
      onCancel: () => {
        toast.show({
          title: 'Canceled',
          description: 'User canceled form',
        });
      },
      onClose: () => {
        toast.show({
          title: 'Closed',
          description: 'User closed form',
        });
      },
    });
    component.render();

    return () => {
      component.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  const handleClick = () => {
    setIsCustomSaveLoading(true);
    ref
      ?.save()
      .then(() => {
        toast.show({
          title: 'Success',
          description: 'Successfully saved via ref',
        });
      })
      .catch((error: string) => {
        console.error(error);
        toast.show({
          title: 'Error',
          description: error,
          variant: 'error',
        });
      })
      .finally(() => {
        setIsCustomSaveLoading(false);
      });
  };

  return (
    <>
      <SecureFormContainer id="footprint-secure-form" />
      <StyledDivider />
      <Button
        variant="secondary"
        onClick={handleClick}
        loading={isCustomSaveLoading}
      >
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
