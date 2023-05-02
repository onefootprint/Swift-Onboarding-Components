import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText24 } from '@onefootprint/icons';
import { BusinessDI } from '@onefootprint/types';
import React from 'react';

import { Section } from '../../../../../../components/confirm-collected-data';
import useCollectKybDataMachine from '../../../../hooks/use-collect-kyb-data-machine';

type BasicDataSectionProps = {
  onEdit: () => void;
};

const BasicDataSection = ({ onEdit }: BasicDataSectionProps) => {
  const { allT, t } = useTranslation('pages.confirm.basic-data');
  const [state] = useCollectKybDataMachine();
  const { data } = state.context;

  const basicInfo = [];

  const name = data[BusinessDI.name];
  if (name) {
    basicInfo.push({
      text: t('business-name'),
      subtext: name,
    });
  }

  const tin = data[BusinessDI.tin];
  if (tin) {
    basicInfo.push({
      text: t('tin'),
      subtext: tin,
    });
  }

  const website = data[BusinessDI.website];
  if (website) {
    basicInfo.push({
      text: t('website'),
      subtext: website,
    });
  }

  const phone = data[BusinessDI.phoneNumber];
  if (phone) {
    basicInfo.push({
      text: t('phone-number'),
      subtext: phone,
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
      title={t('title')}
      editLabel={allT('pages.confirm.summary.edit')}
      onEdit={handleEdit}
      IconComponent={IcoFileText24}
      items={basicInfo}
    />
  );
};

export default BasicDataSection;
