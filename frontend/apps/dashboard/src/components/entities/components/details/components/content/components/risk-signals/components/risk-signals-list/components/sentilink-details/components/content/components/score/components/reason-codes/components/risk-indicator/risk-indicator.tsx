import { IcoArrowDown16, IcoArrowUp16 } from '@onefootprint/icons';
import { SentilinkFraudLevel } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
type RiskIndicatorProps = {
  fraudLevel: SentilinkFraudLevel;
};
export const RiskIndicator = ({ fraudLevel }: RiskIndicatorProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'risk-signals.sentilink.details.risk-indicator',
  });

  return (
    <Stack gap={2} alignItems="center">
      {/* placeholder, we are waiting on some icons */}
      {fraudLevel === SentilinkFraudLevel.moreFraudy ? (
        <IcoArrowUp16 aria-label={t('more-icon-aria-label')} color="error" />
      ) : (
        <IcoArrowDown16 aria-label={t('less-icon-aria-label')} color="success" />
      )}
      <Text variant="caption-1" color={fraudLevel === SentilinkFraudLevel.moreFraudy ? 'error' : 'success'}>
        {t(fraudLevel)}
      </Text>
    </Stack>
  );
};

export default RiskIndicator;
