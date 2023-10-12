import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button } from '@onefootprint/ui';
import React from 'react';

import HeaderTitle from '../../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../../../components/layout/components/navigation-header';
import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';

const AdditionalInfoRequired = () => {
  const { t } = useTranslation('pages.additional-info-required');
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    onboardingContext: {
      config: { orgName },
    },
  } = state.context;
  const handleClick = () => {
    send({
      type: 'requirementCompleted',
    });
  };

  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      <Container>
        <HeaderTitle
          title={t('title')}
          subtitle={t('subtitle', { tenantName: orgName })}
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
