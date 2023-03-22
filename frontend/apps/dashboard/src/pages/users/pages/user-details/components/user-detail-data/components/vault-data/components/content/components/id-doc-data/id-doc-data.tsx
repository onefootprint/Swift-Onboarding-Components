import { useTranslation } from '@onefootprint/hooks';
import { IcoIdCard24 } from '@onefootprint/icons';
import { Vault } from '@onefootprint/types';
import { LinkButton } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { User } from 'src/pages/users/users.types';

import DataSection from '../data-section';
import RiskSignalsOverview from '../risk-signals-overview';
import Field from './components/image-data-row';
import useFields from './hooks/use-fields';

type IdDocDataProps = {
  user: User;
  vault: Vault;
  isDecrypting: boolean;
};

const IdDocData = ({ user, vault, isDecrypting }: IdDocDataProps) => {
  const { t } = useTranslation('pages.user-details.user-info');
  const { setValue } = useFormContext();
  const fields = useFields(user, vault, isDecrypting);
  const hasSelfie = user.identityDocumentInfo.some(
    info => !!info.selfieCollected,
  );
  const footer = user.isPortable && <RiskSignalsOverview type="document" />;
  const allChecked = fields
    .filter(field => field.canSelect)
    .every(field => field.checked);

  const selectValue = (value: boolean) => {
    fields
      .filter(field => field.canSelect)
      .forEach(field => {
        setValue(field.name, value);
      });
  };

  const handleDeselectAll = () => {
    selectValue(false);
  };

  const handleSelectAll = () => {
    selectValue(true);
  };

  const renderCta = () => {
    const showData = isDecrypting && fields.some(field => field.canSelect);

    return showData ? (
      <LinkButton
        onClick={allChecked ? handleDeselectAll : handleSelectAll}
        size="compact"
      >
        {allChecked ? 'Deselect all' : 'Select all'}
      </LinkButton>
    ) : null;
  };
  return (
    <DataSection
      iconComponent={IcoIdCard24}
      title={hasSelfie ? t('id-doc.title-with-selfie') : t('id-doc.title')}
      footer={footer}
      renderCta={renderCta}
    >
      {fields.map(field => (
        <Field
          canAccess={field.canAccess}
          canSelect={field.canSelect}
          hasPermission={field.hasPermission}
          hasValue={field.hasValue}
          isDataDecrypted={field.isDataDecrypted}
          isSuccessful={field.isSuccessful}
          key={field.name}
          label={field.label}
          name={field.name}
          showCheckbox={field.showCheckbox}
          value={field.value}
        />
      ))}
    </DataSection>
  );
};

export default IdDocData;
