import { CodeInline, Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Tags from 'src/components/entities/components/tags';
import StatusBadge from 'src/components/status-badge';
import useSession from 'src/hooks/use-session';
import styled, { css, useTheme } from 'styled-components';

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
      <Stack align="center" gap={3} flexGrow={1}>
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
          <Tags entity={entity} />
        </Stack>
      </Stack>
      <Stack align="center" gap={3} flex={0}>
        <div id={HEADER_ACTIONS_ID} />
      </Stack>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[2]};
  `};
`;

export default Header;
