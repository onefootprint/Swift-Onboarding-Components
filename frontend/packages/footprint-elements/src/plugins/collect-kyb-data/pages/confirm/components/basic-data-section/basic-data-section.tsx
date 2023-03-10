import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText24 } from '@onefootprint/icons';
import { BusinessDataAttribute } from '@onefootprint/types';
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

  const firstName = data[BusinessDataAttribute.name];
  if (firstName) {
    basicInfo.push({
      text: t('business-name'),
      subtext: firstName,
    });
  }

  const lastName = data[BusinessDataAttribute.ein];
  if (lastName) {
    basicInfo.push({
      text: t('ein'),
      subtext: lastName,
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
