import footprint, {
  FootprintComponentKind,
  FootprintFormType,
} from '@onefootprint/footprint-js';
import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import React, { useEffect } from 'react';

type DemoFormProps = {
  authToken: string;
};

const DemoForm = ({ authToken }: DemoFormProps) => {
  useEffect(() => {
    if (!authToken) return () => {};

    const component = footprint.init({
      kind: FootprintComponentKind.Form,
      authToken,
      title: 'Add a New Card',
      type: FootprintFormType.cardAndName,
      variant: {
        containerId: 'footprint-secure-form',
      },
    });
    component.render();

    return () => {
      component.destroy();
    };
  }, [authToken]);

  return <SecureFormContainer id="footprint-secure-form" />;
};

const SecureFormContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[2]};
      min-height: 500px;
    `}
  `}
`;

export default DemoForm;
