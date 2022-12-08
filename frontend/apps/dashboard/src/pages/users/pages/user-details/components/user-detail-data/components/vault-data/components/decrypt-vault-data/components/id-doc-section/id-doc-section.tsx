import { useTranslation } from '@onefootprint/hooks';
import { IcoIdCard24 } from '@onefootprint/icons';
import { IdDocDataAttribute } from '@onefootprint/types';
import { Checkbox } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { User } from 'src/pages/users/types/user.types';

import DataSection from '../../../data-section';
import isCheckboxDisabled from '../../utils/is-checkbox-disabled';

type IdDocSectionProps = {
  user: User;
};

const IdDocSection = ({ user }: IdDocSectionProps) => {
  const { t, allT } = useTranslation('pages.user-details.user-info.id-doc');
  const { register } = useFormContext();
  const { idDoc } = user.vaultData;

  return (
    <DataSection iconComponent={IcoIdCard24} title={t('title')}>
      <Checkbox
        {...register(`idDoc.${IdDocDataAttribute.frontImage}`)}
        disabled={
          !idDoc || isCheckboxDisabled(idDoc[IdDocDataAttribute.frontImage])
        }
        label={allT('collected-id-doc-attributes.id-doc-image')}
      />
    </DataSection>
  );
};

export default IdDocSection;
