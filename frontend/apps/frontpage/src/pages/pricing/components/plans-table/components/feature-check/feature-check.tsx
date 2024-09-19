import { IcoCheckSmall16 } from '@onefootprint/icons';
import { Badge, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type FeatureCheckProps = {
  children: string;
  soon?: boolean;
};

const FeatureCheck = ({ children, soon }: FeatureCheckProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.pricing' });
  return (
    <Stack direction="row" justify="space-between">
      <Stack direction="row" gap={3} align="start" flexGrow={1}>
        <Stack flex={0} height="1.5rem" align="center" justify="center">
          <IcoCheckSmall16 />
        </Stack>
        <Text variant="body-2">{children}</Text>
      </Stack>
      {soon && <Badge variant="info">{t('soon')}</Badge>}
    </Stack>
  );
};

export default FeatureCheck;
