import { IcoArrowTopRight16 } from '@onefootprint/icons';
import { type DuplicateDataItem, IdDI } from '@onefootprint/types';
import { CodeInline, LinkButton, Stack, Text } from '@onefootprint/ui';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

type DuplicateUserProps = {
  dupe: DuplicateDataItem;
};
const DuplicateUser = ({ dupe }: DuplicateUserProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'duplicate-data.drawer',
  });
  const firstName = dupe.data.find(d => d.identifier === IdDI.firstName)?.value?.toString();
  const lastInitial = dupe.data.find(d => d.identifier === IdDI.lastName)?.transforms.prefix_1;

  return (
    <Stack
      padding={5}
      direction="column"
      gap={5}
      borderColor="primary"
      borderWidth={1}
      borderStyle="solid"
      borderRadius="default"
    >
      <Stack direction="column" gap={3}>
        <Stack alignItems="center" justifyContent="space-between">
          <Text variant="body-3" color="tertiary">
            {t('name')}
          </Text>
          <Text variant="label-3">
            {firstName} {lastInitial}.
          </Text>
        </Stack>
        <Stack alignItems="center" justifyContent="space-between">
          <Text variant="body-3" color="tertiary">
            {t('fp-id')}
          </Text>
          <CodeInline>{dupe.fpId}</CodeInline>
        </Stack>
        <Stack alignItems="center" justifyContent="space-between">
          <Text variant="body-3" color="tertiary">
            {t('created-at')}
          </Text>
          <Text variant="label-3">{dayjs(dupe.startTimestamp).format('MM/DD/YY, h:mma').toLowerCase()}</Text>
        </Stack>
      </Stack>
      <LinkButton iconPosition="right" iconComponent={IcoArrowTopRight16} href={`/users/${dupe.fpId}`}>
        {t('view-user-details')}
      </LinkButton>
    </Stack>
  );
};

export default DuplicateUser;
