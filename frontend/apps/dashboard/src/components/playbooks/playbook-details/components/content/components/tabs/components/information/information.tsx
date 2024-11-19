import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { Stack, Text } from '@onefootprint/ui';
import { CodeInline } from '@onefootprint/ui';
import { format } from 'date-fns';
import { uniqueId } from 'lodash';
import { useTranslation } from 'react-i18next';

type InformationProps = {
  playbook: OnboardingConfiguration;
};

const Information = ({ playbook }: InformationProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'settings' });

  const fields = [
    {
      label: t('playbook-information.playbook-name'),
      value: playbook.name,
      type: 'text',
    },
    {
      label: t('playbook-information.playbook-type'),
      value: playbook.kind.toUpperCase(),
      type: 'text',
    },
    {
      label: t('playbook-information.playbook-id'),
      value: playbook.id,
      type: 'code',
    },
    {
      label: t('playbook-information.playbook-key'),
      value: playbook.key,
      type: 'code',
    },
    {
      label: t('playbook-information.created-at'),
      value: formatDate(playbook.createdAt),
      type: 'text',
    },
  ];
  return (
    <Stack direction="column" gap={5}>
      {fields.map(field => (
        <Stack direction="column" gap={2} key={uniqueId()}>
          <Text variant="label-2">{field.label}</Text>
          {field.type === 'text' ? (
            <Text variant="body-2" color="tertiary">
              {field.value}
            </Text>
          ) : (
            <CodeInline
              tooltip={{
                position: 'right',
              }}
            >
              {field.value}
            </CodeInline>
          )}
        </Stack>
      ))}
    </Stack>
  );
};

const formatDate = (date: string) => {
  return format(new Date(date), 'MMMM d, yyyy');
};

export default Information;
