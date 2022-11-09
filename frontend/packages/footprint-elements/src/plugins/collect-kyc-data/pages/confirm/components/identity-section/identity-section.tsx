import { useTranslation } from '@onefootprint/hooks';
import { IcoUserCircle24 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';

import useCollectKycDataMachine, {
  MachineContext,
} from '../../../../hooks/use-collect-kyc-data-machine';
import Section from '../section';

type IdentitySectionProps = {
  onEdit: () => void;
};

const IdentitySection = ({ onEdit }: IdentitySectionProps) => {
  const { t } = useTranslation('pages.confirm');
  const [state] = useCollectKycDataMachine();
  const { data }: MachineContext = state.context;

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
    onEdit();
  };

  return (
    <Section
      title={t('identity.title')}
      onEdit={handleEdit}
      IconComponent={IcoUserCircle24}
      items={identity}
    />
  );
};

export default IdentitySection;
