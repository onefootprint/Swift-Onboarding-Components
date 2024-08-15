import { useInputMask } from '@onefootprint/hooks';
import { IcoShield24 } from '@onefootprint/icons';
import { TextInput, Toggle } from '@onefootprint/ui';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { getTaxIdInputPattern } from '../../../../utils/ssn-utils/ssn-utils';
import type { FormValues } from '../../ssn.types';

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

const isSsn9 = (value: VisualTaxId) => value === 'ssn9';

const isItin = (value: VisualTaxId) => value === 'itin';

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
  } = useFormContext<FormValues>();

  useEffect(() => {
    if (isSkipped) {
      setValue(vaultTaxId, '', { shouldValidate: true });
    }
  }, [isSkipped, setValue]);

  const getErrorHint = (taxId: VaultTaxId) => {
    const errorMessage = errors?.[taxId]?.message;
    const fallbackMessage = taxId === 'ssn9' ? t('ssn-invalid') : t('ssn-us-tax-id-invalid');
    return errorMessage && typeof errorMessage === 'string' ? errorMessage : fallbackMessage;
  };

  const getLabel = (taxId: VisualTaxId) => {
    if (isSsn9(taxId)) return t('ssn9-label');
    if (isItin(taxId)) return t('itin-label');
    return t('us-tax-id-label');
  };

  const getDisclaimerDescription = (taxId: VisualTaxId) => {
    if (isSsn9(taxId)) return t('ssn9-disclaimer');
    if (isItin(taxId)) return t('itin-disclaimer');
    return t('us-tax-id-disclaimer');
  };

  return (
    <>
      <TextInput
        autoFocus
        data-dd-privacy="mask"
        data-nid-target={vaultTaxId}
        disabled={disabled}
        hasError={Boolean(errors[vaultTaxId])}
        hint={getErrorHint(vaultTaxId)}
        label={getLabel(visualTaxId)}
        mask={inputMasks.ssn}
        placeholder={t('ssn9-placeholder')}
        type="tel"
        value={getValues(vaultTaxId)}
        {...register(vaultTaxId, {
          required: !isSkipped,
          pattern: getTaxIdInputPattern(visualTaxId),
        })}
      />
      {isOptional ? <Toggle checked={isSkipped} label={t('skip-label')} onChange={onSkipChange} /> : null}
      {hideDisclaimer ? null : (
        <InfoBox
          items={[
            {
              Icon: IcoShield24,
              title: t('your-data-is-safe'),
              description: getDisclaimerDescription(vaultTaxId),
            },
          ]}
          variant="default"
        />
      )}
    </>
  );
};

export default TaxId;
