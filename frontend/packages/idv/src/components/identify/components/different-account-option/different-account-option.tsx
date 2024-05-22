import { createFontStyles, Divider, LinkButton, Stack } from '@onefootprint/ui';
import { useFlags } from 'launchdarkly-react-client-sdk';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { getLogger } from '../../../../utils/logger';
import LegalFooter from '../../../legal-footer';
import { useIdentifyMachine } from '../../state';

const { logInfo } = getLogger();

/**
 * If data was bootstrapped, show the option to provide different contact info directly to us
 * in case the bootstrap data is incorrect.
 */
const DifferentAccountOption = () => {
  const [state, send] = useIdentifyMachine();
  const { t } = useTranslation('identify', {
    keyPrefix: 'log-in-different-account',
  });
  const handleLoginWithDifferent = () => {
    logInfo('Login with different account');
    send({ type: 'loginWithDifferentAccount' });
  };

  const { config, bootstrapData } = state.context;
  const isBootstrap = !!(bootstrapData?.email || bootstrapData?.phoneNumber);
  const { ShouldHideBootstrappedLoginWithDifferent } = useFlags();
  const orgIds = new Set<string>(ShouldHideBootstrappedLoginWithDifferent);
  const showLoginWithDifferentOption =
    config && !orgIds.has(config.orgId) && isBootstrap;

  if (!showLoginWithDifferentOption) {
    return null;
  }

  return (
    <Container>
      <DividerContainer justify="center" align="center">
        <StyledDivider variant="secondary" />
        <Label justify="center" align="center">
          {t('or')}
        </Label>
      </DividerContainer>
      <Stack direction="row" justify="center" align="center" width="100%">
        <LinkButton onClick={handleLoginWithDifferent}>{t('label')}</LinkButton>
      </Stack>
      <LegalFooter />
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    margin-top: ${theme.spacing[7]};
    gap: ${theme.spacing[7]};
  `}
`;

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

export default DifferentAccountOption;
