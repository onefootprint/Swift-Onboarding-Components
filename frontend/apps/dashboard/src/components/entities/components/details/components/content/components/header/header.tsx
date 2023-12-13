import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { CodeInline, Stack, Typography } from '@onefootprint/ui';
import React from 'react';
import Tags from 'src/components/entities/components/tags';
import StatusBadge from 'src/components/status-badge';
import useSession from 'src/hooks/use-session';

import type { WithEntityProps } from '@/entity/components/with-entity';
import { HEADER_ACTIONS_ID } from '@/entity/constants';
import { useEntityContext } from '@/entity/hooks/use-entity-context';

type HeaderProps = WithEntityProps;

const Header = ({ entity }: HeaderProps) => {
  const { t } = useTranslation('pages.entity.header');
  const { kind } = useEntityContext();
  const {
    data: { user },
  } = useSession();

  return (
    <HeaderContainer aria-label={t(`${kind}.title`)}>
      <Row>
        <Typography variant="label-1">{t(`${kind}.title`)}</Typography>
        <Stack gap={2}>
          <StatusBadge
            status={entity.status}
            requiresManualReview={entity.requiresManualReview}
            isOnWatchlist={entity.watchlistCheck?.status === 'fail'}
            shouldShowWatchlistLabel
            watchlistLabel={t(`watchlist.on-watchlist-${kind}`)}
          />
          <Tags entity={entity} />
        </Stack>
      </Row>
      <SubHeader>
        <Row>
          <CodeInline isPrivate>{entity.id}</CodeInline>
          {user?.isFirmEmployee && entity.sandboxId && (
            <>
              <span>·</span>
              <CodeInline isPrivate>{entity.sandboxId}</CodeInline>
            </>
          )}
        </Row>
        <Row>
          <div id={HEADER_ACTIONS_ID} />
        </Row>
      </SubHeader>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `};
`;

const Row = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${theme.spacing[3]};
  `};
`;

const SubHeader = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column wrap;
    justify-content: space-between;
    height: ${theme.spacing[8]};
  `};
`;

export default Header;
