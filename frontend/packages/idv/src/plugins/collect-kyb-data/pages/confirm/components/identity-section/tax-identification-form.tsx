import { useInputMask } from '@onefootprint/hooks';
import { BusinessDI } from '@onefootprint/types';
import { Grid, Stack, TextInput } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import EditableFormButtonContainer from '@/idv/components/editable-form-button-container';
import { useL10nContext } from '@/idv/components/l10n-provider';
import { getLogger } from '@/idv/utils';
import { useForm } from 'react-hook-form';
import useCollectKybDataMachine from '../../../../hooks/use-collect-kyb-data-machine';
import useSyncData from '../../../../hooks/use-sync-data';
import { getTinDefaultValue } from '../../../../utils/utils';

type FormHints = Partial<{ [K in keyof FormData]: string }>;
type FormData = { tin: string };
type FormProps = (keyof FormData)[];
type FormErrors = Partial<{ [K in keyof FormData]: { message?: string } }>;
type TaxIdentificationFormProps = {
  ctaLabel?: string;
  onCancel?: () => void;
  onComplete?: () => void;
};

const { logError } = getLogger({ location: 'kyb-tax-identification-form' });

const getFormHints = (propsList: FormProps, errors: FormErrors, infoHint: string): FormHints => {
  const hints: FormHints = {};

  for (const prop of propsList) {
    const errorMessage = errors[prop]?.message;

    if (errorMessage) {
      hints[prop] = errorMessage;
    } else if (prop === 'tin') {
      hints[prop] = infoHint;
    }
  }

  return hints;
};

const TaxIdentificationForm = ({ ctaLabel, onCancel, onComplete }: TaxIdentificationFormProps) => {
  const [state, send] = useCollectKybDataMachine();
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.basic-data.form' });
  const { mutation, syncData } = useSyncData();
  const l10n = useL10nContext();
  const inputMasks = useInputMask(l10n?.locale);

  const { idvContext, data } = state.context;
  const tinValue = data?.[BusinessDI.tin];
  const defaultValues = { tin: getTinDefaultValue(tinValue) };
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({ defaultValues });

  const infoHint = t('must-be-ein');
  const { tin: tinHint = undefined } = getFormHints(['tin'], errors, infoHint);

  const onSubmitFormData = (formData: FormData) => {
    const payload = { [BusinessDI.tin]: formData.tin };
    syncData({
      authToken: idvContext.authToken,
      data: payload,
      onSuccess: () => {
        send({ type: 'basicDataSubmitted', payload });
        onComplete?.();
      },
      onError: (error: string) => {
        logError(`Error vaulting business.tin: ${error}`, error);
      },
    });
  };

  return (
    <Grid.Container tag="form" gap={7} width="100%" onSubmit={handleSubmit(onSubmitFormData)}>
      <Stack gap={6} direction="column">
        <TextInput
          data-dd-privacy="mask"
          data-dd-action-name="Business Tin"
          hasError={!!errors.tin}
          hint={tinHint}
          mask={inputMasks.tin}
          value={getValues('tin')}
          label={t('tin.label')}
          placeholder={t('tin.placeholder')}
          {...register('tin', {
            required: {
              value: true,
              message: t('tin.errors.required'),
            },
            pattern: {
              value: /^\d{2}-\d{7}$/,
              message: t('tin.errors.pattern'),
            },
          })}
        />
      </Stack>
      <EditableFormButtonContainer
        onCancel={onCancel}
        isLoading={mutation.isPending}
        ctaLabel={ctaLabel}
        submitButtonTestID="kyb-basic"
      />
    </Grid.Container>
  );
};

export default TaxIdentificationForm;
