import styled, { css } from '@onefootprint/styled';
import { createFontStyles, Divider, LinkButton, Stack } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import LegalFooter from '../legal-footer';

type DifferentAccountProps = {
  onClick: () => void;
};

const DifferentAccount = ({ onClick }: DifferentAccountProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'identify.components.log-in-different-account',
  });
  return (
    <>
      <DividerContainer justify="center" align="center">
        <StyledDivider variant="secondary" />
        <Label justify="center" align="center">
          {t('or')}
        </Label>
      </DividerContainer>
      <LinkButton onClick={onClick} size="compact">
        {t('label')}
      </LinkButton>
      <LegalFooter />
    </>
  );
};

const DividerContainer = styled(Stack)`
  ${({ theme }) => css`
    position: relative;
    isolation: isolate;
    width: 100%;
    min-height: ${theme.spacing[6]};
  `}
`;

const Label = styled(Stack)`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    color: ${theme.color.quaternary};
    background-color: ${theme.backgroundColor.primary};
    padding: ${theme.spacing[2]} ${theme.spacing[4]} 6px ${theme.spacing[4]};
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  `};
`;

const StyledDivider = styled(Divider)`
  z-index: 1;
`;

export default DifferentAccount;
