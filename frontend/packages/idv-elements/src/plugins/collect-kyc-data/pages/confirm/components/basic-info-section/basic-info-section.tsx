import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText24 } from '@onefootprint/icons';
import {
  CollectedKycDataOption,
  IdDI,
  isCountryCode,
} from '@onefootprint/types';
import React, { useState } from 'react';

import type {
  SectionAction,
  SectionItemProps,
} from '../../../../../../components/confirm-collected-data';
import {
  Section,
  SectionItem,
} from '../../../../../../components/confirm-collected-data';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import allAttributes from '../../../../utils/all-attributes/all-attributes';
import getInitialCountry from '../../../../utils/get-initial-country';
import BasicInformation from '../../../basic-information';

const BasicInfoSection = () => {
  const { t, allT } = useTranslation('kyc.pages.confirm');
  const [state] = useCollectKycDataMachine();
  const { data, requirement } = state.context;
  const [editing, setEditing] = useState(false);
  const attributes = allAttributes(requirement);

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

  const requiresUsLegalStatus = attributes.includes(
    CollectedKycDataOption.usLegalStatus,
  );
  const countryVal = data[IdDI.nationality]?.value;
  const defaultCountry =
    countryVal && isCountryCode(countryVal) ? countryVal : undefined;
  const nationality = getInitialCountry(defaultCountry)?.label;
  // we only want to display nationality / the default country if we collected it and if there is no legal status data
  if (!requiresUsLegalStatus && countryVal && nationality) {
    basicInfo.push({
      text: t('basic-info.nationality'),
      subtext: nationality,
    });
  }

  if (!basicInfo.length) {
    return null;
  }

  const stopEditing = () => {
    setEditing(false);
  };

  const getSectionContent = (list: SectionItemProps[]) =>
    !editing ? (
      list.map(({ text, subtext, textColor }) => (
        <SectionItem
          key={text}
          text={text}
          subtext={subtext}
          textColor={textColor}
        />
      ))
    ) : (
      <BasicInformation
        onComplete={stopEditing}
        onCancel={stopEditing}
        hideHeader
      />
    );

  const actions: SectionAction[] = [];
  if (!editing) {
    actions.push({
      label: allT('kyc.pages.confirm.summary.edit'),
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
