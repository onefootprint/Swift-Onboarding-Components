import type { DuplicateDataItem } from '@onefootprint/types';
import { DupeKind } from '@onefootprint/types';
import { Box, CodeInline, Tag, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import StatusBadge from 'src/components/status-badge';
import getTruncatedName from 'src/utils/get-truncated-name';

export type RowProps = {
  duplicateDataItem: DuplicateDataItem;
};

const Row = ({ duplicateDataItem }: RowProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.duplicate-data',
  });
  const { dupeKinds, fpId, status, startTimestamp, data } = duplicateDataItem;

  const dupeKindToTranslation: Record<DupeKind, string> = {
    [DupeKind.ssn9]: t('dupe-kinds.ssn9'),
    [DupeKind.email]: t('dupe-kinds.email'),
    [DupeKind.phoneNumber]: t('dupe-kinds.phone-number'),
    [DupeKind.nameDob]: t('dupe-kinds.name-dob'),
    [DupeKind.deviceId]: t('dupe-kinds.device-id'),
    [DupeKind.cookieId]: t('dupe-kinds.cookie-id'),
  };

  return (
    <>
      <td>
        <Text variant="body-3" truncate>
          {getTruncatedName(data)}
        </Text>
      </td>
      <td>
        <CodeInline truncate>{fpId}</CodeInline>
      </td>
      <td>
        <Box display="flex" gap={2} flexWrap="wrap" paddingTop={4} paddingBottom={4}>
          {dupeKinds.map(kind => (
            <Tag key={kind}>{dupeKindToTranslation[kind]}</Tag>
          ))}
        </Box>
      </td>
      <td aria-label="status badge">
        <StatusBadge status={status} />
      </td>
      <td>
        <Text variant="body-3" color="primary" truncate>
          {new Date(startTimestamp).toLocaleString('en-us', {
            month: 'numeric',
            day: 'numeric',
            year: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
          })}
        </Text>
      </td>
    </>
  );
};

export default Row;
