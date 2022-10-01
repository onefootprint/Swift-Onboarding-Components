import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import { HeaderTitle, NavigationHeader } from 'footprint-elements';
import React from 'react';
import { Events, MachineContext } from 'src/utils/state-machine/onboarding';
import styled, { css } from 'styled-components';

import useOnboardingMachine from '../../hooks/use-onboarding-machine';

// TODO: Move this to the new onboarding requirements page to check for the plugins required later.
const AdditionalInfoRequired = () => {
  const { t } = useTranslation('pages.onboarding.additional-info-required');
  const [state, send] = useOnboardingMachine();
  const context = state.context as MachineContext;
  const handleClick = () => {
    send({
      type: Events.additionalInfoRequired,
    });
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirmClose: true }} />
      <Container>
        <HeaderTitle
          title={t('title')}
          subtitle={t('subtitle', { tenantName: context.tenant.name })}
        />
        <Button fullWidth onClick={handleClick}>
          {t('cta')}
        </Button>
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[8]}px;
    justify-content: center;
    align-items: center;
  `}
`;

export default AdditionalInfoRequired;
