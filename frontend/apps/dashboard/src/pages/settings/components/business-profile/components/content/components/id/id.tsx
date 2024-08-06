import { CodeInline, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

export type IdProps = {
  value: string;
};

const Id = ({ value }: IdProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.business-profile.id',
  });

  return (
    <Stack direction="column" gap={3} justify="center">
      <Text variant="label-3" color="tertiary">
        {t('label')}
      </Text>
      <CodeInline>{value}</CodeInline>
    </Stack>
  );
};

export default Id;
