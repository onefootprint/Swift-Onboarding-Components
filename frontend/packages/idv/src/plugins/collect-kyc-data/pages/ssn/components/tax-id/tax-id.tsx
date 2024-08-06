import { useInputMask } from '@onefootprint/hooks';
import { IcoShield24 } from '@onefootprint/icons';
import { TextInput, Toggle } from '@onefootprint/ui';
import { useEffect } from 'react';
import { FieldErrors, FieldValues, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { getTaxIdInputPattern } from '../../../../utils/ssn-utils/ssn-utils';

import { TFunction } from 'i18next';
import InfoBox from '../../../../../../components/info-box';

type VaultTaxId = 'ssn9' | 'usTaxId';
type VisualTaxId = VaultTaxId | 'itin';
type TaxIdProps = {
  disabled?: boolean;
  hideDisclaimer?: boolean;
  isOptional?: boolean;
  isSkipped: boolean;
  onSkipChange: () => void;
  vaultTaxId: VaultTaxId;
  visualTaxId: VisualTaxId;
};

const isSsn9 = (x: VisualTaxId): x is 'ssn9' => x === 'ssn9';
const isItin = (x: VisualTaxId): x is 'itin' => x === 'itin';

const getErrorHint = (idProp: VisualTaxId, t: TFunction<'idv', 'kyc.pages.ssn'>, errors: FieldErrors<FieldValues>) => {
  if (!errors?.[idProp]) return undefined;

  const errorMessage = errors?.[idProp]?.message;
  const fallbackMessage = idProp === 'ssn9' ? t('ssn-invalid') : t('ssn-us-tax-id-invalid');
  return errorMessage && typeof errorMessage === 'string' ? errorMessage : fallbackMessage;
};

const TaxId = ({
  disabled,
  hideDisclaimer,
  isOptional,
  isSkipped,
  onSkipChange,
  vaultTaxId,
  visualTaxId,
}: TaxIdProps) => {
  const inputMasks = useInputMask('en-US');
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages.ssn' });
  const {
    register,
    getValues,
    formState: { errors },
    setValue,
  } = useFormContext();

  useEffect(() => {
    if (isSkipped) {
      setValue(vaultTaxId, '', { shouldValidate: true });
    }
  }, [isSkipped, setValue]);

  return (
    <>
      <TextInput
        autoFocus
        data-nid-target={vaultTaxId}
        data-dd-privacy="mask"
        disabled={disabled}
        hasError={Boolean(errors[vaultTaxId])}
        hint={getErrorHint(vaultTaxId, t, errors)}
        label={isSsn9(visualTaxId) ? t('ssn9-label') : isItin(visualTaxId) ? t('itin-label') : t('us-tax-id-label')}
        mask={inputMasks.ssn}
        placeholder={t('ssn9-placeholder')}
        type="tel"
        value={getValues(vaultTaxId)}
        {...register(vaultTaxId, {
          required: !isSkipped,
          pattern: getTaxIdInputPattern(visualTaxId),
        })}
      />
      {isOptional && <Toggle checked={isSkipped} label={t('skip-label')} onChange={onSkipChange} />}
      {!hideDisclaimer && (
        <InfoBox
          items={[
            {
              Icon: IcoShield24,
              title: t('your-data-is-safe'),
              description: isSsn9(visualTaxId)
                ? t('ssn9-disclaimer')
                : isItin(visualTaxId)
                  ? t('itin-disclaimer')
                  : t('us-tax-id-disclaimer'),
            },
          ]}
          variant="default"
        />
      )}
    </>
  );
};

export default TaxId;
