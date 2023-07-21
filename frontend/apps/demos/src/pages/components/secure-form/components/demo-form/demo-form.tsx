import footprintComponent, {
  FootprintComponentKind,
  SecureFormType,
} from '@onefootprint/footprint-components-js';
import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

type DemoFormProps = {
  authToken: string;
  cardAlias: string;
};

const DemoForm = ({ authToken, cardAlias }: DemoFormProps) => {
  useEffectOnce(() => {
    if (!authToken) return;

    footprintComponent.render({
      kind: FootprintComponentKind.SecureForm,
      props: {
        authToken,
        cardAlias,
        title: 'Add a New Card',
        type: SecureFormType.cardAndName,
        variant: 'drawer',
      },
      containerId: 'footprint-secure-form',
    });
  });

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
