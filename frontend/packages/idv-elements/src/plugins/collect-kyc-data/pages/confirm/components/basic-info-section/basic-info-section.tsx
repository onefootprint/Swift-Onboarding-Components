import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText24 } from '@onefootprint/icons';
import { IdDI, isCountryCode } from '@onefootprint/types';
import React, { useState } from 'react';

import {
  type SectionItemProps,
  Section,
  SectionItem,
} from '../../../../../../components/confirm-collected-data';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { getDisplayValue } from '../../../../utils/data-types';
import getInitialCountry from '../../../../utils/get-initial-country';
import BasicInformation from '../../../basic-information/basic-information';

const BasicInfoSection = () => {
  const { t, allT } = useTranslation('pages.confirm');
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;
  const [editing, setEditing] = useState(false);

  const basicInfo = [];

  const firstName = getDisplayValue(data[IdDI.firstName]);
  if (firstName) {
    basicInfo.push({
      text: t('basic-info.first-name'),
      subtext: firstName,
    });
  }

  const lastName = getDisplayValue(data[IdDI.lastName]);
  if (lastName) {
    basicInfo.push({
      text: t('basic-info.last-name'),
      subtext: lastName,
    });
  }

  const dob = getDisplayValue(data[IdDI.dob]);
  if (dob) {
    basicInfo.push({
      text: t('basic-info.dob'),
      subtext: dob,
    });
  }

  const countryVal = data[IdDI.nationality]?.value;
  const defaultCountry =
    countryVal && isCountryCode(countryVal) ? countryVal : undefined;
  const nationality = getInitialCountry(defaultCountry).label;
  // we only want to display nationality / the default country if we collected it
  if (countryVal && nationality) {
    basicInfo.push({
      text: t('basic-info.nationality'),
      subtext: nationality,
    });
  }

  if (!basicInfo.length) {
    return null;
  }

  const startEditing = () => {
    setEditing(true);
  };

  const stopEditing = () => {
    setEditing(false);
  };

  const basicInfoItem = basicInfo.map(
    ({ text, subtext, textColor }: SectionItemProps) => (
      <SectionItem
        key={text}
        text={text}
        subtext={subtext}
        textColor={textColor}
      />
    ),
  );

  const getSectionContent = () => {
    if (!editing) {
      return basicInfoItem;
    }
    return (
      <BasicInformation
        onComplete={stopEditing}
        onCancel={stopEditing}
        hideHeader
      />
    );
  };

  return (
    <Section
      title={t('basic-info.title')}
      editLabel={allT('pages.confirm.summary.edit')}
      onEdit={editing ? undefined : startEditing}
      IconComponent={IcoFileText24}
      content={getSectionContent()}
      testID="basic-info-section"
    />
  );
};

export default BasicInfoSection;
