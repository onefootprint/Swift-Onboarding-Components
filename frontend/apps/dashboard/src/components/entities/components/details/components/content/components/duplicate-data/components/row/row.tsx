import type { DuplicateDataItem } from '@onefootprint/types';
import { DupeKind } from '@onefootprint/types';
import { Box, CodeInline, Tag, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import StatusBadge from 'src/components/status-badge';
import getTruncatedName from 'src/utils/get-truncated-name';

export type RowProps = {
  duplicateDataItem: DuplicateDataItem;
};

const dupeKindToTranslationKey: Record<DupeKind, string> = {
  [DupeKind.ssn9]: 'dupe-kinds.ssn9',
  [DupeKind.email]: 'dupe-kinds.email',
  [DupeKind.phoneNumber]: 'dupe-kinds.phone-number',
  [DupeKind.deviceId]: 'dupe-kinds.device-id',
  [DupeKind.cookieId]: 'dupe-kinds.cookie-id',
};

const Row = ({ duplicateDataItem }: RowProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.duplicate-data',
  });
  const { dupeKinds, fpId, status, startTimestamp, data } = duplicateDataItem;

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
        <Box
          display="flex"
          gap={2}
          flexWrap="wrap"
          paddingTop={4}
          paddingBottom={4}
        >
          {dupeKinds.map(kind => (
            <Tag key={kind}>
              {t(dupeKindToTranslationKey[kind] as ParseKeys)}
            </Tag>
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
