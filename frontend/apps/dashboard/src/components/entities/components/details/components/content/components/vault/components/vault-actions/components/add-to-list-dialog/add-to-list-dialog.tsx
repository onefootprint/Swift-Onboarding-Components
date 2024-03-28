import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoArrowTopRight16 } from '@onefootprint/icons';
import { type DecryptResponse, type List, ListKind } from '@onefootprint/types';
import type { SelectOption } from '@onefootprint/ui';
import {
  Dialog,
  LinkButton,
  Select,
  Stack,
  Text,
  useToast,
} from '@onefootprint/ui';
import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useCurrentEntity from 'src/components/entities/components/details/hooks/use-current-entity';

import useAddEntries from '@/lists/pages/details/components/content/components/entries/components/add-entries-dialog/hooks/use-add-entries';
import useLists from '@/lists/pages/list/hooks/use-lists';

import useDecrypt from '../../hooks/use-decrypt-controls/hooks/use-decrypt-fields/hooks/use-decrypt';
import getAttributeForListKind from './utils/get-attribute-for-list-kind';
import getEntityDataForListKind from './utils/get-entity-data-for-list-kind';
import hasDataForListKind from './utils/has-data-for-list-kind';

type FormData = {
  list: SelectOption<string>;
};

type AddToListDialogProps = {
  open: boolean;
  onClose: () => void;
};

const AddToListDialog = ({ open, onClose }: AddToListDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.add-to-list',
  });
  const { data: entity } = useCurrentEntity();
  const { data } = useLists();
  const showRequestErrorToast = useRequestErrorToast();
  const toast = useToast();
  const [listId, setListId] = React.useState<string>('');
  const addEntriesMutation = useAddEntries(listId);
  const decryptMutation = useDecrypt();
  const isLoading = addEntriesMutation.isLoading || decryptMutation.isLoading;
  const { reset, handleSubmit, control } = useForm<FormData>();

  // Filter lists based on attributes the entity has
  const lists: List[] = useMemo(
    () => (data?.data || []).filter(l => hasDataForListKind(l.kind, entity)),
    [data, entity],
  );

  const addEntries = (list: List, entries: string[]) => {
    addEntriesMutation.mutate(
      {
        listId: list.id,
        entries,
      },
      {
        onError: (error: unknown) => {
          showRequestErrorToast(error);
        },
        onSuccess: () => {
          toast.show({
            title: t('success-toast.title'),
            description: t('success-toast.description'),
          });
          onClose();
        },
      },
    );
  };

  const handleBeforeSubmit = (formData: FormData) => {
    const formListId = formData.list.value;
    const list = lists.find(l => l.id === formListId);
    if (!list || !entity) {
      console.error('List or entity not found');
      showRequestErrorToast();
      return;
    }
    if (list.kind === ListKind.ipAddress) {
      const entries = getEntityDataForListKind(
        list.kind,
        entity.kind,
        {},
        entity.workflows,
      );
      if (!entries.length) {
        console.error('Found empty entries for IP address list kind');
        showRequestErrorToast();
        return;
      }
      addEntries(list, entries);
      return;
    }

    const attribute = getAttributeForListKind(list.kind, entity);
    if (!attribute) {
      console.error('Attribute not found');
      showRequestErrorToast();
      return;
    }
    decryptMutation.mutate(
      {
        reason: t('decrypt-reason'),
        fields: [attribute],
        entityId: entity.id,
      },
      {
        onSuccess: (response: DecryptResponse) => {
          const entries = getEntityDataForListKind(
            list.kind,
            entity.kind,
            response,
            entity.workflows,
          );
          addEntries(list, entries);
        },
        onError: showRequestErrorToast,
      },
    );
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const listOptions = lists.map(l => ({
    label: l.name,
    value: l.id,
  }));

  return (
    <Dialog
      size="compact"
      title={t('title')}
      onClose={handleClose}
      open={open}
      primaryButton={{
        form: 'add-to-list-form',
        label: t('form.save'),
        loading: isLoading,
        type: 'submit',
      }}
      secondaryButton={{
        label: t('form.cancel'),
        onClick: onClose,
        disabled: isLoading,
      }}
    >
      <form onSubmit={handleSubmit(handleBeforeSubmit)} id="add-to-list-form">
        <Stack gap={3} direction="column">
          <Controller
            control={control}
            name="list"
            rules={{ required: true }}
            render={select => (
              <Select
                label={t('form.list.label')}
                hasError={!!select.fieldState.error}
                hint={select.fieldState.error && t('form.list.errors.required')}
                options={listOptions}
                onBlur={select.field.onBlur}
                onChange={nextOption => {
                  setListId(nextOption.value);
                  select.field.onChange(nextOption);
                }}
                value={select.field.value}
                placeholder={t('form.list.placeholder')}
              />
            )}
          />
          <Stack gap={3} direction="row">
            <Text variant="body-3" color="tertiary">
              {t('description')}
            </Text>
            <LinkButton
              variant="label-3"
              iconComponent={IcoArrowTopRight16}
              target="_blank"
              href="/lists"
            >
              {t('lists')}
            </LinkButton>
          </Stack>
        </Stack>
      </form>
    </Dialog>
  );
};

export default AddToListDialog;
