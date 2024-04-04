import type { ListEntryCreatedEvent } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type ListEntryCreatedEventHeaderProps = {
  user: string;
  event: ListEntryCreatedEvent;
};

const ListEntryCreatedEventHeader = ({
  user,
  event,
}: ListEntryCreatedEventHeaderProps) => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.activity-log.create-list-entry',
  });

  return (
    <Stack gap={3} flexWrap="wrap">
      <Text variant="label-3">{user}</Text>
      <Text variant="body-3" color="tertiary">
        {t('verb')}
      </Text>
      {event.data.entries.map(e => (
        <Pill key={e}>{e}</Pill>
      ))}
    </Stack>
  );
};

const Pill = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: ${theme.borderRadius.lg};
    background-color: ${theme.backgroundColor.secondary};
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
  `}
`;

export default ListEntryCreatedEventHeader;
