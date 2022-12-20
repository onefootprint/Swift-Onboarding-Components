import { useTranslation } from '@onefootprint/hooks';
import { IcoIdCard24 } from '@onefootprint/icons';
import { IdDocType } from '@onefootprint/types';
import React from 'react';
import useUser from 'src/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';
import { useMap } from 'usehooks-ts';

import DataSection from '../../../data-section';
import ImageDataRow from './components/image-data-row';

const IdDocSection = () => {
  const { t, allT } = useTranslation('pages.user-details.user-info.id-doc');
  const userId = useUserId();
  const {
    user: { vaultData },
  } = useUser(userId);
  const { idDoc } = vaultData ?? {};
  const [idDocTypeVisible, { set }] = useMap<IdDocType, boolean>(new Map());
  const docTypes = Object.keys(idDoc ?? {}) as IdDocType[];
  if (!idDoc || !docTypes.length) {
    return null;
  }

  const handleToggleIdDocVisibility = (type: IdDocType) => {
    const isVisible = idDocTypeVisible.get(type);
    set(type, !isVisible);
  };

  return (
    <DataSection iconComponent={IcoIdCard24} title={t('title')}>
      {docTypes.map(type => (
        <ImageDataRow
          key={type}
          title={allT('collected-id-doc-attributes.id-doc-image')}
          data={idDoc[type]}
          imagesVisible={idDocTypeVisible.get(type)}
          onToggleImageVisibility={() => handleToggleIdDocVisibility(type)}
        />
      ))}
    </DataSection>
  );
};

export default IdDocSection;
