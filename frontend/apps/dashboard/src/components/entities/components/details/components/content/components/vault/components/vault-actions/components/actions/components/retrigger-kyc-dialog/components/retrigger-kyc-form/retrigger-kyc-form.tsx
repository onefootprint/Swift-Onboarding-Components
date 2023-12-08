import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { IdDI, TriggerKind } from '@onefootprint/types';
import {
  Checkbox,
  Divider,
  Radio,
  TextArea,
  Typography,
} from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import AnimatedContainer from 'src/components/animated-container';
import useSession from 'src/hooks/use-session';

import useEntity from '@/entity/hooks/use-entity';
import useEntityId from '@/entity/hooks/use-entity-id';

export type RetriggerKYCFormData = {
  kind: TriggerKind;
  collectSelfie: boolean;
  note?: string;
};

type RetriggerKYCFormProps = {
  onSubmit: (data: RetriggerKYCFormData) => void;
  formId: string;
};

const RetriggerKYCForm = ({ onSubmit, formId }: RetriggerKYCFormProps) => {
  const { t } = useTranslation('pages.entity.actions.retrigger-kyc');
  const entityId = useEntityId();
  const entity = useEntity(entityId);
  const userHasPhone = entity.data?.attributes?.includes(IdDI.phoneNumber);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RetriggerKYCFormData>();
  const triggerKind = watch('kind');

  const handleBeforeSubmit = (data: RetriggerKYCFormData) => {
    onSubmit({
      ...data,
    });
  };

  const {
    data: { user },
  } = useSession();

  return (
    <StyledForm id={formId} onSubmit={handleSubmit(handleBeforeSubmit)}>
      <Typography variant="label-3">{t('prompt')}</Typography>
      <div>
        <Radio
          value={TriggerKind.IdDocument}
          label={t('form.id-photo.title')}
          hint={t('form.id-photo.description')}
          {...register('kind', { required: true })}
        />
        <AnimatedContainer
          isExpanded={triggerKind === TriggerKind.IdDocument}
          marginLeft={8}
          marginTop={4}
        >
          <Checkbox
            label={t('form.id-photo.collect-selfie')}
            {...register('collectSelfie', { required: false })}
          />
        </AnimatedContainer>
      </div>
      {user?.isFirmEmployee && (
        <div>
          <Radio
            value={TriggerKind.ProofOfSsn}
            label={t('form.proof-of-ssn.title')}
            hint={t('form.proof-of-ssn.description')}
            {...register('kind', { required: true })}
          />
        </div>
      )}
      <Radio
        value={TriggerKind.RedoKyc}
        label={t('form.revise-kyc.title')}
        hint={t('form.revise-kyc.description')}
        {...register('kind', { required: true })}
      />
      {errors.kind && (
        <Typography variant="body-4" color="error">
          {t('form.error')}
        </Typography>
      )}
      <TextArea
        label={t('form.note-for-user.label')}
        placeholder={t('form.note-for-user.placeholder')}
        {...register('note')}
      />

      <Divider />
      <Typography variant="body-3" color="tertiary">
        {userHasPhone
          ? t('form.description-phone')
          : t('form.description-email')}
      </Typography>
    </StyledForm>
  );
};

export default RetriggerKYCForm;

const StyledForm = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: ${theme.spacing[5]};
  `}
`;
