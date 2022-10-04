import { useTranslation } from '@onefootprint/hooks';
import { IcoUserCircle24 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import React, { useState } from 'react';

import { useCollectKycDataMachine } from '../../../../components/machine-provider';
import SSN from '../../../ssn';
import EditSheet from '../edit-sheet';
import Section from '../section';

const IdentitySection = () => {
  const { t } = useTranslation('pages.confirm');
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;
  const [edit, setEdit] = useState(false);

  const identity = [];
  const ssn9 = data[UserDataAttribute.ssn9];
  const ssn4 = data[UserDataAttribute.ssn4];
  if (ssn9) {
    identity.push({
      text: t('identity.ssn9'),
      subtext: ssn9,
    });
  } else if (ssn4) {
    identity.push({
      text: t('identity.ssn4'),
      subtext: ssn4,
    });
  }
  if (!identity.length) {
    return null;
  }

  const handleEdit = () => {
    setEdit(true);
  };
  const handleCloseEdit = () => {
    setEdit(false);
  };
  const handleComplete = () => {
    setEdit(false);
  };

  return (
    <>
      <Section
        title={t('identity.title')}
        onEdit={handleEdit}
        IconComponent={IcoUserCircle24}
        items={identity}
      />
      <EditSheet
        open={!!edit}
        onClose={handleCloseEdit}
        name={t('identity.title')}
      >
        <SSN
          hideDisclaimer
          ctaLabel={t('edit-sheet.save')}
          onComplete={handleComplete}
        />
      </EditSheet>
    </>
  );
};

export default IdentitySection;
