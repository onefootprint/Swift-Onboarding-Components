import { useTranslation } from '@onefootprint/hooks';
import { IcoIdCard24 } from '@onefootprint/icons';
import { IdDocType } from '@onefootprint/types';
import { Checkbox } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import useUser from 'src/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';

import DataSection from '../../../data-section';
import isCheckboxDisabled from '../../utils/is-checkbox-disabled';

const IdDocSection = () => {
  const { t, allT } = useTranslation('pages.user-details.user-info.id-doc');
  const userId = useUserId();
  const {
    user: { vaultData },
  } = useUser(userId);
  const { register } = useFormContext();
  const { idDoc } = vaultData ?? {};
  const docTypes = Object.keys(idDoc ?? {}) as IdDocType[];
  if (!idDoc || !docTypes.length) {
    return null;
  }

  return (
    <DataSection iconComponent={IcoIdCard24} title={t('title')}>
      {docTypes.map(type => (
        <Checkbox
          {...register(`idDoc.${type}`)}
          disabled={!idDoc || isCheckboxDisabled(idDoc[type])}
          label={allT('collected-id-doc-attributes.id-doc-image')}
        />
      ))}
    </DataSection>
  );
};

export default IdDocSection;
