import { useTranslation } from '@onefootprint/hooks';
import { IcoEmail24 } from '@onefootprint/icons';
import { CollectedKycDataOption, IdDI } from '@onefootprint/types';
import React from 'react';

import { Section } from '../../../../../../components/confirm-collected-data';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { getDisplayValue } from '../../../../utils/data-types';

type EmailSectionProps = {
  onEdit: () => void;
};

const EmailSection = ({ onEdit }: EmailSectionProps) => {
  const { t, allT } = useTranslation('pages.confirm');
  const [state] = useCollectKycDataMachine();
  const {
    data,
    requirement: { missingAttributes },
  } = state.context;
  const emailEntry = data[IdDI.email];
  const email = getDisplayValue(emailEntry);
  const receivedEmail = emailEntry?.bootstrap;
  // We don't use allAttributes here -
  // We allow editing most pieces of information, but we don't yet support updating a piece of
  // contact info. So, if it's not missing, don't show the ability to edit.
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
      editLabel={allT('pages.confirm.summary.edit')}
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
