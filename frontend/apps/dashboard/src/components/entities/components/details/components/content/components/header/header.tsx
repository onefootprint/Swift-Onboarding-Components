import Labels from '@/entities/components/labels';
import { Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import StatusBadge from 'src/components/status-badge';
import styled, { css } from 'styled-components';
import Tags from './components/tags';

import type { WithEntityProps } from '@/entity/components/with-entity';
import { HEADER_ACTIONS_ID } from '@/entity/constants';
import { useEntityContext } from '@/entity/hooks/use-entity-context';
import IdDropdown from './components/id-dropdown';

type HeaderProps = WithEntityProps;

const Header = ({ entity }: HeaderProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entity.header' });
  const { kind } = useEntityContext();

  return (
    <HeaderContainer aria-label={t(`${kind}.title` as ParseKeys<'common'>)}>
      <Stack direction="column" flexGrow={1} gap={2} width="100%">
        <FirstRow align="center" gap={3} flexGrow={1}>
          <Main>
            <Text variant="label-1">{t(`${kind}.title` as ParseKeys<'common'>)}</Text>
            <IdDropdown entity={entity} />
            <Text variant="label-1">⋅</Text>
            <Stack gap={2}>
              <StatusBadge
                status={entity.status}
                requiresManualReview={entity.requiresManualReview}
                isOnWatchlist={entity.watchlistCheck?.status === 'fail'}
                shouldShowWatchlistLabel
                watchlistLabel={t(`watchlist.on-watchlist-${kind}` as ParseKeys<'common'>)}
              />
              <Labels entity={entity} />
            </Stack>
          </Main>
          <Stack align="center" gap={3} flex={0}>
            <div id={HEADER_ACTIONS_ID} />
          </Stack>
        </FirstRow>
        <Tags entity={entity} />
      </Stack>
    </HeaderContainer>
  );
};

const FirstRow = styled(Stack)`
  align-items: center;
  justify-content: space-between;
`;

const Main = styled(Stack)`
  ${({ theme }) => css`
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: ${theme.spacing[2]};
  `};
`;

const HeaderContainer = styled.header`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[2]};
    align-items: center;
    justify-content: space-between;
  `};
`;

export default Header;
