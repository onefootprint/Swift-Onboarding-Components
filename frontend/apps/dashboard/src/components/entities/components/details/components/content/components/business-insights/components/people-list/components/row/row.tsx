import { IcoInfo16 } from '@onefootprint/icons';
import { BusinessPerson } from '@onefootprint/types';
import { Badge, Stack, Tag, Tooltip } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type RowProps = {
  person: BusinessPerson;
};

const Row = ({ person }: RowProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.business-insights',
  });
  const { name, role, submitted, associationVerified, sources } = person;

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
            <Badge variant={associationVerified ? 'success' : 'error'}>
              {associationVerified ? t('tags.verified') : t('tags.not-verified')}
            </Badge>
          </Stack>
        </Stack>
      </td>
      <td>{role}</td>
    </>
  );
};

export default Row;
