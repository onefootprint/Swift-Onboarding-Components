import {
  HeaderTitle,
  NavigationHeader,
} from '@onefootprint/footprint-elements';
import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';
import { Events } from 'src/utils/state-machine/onboarding-requirements';
import styled, { css } from 'styled-components';

import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';

const AdditionalInfoRequired = () => {
  const { t } = useTranslation('pages.additional-info-required');
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    onboardingContext: {
      config: { name },
    },
  } = state.context;
  const handleClick = () => {
    send({
      type: Events.requirementCompleted,
    });
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirmClose: true }} />
      <Container>
        <HeaderTitle
          title={t('title')}
          subtitle={t('subtitle', { tenantName: name })}
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
    row-gap: ${theme.spacing[8]};
    justify-content: center;
    align-items: center;
  `}
`;

export default AdditionalInfoRequired;
