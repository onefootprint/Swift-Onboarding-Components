import { IcoFileText24 } from '@onefootprint/icons';
import { BusinessDI, BusinessDIData } from '@onefootprint/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box } from '@onefootprint/ui';
import { TFunction } from 'i18next';
import type { SectionAction } from '../../../../../../components/confirm-collected-data';
import { Section, SectionItem } from '../../../../../../components/confirm-collected-data';
import type { SectionItemProps } from '../../../../../../components/confirm-collected-data/components/section-item';
import useCollectKybDataMachine from '../../../../hooks/use-collect-kyb-data-machine';
import BasicData from '../../../basic-data';

type T = TFunction<'idv', 'kyb.pages'>;

const getContentItems = (t: T, data: BusinessDIData) => {
  const list = [];
  const name = data[BusinessDI.name];
  const doingBusinessAs = data[BusinessDI.doingBusinessAs];
  const corporationType = data[BusinessDI.corporationType];
  const website = data[BusinessDI.website];
  const phone = data[BusinessDI.phoneNumber];

  if (name) {
    list.push({ text: t('confirm.basic-data.business-name'), subtext: name });
  }
  if (doingBusinessAs) {
    list.push({ text: t('confirm.basic-data.doing-business-as'), subtext: doingBusinessAs });
  }
  if (corporationType) {
    list.push({
      text: t('confirm.basic-data.corporation-type'),
      subtext: t(`basic-data.form.corporation-type.mapping.${corporationType}` as unknown as TemplateStringsArray),
    });
  }
  if (website) {
    list.push({ text: t('confirm.basic-data.website'), subtext: website });
  }
  if (phone) {
    list.push({ text: t('confirm.basic-data.phone-number'), subtext: phone });
  }

  return list;
};

const BasicDataSection = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages' });
  const [state] = useCollectKybDataMachine();
  const [isEditing, setIsEditing] = useState(false);

  const { data } = state.context;
  const contentItems = getContentItems(t, data);

  const stopEditing = () => setIsEditing(false);

  if (!contentItems.length) {
    return null;
  }

  const getSectionContent = () => {
    return !isEditing ? (
      <Box display="flex" flexDirection="column" gap={6}>
        {contentItems.map(({ text, subtext, textColor }: SectionItemProps) => (
          <SectionItem key={text} text={text} subtext={subtext} textColor={textColor} />
        ))}
      </Box>
    ) : (
      <BasicData
        hideHeader
        hideInputTin
        ctaLabel={t('confirm.summary.save')}
        onComplete={stopEditing}
        onCancel={stopEditing}
      />
    );
  };

  const actions: SectionAction[] = [];

  if (!isEditing) {
    actions.push({
      label: t('confirm.summary.edit'),
      onClick: () => setIsEditing(true),
    });
  }

  return (
    <Section
      testID="basic-data"
      title={t('confirm.basic-data.title')}
      actions={actions}
      IconComponent={IcoFileText24}
      content={getSectionContent()}
    />
  );
};

export default BasicDataSection;
