import { IcoInfo16 } from '@onefootprint/icons';
import { BusinessName } from '@onefootprint/types';
import { Badge, Stack, Tag, Text, Tooltip } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

type RowProps = {
  businessName: BusinessName;
};

const Row = ({ businessName }: RowProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.business-insights',
  });
  const { name, sources, submitted, verified, kind, notes } = businessName;

  return (
    <>
      <td>
        <Stack gap={3} align="center" overflow="scroll">
          {sources ? (
            <Tooltip
              text={t('name.table.source', {
                sources,
              })}
              position="bottom"
              alignment="start"
            >
              <Stack gap={2} align="center">
                {name}
                <IcoInfo16 />
              </Stack>
            </Tooltip>
          ) : (
            name
          )}
          <Stack gap={2} align="center">
            <Tag>{submitted ? t('tags.submitted') : t('tags.not-submitted')}</Tag>
            <Badge variant={verified ? 'success' : 'error'}>
              {verified ? t('tags.verified') : t('tags.not-verified')}
            </Badge>
          </Stack>
        </Stack>
      </td>
      <td>{kind ? t(`name.table.${kind}` as ParseKeys<'common'>) : '-'}</td>
      <td>
        <Text variant="body-3" maxWidth="90%" truncate>
          {notes}
        </Text>
      </td>
    </>
  );
};

export default Row;
