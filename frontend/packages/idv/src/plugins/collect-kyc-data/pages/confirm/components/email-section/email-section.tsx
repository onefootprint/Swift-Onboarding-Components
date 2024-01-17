import { IcoEmail24 } from '@onefootprint/icons';
import { CollectedKycDataOption, IdDI } from '@onefootprint/types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type {
  SectionAction,
  SectionItemProps,
} from '../../../../../../components/confirm-collected-data';
import {
  Section,
  SectionItem,
} from '../../../../../../components/confirm-collected-data';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import Email from '../../../email';

const EmailSection = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages' });
  const [state] = useCollectKycDataMachine();
  const {
    data,
    requirement: { missingAttributes },
  } = state.context;
  const emailEntry = data[IdDI.email];
  const email = emailEntry?.value;
  const [editing, setEditing] = useState(false);
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

  const emailElement = [
    {
      text: t('confirm.email.text'),
      subtext: email,
    },
  ];

  const emailItem = emailElement.map(
    ({ text, subtext, textColor }: SectionItemProps) => (
      <SectionItem
        key={text}
        text={text}
        subtext={subtext}
        textColor={textColor}
      />
    ),
  );

  const stopEditing = () => {
    setEditing(false);
  };

  const getSectionContent = () => {
    if (!editing) {
      return emailItem;
    }
    return (
      <Email
        onComplete={stopEditing}
        onCancel={stopEditing}
        ctaLabel={t('cta.continue')}
        hideHeader
      />
    );
  };

  const actions: SectionAction[] = [];
  if (!editing) {
    actions.push({
      label: t('confirm.summary.edit'),
      onClick: () => setEditing(true),
    });
  }

  return (
    <Section
      testID="email-section"
      title={t('confirm.email.title')}
      actions={actions}
      IconComponent={IcoEmail24}
      content={getSectionContent()}
    />
  );
};

export default EmailSection;
