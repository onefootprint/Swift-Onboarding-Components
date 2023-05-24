import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText24 } from '@onefootprint/icons';
import { IdDI, isCountryCode } from '@onefootprint/types';
import React from 'react';

import { Section } from '../../../../../../components/confirm-collected-data';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { getDisplayValue } from '../../../../utils/data-types';
import getInitialCountry from '../../../../utils/get-initial-country';

type BasicInfoSectionProps = {
  onEdit: () => void;
};

const BasicInfoSection = ({ onEdit }: BasicInfoSectionProps) => {
  const { t, allT } = useTranslation('pages.confirm');
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;

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
  if (nationality) {
    basicInfo.push({
      text: t('basic-info.nationality'),
      subtext: nationality,
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
