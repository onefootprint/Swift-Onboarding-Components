import { IcoInfo16 } from '@onefootprint/icons';
import type { BusinessPerson } from '@onefootprint/types';
import { Badge, Stack, Tag, Text, Tooltip } from '@onefootprint/ui';
import isNull from 'lodash/isNull';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

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
        <Stack gap={3} align="center">
          <NameContainer>
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
            {!isNull(associationVerified) && (
              <Badge variant={associationVerified ? 'success' : 'error'}>
                {associationVerified ? t('tags.verified') : t('tags.not-verified')}
              </Badge>
            )}
          </Stack>
        </Stack>
      </td>
      <td>{role}</td>
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
