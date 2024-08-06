import { IcoCheck16 } from '@onefootprint/icons';
import { Badge, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type FeatureCheckProps = {
  children: string;
  soon?: boolean;
};

const FeatureCheck = ({ children, soon }: FeatureCheckProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.pricing' });
  return (
    <Stack direction="row" marginTop={2} justify="space-between">
      <Stack direction="row" gap={2} align="start">
        <Stack flexGrow={0} marginTop={2}>
          <IcoCheck16 />
        </Stack>
        <Stack flexGrow={1}>
          <Text variant="label-3">{children}</Text>
        </Stack>
      </Stack>
      {soon && <Badge variant="info">{t('soon')}</Badge>}
    </Stack>
  );
};

export default FeatureCheck;
