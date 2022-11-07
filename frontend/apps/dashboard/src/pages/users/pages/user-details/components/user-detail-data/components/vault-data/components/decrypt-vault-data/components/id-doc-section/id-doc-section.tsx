import { useTranslation } from '@onefootprint/hooks';
import { IcoIdCard24 } from '@onefootprint/icons';
import { Checkbox } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { User } from 'src/pages/users/types/user.types';

import { IdDocDataAttribute } from '../../../../../../../../../../types/vault-data.types';
import isCheckboxDisabled from '../../utils/is-checkbox-disabled';
import DataContainer from '../data-container';

type IdDocSectionProps = {
  user: User;
};

const IdDocSection = ({ user }: IdDocSectionProps) => {
  const { t, allT } = useTranslation('pages.user-details.user-info.id-doc');
  const { register } = useFormContext();
  const { idDoc } = user.vaultData;

  return (
    <DataContainer iconComponent={IcoIdCard24} title={t('title')}>
      <Checkbox
        {...register(`idDoc.${IdDocDataAttribute.frontImage}`)}
        disabled={
          !idDoc || isCheckboxDisabled(idDoc[IdDocDataAttribute.frontImage])
        }
        label={allT('collected-id-doc-attributes.id-doc-image')}
      />
    </DataContainer>
  );
};

export default IdDocSection;
