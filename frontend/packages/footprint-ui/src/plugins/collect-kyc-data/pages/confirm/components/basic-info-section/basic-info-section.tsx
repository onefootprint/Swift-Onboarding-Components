import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText24 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import React, { useState } from 'react';

import { useCollectKycDataMachine } from '../../../../components/machine-provider';
import BasicInformation from '../../../basic-information';
import EditSheet from '../edit-sheet';
import Section from '../section';

const BasicInfoSection = () => {
  const { t } = useTranslation('pages.confirm');
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;
  const [edit, setEdit] = useState(false);
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
        title={t('basic-info.title')}
        onEdit={handleEdit}
        IconComponent={IcoFileText24}
        items={basicInfo}
      />
      <EditSheet
        open={!!edit}
        onClose={handleCloseEdit}
        name={t('basic-info.title')}
      >
        <BasicInformation
          ctaLabel={t('edit-sheet.save')}
          onComplete={handleComplete}
        />
      </EditSheet>
    </>
  );
};

export default BasicInfoSection;
