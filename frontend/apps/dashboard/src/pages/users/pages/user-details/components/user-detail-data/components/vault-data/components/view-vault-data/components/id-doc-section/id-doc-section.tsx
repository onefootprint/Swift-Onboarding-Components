import { useTranslation } from '@onefootprint/hooks';
import { IcoIdCard24 } from '@onefootprint/icons';
import React, { useState } from 'react';
import {
  IdDocDataAttribute,
  UserVaultData,
} from 'src/pages/users/types/vault-data.types';

import DataSection from '../../../data-section';
import ImageDataRow from './components/image-data-row';

type IdDocSectionProps = {
  vaultData: UserVaultData;
};

const IdDocSection = ({ vaultData }: IdDocSectionProps) => {
  const { t, allT } = useTranslation('pages.user-details.user-info.id-doc');
  const { idDoc } = vaultData;
  const [idDocVisible, setIdDocVisible] = useState(false);

  const handleShowIdDocImage = () => {
    // TODO: display the decrypted image here
    // https://linear.app/footprint/issue/FP-1792/display-decrypted-image-in-dashboard-user-details-page
    setIdDocVisible(!idDocVisible);
  };

  return (
    <DataSection iconComponent={IcoIdCard24} title={t('title')}>
      <ImageDataRow
        title={allT('collected-id-doc-attributes.id-doc-image')}
        data={idDoc && idDoc[IdDocDataAttribute.frontImage]}
        showButton={{
          label: idDocVisible
            ? t('id-doc-images.hide')
            : t('id-doc-images.show'),
          onClick: handleShowIdDocImage,
        }}
      />
    </DataSection>
  );
};

export default IdDocSection;
