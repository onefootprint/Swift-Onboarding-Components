import { useTranslation } from '@onefootprint/hooks';
import { IcoIdCard24 } from '@onefootprint/icons';
import { IdDocType } from '@onefootprint/types';
import { Checkbox, LinkButton } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import useUser from 'src/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';

import DataSection from '../../../data-section';
import useFormState from './hooks/use-form-state';

const IdDocSection = () => {
  const { t, allT } = useTranslation('pages.user-details.user-info');
  const userId = useUserId();
  const { user } = useUser(userId);
  const { idDoc } = user.vaultData ?? {};
  const docTypes = Object.keys(idDoc ?? {}) as IdDocType[];

  const { register, setValue, control } = useFormContext();
  const { areAllFieldsSelected, areAllFieldsDisabled, fieldsState } =
    useFormState({
      control,
      user,
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
          label={allT('collected-id-doc-attributes.id-doc-image')}
        />
      ))}
    </DataSection>
  );
};

export default IdDocSection;
