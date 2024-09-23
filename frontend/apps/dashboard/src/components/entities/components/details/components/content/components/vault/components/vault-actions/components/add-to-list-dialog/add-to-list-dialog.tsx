import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoArrowTopRight16, IcoInfo16 } from '@onefootprint/icons';
import { type DecryptResponse, type List, ListKind } from '@onefootprint/types';
import type { SelectOption } from '@onefootprint/ui';
import { Dialog, LinkButton, MultiSelect, Select, Stack, Text, useToast } from '@onefootprint/ui';
import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useCurrentEntity from 'src/components/entities/components/details/hooks/use-current-entity';

import useAddEntries from '@/lists/pages/details/components/content/components/entries/components/add-entries-dialog/hooks/use-add-entries';
import useLists from 'src/hooks/use-lists';

import useDecrypt from '../../hooks/use-decrypt-controls/hooks/use-decrypt-fields/hooks/use-decrypt';
import getAttributeForListKind from './utils/get-attribute-for-list-kind';
import getEntityDataForListKind from './utils/get-entity-data-for-list-kind';
import getIpAddressesFromWorkflows from './utils/get-ip-addresses-from-workflows';
import hasDataForListKind from './utils/has-data-for-list-kind';

type FormData = {
  list: SelectOption<string>;
  ipAddresses?: SelectOption<string>[];
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
  const isLoading = addEntriesMutation.isPending || decryptMutation.isPending;
  const { reset, handleSubmit, watch, control } = useForm<FormData>();

  // Filter lists based on attributes the entity has
  const listById: Record<string, List> = useMemo(() => {
    const applicableLists = (data?.data || []).filter(l => hasDataForListKind(l.kind, entity));
    return Object.fromEntries(applicableLists.map(l => [l.id, l]));
  }, [data, entity]);

  const listOptions = Object.values(listById).map(l => ({
    label: l.name,
    value: l.id,
  }));

  const selectedList = watch('list');
  const selectedListKind = listById[selectedList?.value]?.kind;
  const showIpAddressSelect = selectedListKind === ListKind.ipAddress;
  const ipAddressOptions: SelectOption<string>[] = useMemo(() => {
    if (!entity) {
      return [];
    }
    return getIpAddressesFromWorkflows(entity.workflows).map((ipAddress: string) => ({
      label: ipAddress,
      value: ipAddress,
    }));
  }, [entity]);

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
    const list = listById[formListId];
    if (!list || !entity) {
      showRequestErrorToast();
      return;
    }
    if (list.kind === ListKind.ipAddress) {
      const entries = getEntityDataForListKind(list.kind, entity.kind, {}, entity.workflows);
      if (!entries.length) {
        showRequestErrorToast();
        return;
      }
      addEntries(list, entries);
      return;
    }

    const attribute = getAttributeForListKind(list.kind, entity);
    if (!attribute) {
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
          const entries = getEntityDataForListKind(list.kind, entity.kind, response, entity.workflows);
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
        <Stack gap={7} direction="column">
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
          {showIpAddressSelect && (
            <Controller
              control={control}
              name="ipAddresses"
              render={({ field }) => (
                <MultiSelect
                  label={t('form.ip-addresses.label')}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  value={field.value}
                  options={ipAddressOptions}
                />
              )}
            />
          )}
          <Stack gap={2} direction="row" alignItems="center">
            <IcoInfo16 color="tertiary" />
            <Text variant="body-3" color="tertiary">
              {t('description')}
            </Text>
            <LinkButton variant="label-3" iconComponent={IcoArrowTopRight16} target="_blank" href="/lists">
              {t('lists')}
            </LinkButton>
          </Stack>
        </Stack>
      </form>
    </Dialog>
  );
};

export default AddToListDialog;
