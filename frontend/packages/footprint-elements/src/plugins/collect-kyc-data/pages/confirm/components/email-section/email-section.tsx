import { useTranslation } from '@onefootprint/hooks';
import { IcoEmail24 } from '@onefootprint/icons';
import { CollectedKycDataOption, UserDataAttribute } from '@onefootprint/types';
import React from 'react';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import Section from '../section';

type EmailSectionProps = {
  onEdit: () => void;
};

const EmailSection = ({ onEdit }: EmailSectionProps) => {
  const { t } = useTranslation('pages.confirm');
  const [state] = useCollectKycDataMachine();
  const { data, missingAttributes, receivedEmail } = state.context;
  const email = data[UserDataAttribute.email];
  if (
    !missingAttributes.includes(CollectedKycDataOption.email) ||
    receivedEmail
  ) {
    return null;
  }

  const handleEdit = () => {
    onEdit();
  };

  return (
    <Section
      title={t('email.title')}
      onEdit={handleEdit}
      IconComponent={IcoEmail24}
      items={[
        {
          text: t('email.text'),
          subtext: email,
        },
      ]}
    />
  );
};

export default EmailSection;
