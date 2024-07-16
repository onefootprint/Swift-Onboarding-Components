import { IcoFileText24 } from '@onefootprint/icons';
import type { CollectKycDataRequirement } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import React, { useState } from 'react';

import type { SectionAction, SectionItemProps } from '@/components/confirm-collected-data';
import { Section, SectionItem } from '@/components/confirm-collected-data';
import useTranslation from '@/hooks/use-translation';
import BasicInformation from '@/screens/basic-information';
import type { KycData } from '@/types';

type BasicInfoSectionProps = {
  authToken: string;
  requirement: CollectKycDataRequirement;
  data: KycData;
  onConfirm: (data: KycData) => void;
};

const BasicInfoSection = ({ data, onConfirm, authToken, requirement }: BasicInfoSectionProps) => {
  const { t, allT } = useTranslation('pages.confirm');
  const [editing, setEditing] = useState(false);

  const basicInfo: SectionItemProps[] = [];

  const firstName = data[IdDI.firstName]?.value;
  if (firstName) {
    basicInfo.push({
      text: t('basic-info.first-name'),
      subtext: firstName,
    });
  }

  const middleName = data[IdDI.middleName]?.value;
  if (middleName) {
    basicInfo.push({
      text: t('basic-info.middle-name'),
      subtext: middleName,
    });
  }

  const lastName = data[IdDI.lastName]?.value;
  if (lastName) {
    basicInfo.push({
      text: t('basic-info.last-name'),
      subtext: lastName,
    });
  }

  const dob = data[IdDI.dob]?.value;
  if (dob) {
    basicInfo.push({
      text: t('basic-info.dob'),
      subtext: dob,
    });
  }

  // TODO: Add support for nationality

  if (!basicInfo.length) {
    return null;
  }

  const handleComplete = (kycData: KycData) => {
    onConfirm(kycData);
    setEditing(false);
  };

  const stopEditing = () => {
    setEditing(false);
  };

  const getSectionContent = (list: SectionItemProps[]) =>
    !editing ? (
      list.map(({ text, subtext, textColor }) => (
        <SectionItem key={text} text={text} subtext={subtext} textColor={textColor} />
      ))
    ) : (
      <BasicInformation
        onComplete={handleComplete}
        onCancel={stopEditing}
        authToken={authToken}
        requirement={requirement}
        data={data}
        hideHeader
      />
    );

  const actions: SectionAction[] = [];
  if (!editing) {
    actions.push({
      label: allT('pages.confirm.summary.edit'),
      onClick: () => setEditing(true),
    });
  }

  return (
    <Section
      title={t('basic-info.title')}
      actions={actions}
      IconComponent={IcoFileText24}
      content={getSectionContent(basicInfo)}
      testID="basic-info-section"
    />
  );
};

export default BasicInfoSection;
