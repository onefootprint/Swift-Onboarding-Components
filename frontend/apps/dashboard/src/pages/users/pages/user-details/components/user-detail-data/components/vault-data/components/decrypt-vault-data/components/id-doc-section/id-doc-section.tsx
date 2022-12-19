import { useTranslation } from '@onefootprint/hooks';
import { IcoIdCard24 } from '@onefootprint/icons';
import { IdDocDataAttribute } from '@onefootprint/types';
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
