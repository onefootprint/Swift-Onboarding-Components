import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText24 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';

import { Section } from '../../../../../../components/confirm-collected-data';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';

type BasicInfoSectionProps = {
  onEdit: () => void;
};

const BasicInfoSection = ({ onEdit }: BasicInfoSectionProps) => {
  const { t, allT } = useTranslation('pages.confirm');
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;

  const basicInfo = [];

  const firstName = data[UserDataAttribute.firstName];
  if (firstName) {
    basicInfo.push({
      text: t('basic-info.first-name'),
      subtext: firstName,
    });
  }

  const lastName = data[UserDataAttribute.lastName];
  if (lastName) {
    basicInfo.push({
      text: t('basic-info.last-name'),
      subtext: lastName,
    });
  }

  const dob = data[UserDataAttribute.dob];
  if (dob) {
    basicInfo.push({
      text: t('basic-info.dob'),
      subtext: dob,
    });
  }

  if (!basicInfo.length) {
    return null;
  }

  const handleEdit = () => {
    onEdit();
  };

  return (
    <Section
      title={t('basic-info.title')}
      editLabel={allT('pages.confirm.summary.edit')}
      onEdit={handleEdit}
      IconComponent={IcoFileText24}
      items={basicInfo}
    />
  );
};

export default BasicInfoSection;
