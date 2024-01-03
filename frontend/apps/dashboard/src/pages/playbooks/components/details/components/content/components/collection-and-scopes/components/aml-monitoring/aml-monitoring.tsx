import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { type OnboardingConfig } from '@onefootprint/types';
import { Divider, Typography } from '@onefootprint/ui';
import React from 'react';

import CollectedInformation from '@/playbooks/components/collected-information';

export type AmlMonitoringProps = {
  playbook: OnboardingConfig;
};

const AmlMonitoring = ({
  playbook: {
    enhancedAml: { enhancedAml, ofac, pep, adverseMedia },
  },
}: AmlMonitoringProps) => {
  const { t } = useTranslation('pages.playbooks.details.aml-monitoring');

  return (
    <Container>
      <CollectedInformation
        title={t('title')}
        options={{
          enhancedAml,
          ofac,
          pep,
          adverseMedia,
        }}
      />
      <Divider variant="secondary" />
      <Typography variant="body-3" color="tertiary">
        <Typography variant="body-3" color="primary" as="span">
          {t('footer.label')}{' '}
        </Typography>
        {t('footer.content')}
      </Typography>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

export default AmlMonitoring;
