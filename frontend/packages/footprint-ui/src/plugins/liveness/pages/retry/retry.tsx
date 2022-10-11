import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import { useIsMutating } from '@tanstack/react-query';
import React from 'react';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../components/header-title';
import { useLivenessMachine } from '../../components/machine-provider';
import useRegisterBiometric from '../../hooks/use-register-biometric';
import useSkipLiveness from '../../hooks/use-skip-liveness';
import { Events } from '../../utils/state-machine/types';

const Retry = () => {
  const { t } = useTranslation('pages.retry');
  const [state, send] = useLivenessMachine();
  const { authToken, tenant } = state.context;
  const isMutating = useIsMutating();
  const registerBiometric = useRegisterBiometric();
  const skipLivenessMutation = useSkipLiveness();

  const handleSkip = () => {
    if (!authToken || !tenant?.pk) {
      return;
    }
    skipLivenessMutation.mutate(
      { authToken, tenantPk: tenant.pk },
      {
        onSuccess: () => {
          send({ type: Events.skipped });
        },
      },
    );
  };

  return (
    <Container>
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <Button onClick={registerBiometric} loading={!!isMutating} fullWidth>
        {t('cta')}
      </Button>
      <Button
        loading={skipLivenessMutation.isLoading}
        onClick={handleSkip}
        fullWidth
      >
        {t('skip')}
      </Button>
    </Container>
  );
};

const Container = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[8]}px;
  `}
`;

export default Retry;
