import { IcoInfo16 } from '@onefootprint/icons';
import type { BusinessName } from '@onefootprint/types';
import { Badge, Stack, Tag, Text, Tooltip } from '@onefootprint/ui';
import isNull from 'lodash/isNull';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import useBusinessNameKindText from '../../../../hooks/use-business-name-kind-text';

type RowProps = {
  businessName: BusinessName;
  onOpen: (id: string) => void;
};

const Row = ({ businessName, onOpen }: RowProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'business-insights',
  });
  const kindT = useBusinessNameKindText();
  const { name, sources, sourceSOSFilingId, submitted, verified, kind, notes } = businessName;

  return (
    <>
      <td>
        <Stack gap={3} align="center">
          <NameContainer
            onClick={sourceSOSFilingId ? () => onOpen(sourceSOSFilingId) : undefined}
            cursor={sourceSOSFilingId ? 'pointer' : 'default'}
          >
            <Text variant="body-3" truncate>
              {name}
            </Text>
            {sources && (
              <Tooltip
                text={t('name.table.source', {
                  sources,
                })}
                position="bottom"
                alignment="start"
              >
                <IcoInfo16 />
              </Tooltip>
            )}
          </NameContainer>
          <Stack gap={2} align="center" flexShrink={0}>
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

const NameContainer = styled(Stack)`
  ${({ theme }) => css`
    width: 100%;
    gap: ${theme.spacing[2]};
    align-items: center;
    flex-shrink: 1;
    min-width: 0;
  `}
`;

export default Row;
