import { type OnboardingConfig } from '@onefootprint/types';
import { Divider, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import CollectedInformation from '@/playbooks/components/collected-information';

export type AmlMonitoringProps = {
  playbook: OnboardingConfig;
};

const AmlMonitoring = ({
  playbook: {
    enhancedAml: { enhancedAml, ofac, pep, adverseMedia },
  },
}: AmlMonitoringProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.details.aml-monitoring',
  });

  const monitorAml = enhancedAml || ofac || pep || adverseMedia;

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
      {monitorAml && (
        <>
          <Divider variant="secondary" />
          <Text variant="body-3" color="tertiary">
            <Text variant="body-3" color="primary" tag="span">
              {t('footer.label')}{' '}
            </Text>
            {t('footer.content')}
          </Text>
        </>
      )}
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
