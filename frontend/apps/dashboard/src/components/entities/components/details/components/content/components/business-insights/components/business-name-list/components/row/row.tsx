import { IcoInfo16 } from '@onefootprint/icons';
import { BusinessName } from '@onefootprint/types';
import { Badge, Stack, Tag, Text, Tooltip } from '@onefootprint/ui';
import isNull from 'lodash/isNull';
import { useTranslation } from 'react-i18next';
import useBusinessNameKindText from '../../../../hooks/use-business-name-kind-text';

type RowProps = {
  businessName: BusinessName;
  onOpen: (id: string) => void;
};

const Row = ({ businessName, onOpen }: RowProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.business-insights',
  });
  const kindT = useBusinessNameKindText();
  const { name, sources, sourceSOSFilingId, submitted, verified, kind, notes } = businessName;

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
              <Stack
                gap={2}
                align="center"
                onClick={sourceSOSFilingId ? () => onOpen(sourceSOSFilingId) : undefined}
                cursor={sourceSOSFilingId ? 'pointer' : 'default'}
              >
                {name}
                <IcoInfo16 />
              </Stack>
            </Tooltip>
          ) : (
            name
          )}
          <Stack gap={2} align="center">
            {!isNull(submitted) && <Tag>{submitted ? t('tags.submitted') : t('tags.not-submitted')}</Tag>}
            {!isNull(verified) && (
              <Badge variant={verified ? 'success' : 'error'}>
                {verified ? t('tags.verified') : t('tags.not-verified')}
              </Badge>
            )}
          </Stack>
        </Stack>
      </td>
      <td>{kindT(kind)}</td>
      <td>
        <Text variant="body-3" maxWidth="90%" truncate>
          {notes}
        </Text>
      </td>
    </>
  );
};

export default Row;
