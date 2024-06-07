import { IcoArrowDown16, IcoPin24 } from '@onefootprint/icons';
import { ActorKind } from '@onefootprint/types';
import { Divider, Stack, Text, createFontStyles } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useHover } from 'usehooks-ts';

import useCurrentEntityAnnotations from '@/entity/hooks/use-current-entity-annotations';

import PinnedNote from './components/pinned-note';

enum SortOrder {
  ascending = 'ascending',
  descending = 'descending',
}

const PinnedNotes = () => {
  const { data } = useCurrentEntityAnnotations();
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.pinned-notes',
  });
  const [sortedData, setSortedData] = useState(data);
  const [sortDirection, setSortDirection] = useState(SortOrder.descending);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const isHover = useHover(sortButtonRef);

  useEffect(() => {
    if (data && sortDirection === SortOrder.descending) {
      setSortedData(data.sort(sortDataDescending));
    } else if (data && sortDirection === SortOrder.ascending) {
      setSortedData(data.sort(sortDataAscending));
    }
  }, [data, sortDirection]);

  const sortDataAscending = (a: { timestamp: string }, b: { timestamp: string }) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();

  const sortDataDescending = (a: { timestamp: string }, b: { timestamp: string }) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();

  const handleSortData = () => {
    if (sortDirection === SortOrder.descending) {
      setSortDirection(SortOrder.ascending);
    } else {
      setSortDirection(SortOrder.descending);
    }
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Container>
      <HeaderTitle>
        <Stack direction="row" gap={2}>
          <IcoPin24 />
          <Text variant="label-2">{t('title')}</Text>
        </Stack>
        {data.length > 1 ? (
          <SortButton as="button" onClick={() => handleSortData()} ref={sortButtonRef} data-hover={isHover}>
            <Stack direction="row" gap={3} align="center" justify="center">
              {sortDirection === SortOrder.descending ? t('sort-ascending') : t('sort-descending')}
              <Stack height="100%">
                <StyledIconArrow direction={sortDirection} color={isHover ? 'primary' : 'tertiary'} />
              </Stack>
            </Stack>
          </SortButton>
        ) : null}
      </HeaderTitle>
      <NotesContainer>
        {sortedData?.map(({ note, id, source, timestamp }, i) => (
          <Fragment key={id}>
            <PinnedNote
              author={
                source.kind === ActorKind.organization
                  ? source.member
                  : t(`note-added-by-source.${source.kind}` as ParseKeys<'common'>)
              }
              key={id}
              note={note}
              timestamp={timestamp}
              noteId={id}
            />
            {i !== data.length - 1 && <StyledDivider />}
          </Fragment>
        ))}
      </NotesContainer>
    </Container>
  );
};

const SortButton = styled(Stack)`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    all: unset;
    color: ${theme.color.tertiary};
    cursor: pointer;
    user-select: none;
    transition: color 0.2s ease-in-out;

    &[data-hover='true'] {
      color: ${theme.color.primary};
    }
  `}
`;

const StyledIconArrow = styled(IcoArrowDown16)<{ direction: SortOrder }>`
  ${({ direction }) => css`
    transform: ${direction === SortOrder.descending ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: transform 0.2s ease-in-out;
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    gap: ${theme.spacing[4]};
    margin-bottom: ${theme.spacing[9]};
  `}
`;

const HeaderTitle = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing[2]};
    margin-bottom: ${theme.spacing[3]};
  `}
`;

const NotesContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    width: calc(100% - ${theme.spacing[5]}*2);
    margin: auto;
  `}
`;

export default PinnedNotes;
