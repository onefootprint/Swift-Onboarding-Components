import { useTranslation } from '@onefootprint/hooks';
import { IcoUserCircle24 } from '@onefootprint/icons';
import { IdDI } from '@onefootprint/types';
import React from 'react';

import { Section } from '../../../../../../components/confirm-collected-data';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';

type IdentitySectionProps = {
  onEdit: () => void;
};

const IdentitySection = ({ onEdit }: IdentitySectionProps) => {
  const { t, allT } = useTranslation('pages.confirm');
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;

  const identity = [];
  const ssn9 = data[IdDI.ssn9];
  const ssn4 = data[IdDI.ssn4];
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
    onEdit();
  };

  return (
    <Section
      title={t('identity.title')}
      editLabel={allT('pages.confirm.summary.edit')}
      onEdit={handleEdit}
      IconComponent={IcoUserCircle24}
      items={identity}
    />
  );
};

export default IdentitySection;
