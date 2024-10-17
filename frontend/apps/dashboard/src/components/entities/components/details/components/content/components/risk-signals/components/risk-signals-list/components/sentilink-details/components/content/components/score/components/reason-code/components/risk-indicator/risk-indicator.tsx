import { IcoArrowCircleUp16 } from '@onefootprint/icons';
import { SentilinkFraudLevel } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type RiskIndicatorProps = {
  fraudLevel: SentilinkFraudLevel;
};

export const RiskIndicator = ({ fraudLevel }: RiskIndicatorProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'risk-signals.sentilink.details.risk-indicator',
  });

  return (
    <Stack gap={2} alignItems="center">
      <IconContainer>
        {fraudLevel === SentilinkFraudLevel.moreFraudy ? (
          <IcoArrowCircleUp16 aria-label={t('more-icon-aria-label')} color="error" />
        ) : (
          <IcoArrowCircleDown16 aria-label={t('less-icon-aria-label')} color="success" />
        )}
      </IconContainer>
      <Text variant="caption-2" color={fraudLevel === SentilinkFraudLevel.moreFraudy ? 'error' : 'success'}>
        {t(fraudLevel)}
      </Text>
    </Stack>
  );
};

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IcoArrowCircleDown16 = styled(IcoArrowCircleUp16)`
  transform: rotate(180deg);
`;

export default RiskIndicator;
