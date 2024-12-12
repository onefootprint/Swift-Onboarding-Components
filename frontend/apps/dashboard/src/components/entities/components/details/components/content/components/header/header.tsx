import { Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import StatusBadge from 'src/components/status-badge';
import styled from 'styled-components';
import Tags from './components/tags';

import type { WithEntityProps } from '@/entity/components/with-entity';
import { HEADER_ACTIONS_ID } from '@/entity/constants';
import { useEntityContext } from '@/entity/hooks/use-entity-context';
import usePermissions from 'src/hooks/use-permissions';
import FraudLabel from './components/fraud-label';
import IdDropdown from './components/id-dropdown';
import Labels from './components/labels';

type HeaderProps = WithEntityProps & {
  isDisabled?: boolean;
};

const Header = ({ entity, isDisabled }: HeaderProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'header' });
  const { kind } = useEntityContext();
  const { hasPermission } = usePermissions();
  const hasLabelAndTagPermissions = hasPermission('label_and_tag');

  return (
    <HeaderContainer
      direction="column"
      gap={1}
      align="flex-start"
      minHeight="28px"
      justifyContent="center"
      tag="header"
      aria-label={t(`${kind}.title` as ParseKeys<'common'>)}
      data-is-disabled={isDisabled}
    >
      <Stack width="100%" justify="space-between" align="center" gap={3}>
        <Stack align="center" gap={3} paddingLeft={2}>
          <Text variant="heading-5" tag="h1">
            {t(`${kind}.title` as ParseKeys<'common'>)}
          </Text>
          <IdDropdown entity={entity} />
          <Text variant="heading-5" tag="span">
            ⋅
          </Text>
          <StatusBadge
            status={entity.status}
            requiresManualReview={entity.requiresManualReview}
            isOnWatchlist={entity.watchlistCheck?.status === 'fail'}
            shouldShowWatchlistLabel
            watchlistLabel={t(`watchlist.on-watchlist-${kind}` as ParseKeys<'common'>)}
          />
          <Labels entity={entity} />
          <FraudLabel />
        </Stack>
        <div id={HEADER_ACTIONS_ID} />
      </Stack>
      {hasLabelAndTagPermissions && <Tags />}
    </HeaderContainer>
  );
};

const HeaderContainer = styled(Stack)`
    &[data-is-disabled='true'] {
      opacity: 0.5;
      pointer-events: none;
      user-select: none;
    }
`;

export default Header;
