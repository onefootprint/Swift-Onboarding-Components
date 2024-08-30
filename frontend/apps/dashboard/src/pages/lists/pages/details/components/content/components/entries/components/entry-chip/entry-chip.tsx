import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoCloseSmall16 } from '@onefootprint/icons';
import type { ListEntry } from '@onefootprint/types';
import { LoadingSpinner, Text, useToast } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import useDeleteListEntry from './hooks/use-delete-list-entry';

type EntryChipProps = {
  entry: ListEntry;
  disabled?: boolean; // injected by the PermissionsGate
};

const EntryChip = ({ entry, disabled }: EntryChipProps) => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.entries',
  });
  const router = useRouter();
  const listId = router.query.id as string;
  const deleteListEntryMutation = useDeleteListEntry(listId);
  const showRequestErrorToast = useRequestErrorToast();
  const toast = useToast();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { data, id } = entry;

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteListEntryMutation
      .mutateAsync({ entryId: id })
      .then(() => {
        toast.show({
          title: t('deleted-toast.title'),
          description: t('deleted-toast.description'),
        });
      })
      .catch(err => {
        showRequestErrorToast(err);
      });
    setIsDeleting(false);
  };

  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      key={id}
    >
      <Label>
        <Text variant="body-3" truncate>
          {data}
        </Text>
      </Label>
      {isDeleting ? (
        <Close aria-label={`Deleting ${data}`} data-disabled={disabled}>
          <LoadingSpinner size={16} />
        </Close>
      ) : (
        <Close aria-label={`Delete ${data}`} onClick={disabled ? undefined : handleDelete} data-disabled={disabled}>
          <IcoCloseSmall16 />
        </Close>
      )}
    </Container>
  );
};

const Container = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: ${theme.borderRadius.full};
    overflow: hidden;
    width: fit-content;
  `}
`;

const Label = styled.span`
  ${({ theme }) => css`
    padding: ${theme.spacing[1]} ${theme.spacing[3]} ${theme.spacing[1]}
      ${theme.spacing[4]};
    background-color: ${theme.backgroundColor.secondary};
  `}
`;

const Close = styled.button`
  ${({ theme }) => css`
    all: unset;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    height: 100%;
    padding: 0 ${theme.spacing[3]} 0 ${theme.spacing[2]};
    background-color: ${theme.backgroundColor.secondary};
    transition: background-color 0.1s;

    svg {
      path {
        fill: ${theme.color.quaternary};
        transition: fill 0.1s;
      }
    }

    &:before {
      content: '';
      display: block;
      position: absolute;
      left: 0;
      width: 1px;
      height: 100%;
      background-color: ${theme.borderColor.tertiary};
    }

    &:not([data-disabled='true']):hover {
      background-color: ${theme.backgroundColor.senary};

      svg {
        path {
          fill: ${theme.color.primary};
        }
      }
    }
  `}
`;

export default EntryChip;
