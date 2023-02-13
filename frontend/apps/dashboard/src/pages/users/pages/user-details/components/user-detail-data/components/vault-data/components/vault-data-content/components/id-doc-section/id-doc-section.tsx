import { useTranslation } from '@onefootprint/hooks';
import { IcoIdCard24 } from '@onefootprint/icons';
import { DecryptedIdDocStatus, IdDocType } from '@onefootprint/types';
import { LinkButton } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { User, UserVaultData } from 'src/pages/users/users.types';

import DataSection from '../data-section';
import RiskSignalsOverview from '../risk-signals-overview';
import ImageDataRow from './components/image-data-row';
import useFormState from './hooks/use-form-state';

type IdDocSectionProps = {
  user: User;
  vaultData: UserVaultData;
  isDecrypting: boolean;
};

const IdDocSection = ({ user, vaultData, isDecrypting }: IdDocSectionProps) => {
  const { t, allT } = useTranslation('pages.user-details.user-info');
  const { idDoc } = vaultData;
  const idDocTypes = Object.keys(idDoc ?? {}) as IdDocType[];
  const successByIdDocType = Object.fromEntries(
    user.identityDocumentInfo.map(info => [info.type, info.status]),
  );
  const hasSelfie = user.identityDocumentInfo.some(
    info => !!info.selfieCollected,
  );
  const { register, setValue, control } = useFormContext();
  const { areAllFieldsSelected, areAllFieldsDisabled, fieldsState } =
    useFormState({
      control,
      user,
      vaultData,
    });

  if (!idDoc || !idDocTypes.length) {
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

  const renderCta = () => {
    const hideCta = !isDecrypting || areAllFieldsDisabled;

    return hideCta ? null : (
      <LinkButton
        disabled={areAllFieldsDisabled}
        onClick={areAllFieldsSelected ? handleDeselectAll : handleSelectAll}
        size="compact"
      >
        {areAllFieldsSelected ? t('cta.deselect-all') : t('cta.select-all')}
      </LinkButton>
    );
  };
  const footer = user.isPortable && <RiskSignalsOverview type="document" />;

  return (
    <DataSection
      iconComponent={IcoIdCard24}
      title={hasSelfie ? t('id-doc.title-with-selfie') : t('id-doc.title')}
      footer={footer}
      renderCta={renderCta}
      testID="document-section"
    >
      {idDocTypes.map(type => (
        <ImageDataRow
          key={type}
          label={allT(`id-doc-type.${type}`)}
          data={idDoc[type]}
          isSuccessful={
            successByIdDocType[type] === DecryptedIdDocStatus.success
          }
          checkbox={{
            register: register(`idDoc.${type}`),
            ...fieldsState[type],
            visible: isDecrypting,
          }}
        />
      ))}
    </DataSection>
  );
};

export default IdDocSection;
