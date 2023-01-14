import { useTranslation } from '@onefootprint/hooks';
import { IcoIdCard24 } from '@onefootprint/icons';
import { IdDocType } from '@onefootprint/types';
import { Checkbox, LinkButton } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { User, UserVaultData } from 'src/pages/users/users.types';

import DataSection from '../../../data-section';
import RiskSignalsOverview from '../../../risk-signals-overview';
import useFormState from './hooks/use-form-state';

type IdDocSectionProps = {
  user: User;
  vaultData: UserVaultData;
};

const IdDocSection = ({ user, vaultData }: IdDocSectionProps) => {
  const { t, allT } = useTranslation('pages.user-details.user-info');
  const { idDoc } = vaultData;
  const docTypes = Object.keys(idDoc ?? {}) as IdDocType[];
  const { register, setValue, control } = useFormContext();
  const { areAllFieldsSelected, areAllFieldsDisabled, fieldsState } =
    useFormState({
      control,
      user,
      vaultData,
    });

  if (!idDoc || !docTypes.length) {
    return null;
  }

  const selectValue = (value: boolean) => {
    if (!fieldsState[IdDocType.passport].disabled) {
      setValue(`idDoc.${IdDocType.passport}`, value);
    }
    if (!fieldsState[IdDocType.idCard].disabled) {
      setValue(`idDoc.${IdDocType.idCard}`, value);
    }
    if (!fieldsState[IdDocType.driversLicense].disabled) {
      setValue(`idDoc.${IdDocType.driversLicense}`, value);
    }
  };

  const handleDeselectAll = () => {
    selectValue(false);
  };

  const handleSelectAll = () => {
    selectValue(true);
  };

  return (
    <DataSection
      iconComponent={IcoIdCard24}
      title={t('id-doc.title')}
      footer={<RiskSignalsOverview type="document" />}
      renderCta={() =>
        areAllFieldsDisabled ? null : (
          <LinkButton
            disabled={areAllFieldsDisabled}
            onClick={areAllFieldsSelected ? handleDeselectAll : handleSelectAll}
            size="compact"
          >
            {areAllFieldsSelected ? t('cta.deselect-all') : t('cta.select-all')}
          </LinkButton>
        )
      }
    >
      {docTypes.map(type => (
        <Checkbox
          key={type}
          {...register(`idDoc.${type}`)}
          disabled={fieldsState[type].disabled}
          label={allT(`id-doc-type.${type}`)}
        />
      ))}
    </DataSection>
  );
};

export default IdDocSection;
