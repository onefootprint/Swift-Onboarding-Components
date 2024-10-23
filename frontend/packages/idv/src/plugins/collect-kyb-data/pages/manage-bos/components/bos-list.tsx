import { IcoUsers24 } from '@onefootprint/icons';
import { type BusinessOwner2, IdDI } from '@onefootprint/types';
import { Box, Button, Form, LinkButton, Stack, Text } from '@onefootprint/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

export type BosListProps = {
  bos: BusinessOwner2[];
  currentBo: BusinessOwner2;
  onSubmit: (data: EditFormValues) => void;
};

type EditFormValues = {
  firstName: string;
  lastName: string;
  ownershipStake: number;
};

const BosList = ({ bos, onSubmit, currentBo }: BosListProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.beneficial-owners.list' });
  const [editingBo, setEditingBo] = useState<BusinessOwner2 | null>(null);

  return (
    <>
      {bos.length > 0 ? (
        <Box borderRadius="sm" borderColor="tertiary" borderStyle="solid" borderWidth={1} marginTop={5}>
          <Stack alignItems="center">
            <Stack paddingBlock={4} paddingInline={5} gap={3} alignItems="center" flexGrow={1}>
              <IcoUsers24 />
              <Text variant="label-3">{t('title')}</Text>
            </Stack>
          </Stack>
          <List>
            {bos.map(bo => {
              const name = `${bo.decryptedData[IdDI.firstName]} ${bo.decryptedData[IdDI.lastName]}`.trim();
              const isCurrentBo = bo.id === currentBo.id;
              const isEditing = editingBo?.id === bo.id;

              return (
                <li key={bo.id}>
                  {isEditing ? (
                    <EditForm
                      bo={bo}
                      onSubmit={formData => {
                        setEditingBo(null);
                        onSubmit(formData);
                      }}
                      onCancel={() => {
                        setEditingBo(null);
                      }}
                    />
                  ) : (
                    <Item
                      name={name}
                      isCurrentBo={isCurrentBo}
                      ownershipStake={bo.ownershipStake}
                      onEdit={() => setEditingBo(bo)}
                    />
                  )}
                </li>
              );
            })}
          </List>
        </Box>
      ) : null}
    </>
  );
};

type EditFormProps = {
  bo: BusinessOwner2;
  onSubmit: (data: EditFormValues) => void;
  onCancel: () => void;
};

const EditForm = ({ bo, onSubmit, onCancel }: EditFormProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.beneficial-owners.form' });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditFormValues>({
    defaultValues: {
      firstName: bo.decryptedData[IdDI.firstName],
      lastName: bo.decryptedData[IdDI.lastName],
      ownershipStake: bo.ownershipStake,
    },
  });

  const onSubmitForm = (data: EditFormValues) => {
    onSubmit({ ...bo, ...data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      <Stack direction="column" gap={6}>
        <Form.Field>
          <Form.Label>{t('fields.first-name.label')}</Form.Label>
          <Form.Input
            data-dd-privacy="mask"
            placeholder={t('fields.first-name.placeholder')}
            disabled
            {...register('firstName')}
          />
        </Form.Field>
        <Form.Field>
          <Form.Label>{t('fields.last-name.label')}</Form.Label>
          <Form.Input
            data-dd-privacy="mask"
            data-dd-action-name="Last name input"
            placeholder={t('fields.last-name.placeholder')}
            disabled
            {...register('lastName')}
          />
        </Form.Field>
        <Form.Field>
          <Form.Label>{t('fields.ownership-stake.label')}</Form.Label>
          <Form.Input
            type="number"
            data-dd-privacy="mask"
            data-dd-action-name="Ownership stake input"
            placeholder="100"
            min="0"
            max="100"
            hasError={!!errors.ownershipStake}
            {...register('ownershipStake', {
              required: t('fields.ownership-stake.errors.required'),
              min: { value: 0, message: t('fields.ownership-stake.errors.min') },
              max: { value: 100, message: t('fields.ownership-stake.errors.max') },
              valueAsNumber: true,
            })}
          />
          <Form.Errors>{errors.ownershipStake?.message}</Form.Errors>
        </Form.Field>
        <Stack direction="row" justifyContent="flex-end" gap={3}>
          <Button variant="secondary" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button type="submit">{t('save')}</Button>
        </Stack>
      </Stack>
    </form>
  );
};

type ItemProps = {
  name: string;
  isCurrentBo: boolean;
  ownershipStake: number;
  onEdit: () => void;
};

const Item = ({ name, isCurrentBo, ownershipStake, onEdit }: ItemProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.beneficial-owners.list' });

  return (
    <Stack justifyContent="space-between">
      <Stack flexDirection="column" gap={2}>
        <Text variant="label-3">
          {name}
          {isCurrentBo && <span>{t('you')}</span>}
        </Text>
        <Text variant="caption-1" color="tertiary">
          {t('owns-stake', { stake: ownershipStake })}
        </Text>
      </Stack>
      <Stack center>
        <LinkButton variant="label-3" onClick={onEdit}>
          Edit
        </LinkButton>
      </Stack>
    </Stack>
  );
};

const List = styled.ul`
  ${({ theme }) => css`
    padding: ${theme.spacing[2]} ${theme.spacing[5]} ${theme.spacing[5]};
  
    li:not(:last-child) {
      border-bottom: 1px solid ${theme.borderColor.tertiary};
      padding-bottom: ${theme.spacing[5]};
      margin-bottom: ${theme.spacing[5]};
    }
  `}
`;

export default BosList;
