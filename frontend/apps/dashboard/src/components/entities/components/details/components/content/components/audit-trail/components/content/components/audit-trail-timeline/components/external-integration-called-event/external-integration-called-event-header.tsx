import type { ExternalIntegrationCalledData } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type ExternalIntegrationCalledEventHeaderProps = {
  data: ExternalIntegrationCalledData;
};

const ExternalIntegrationCalledEventHeader = ({ data }: ExternalIntegrationCalledEventHeaderProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.external-integration-called',
  });

  return (
    <Text variant="body-3">
      {t(`${data.successful}`, {
        kind: t(data.integration),
      })}
    </Text>
  );
};

export default ExternalIntegrationCalledEventHeader;
