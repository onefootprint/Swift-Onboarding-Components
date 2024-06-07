import { IcoFileText24 } from '@onefootprint/icons';
import { BusinessDI } from '@onefootprint/types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { SectionAction } from '../../../../../../components/confirm-collected-data';
import { Section, SectionItem } from '../../../../../../components/confirm-collected-data';
import type { SectionItemProps } from '../../../../../../components/confirm-collected-data/components/section-item';
import useCollectKybDataMachine from '../../../../hooks/use-collect-kyb-data-machine';
import BasicData from '../../../basic-data';

const BasicDataSection = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages' });
  const [state] = useCollectKybDataMachine();
  const { data } = state.context;
  const [editing, setEditing] = useState(false);

  const basicInfo = [];

  const name = data[BusinessDI.name];
  if (name) {
    basicInfo.push({
      text: t('confirm.basic-data.business-name'),
      subtext: name,
    });
  }

  const doingBusinessAs = data[BusinessDI.doingBusinessAs];
  if (doingBusinessAs) {
    basicInfo.push({
      text: t('confirm.basic-data.doing-business-as'),
      subtext: doingBusinessAs,
    });
  }

  const tin = data[BusinessDI.tin];
  if (tin) {
    basicInfo.push({
      text: t('confirm.basic-data.tin'),
      subtext: tin,
    });
  }

  const corporationType = data[BusinessDI.corporationType];
  if (corporationType) {
    basicInfo.push({
      text: t('confirm.basic-data.corporation-type'),
      subtext: t(`basic-data.form.corporation-type.mapping.${corporationType}` as unknown as TemplateStringsArray),
    });
  }

  const website = data[BusinessDI.website];
  if (website) {
    basicInfo.push({
      text: t('confirm.basic-data.website'),
      subtext: website,
    });
  }

  const phone = data[BusinessDI.phoneNumber];
  if (phone) {
    basicInfo.push({
      text: t('confirm.basic-data.phone-number'),
      subtext: phone,
    });
  }

  if (!basicInfo.length) {
    return null;
  }

  const stopEditing = () => {
    setEditing(false);
  };

  const basicInfoDetails = basicInfo.map(
    // @ts-ignore:next-line
    ({ text, subtext, textColor }: SectionItemProps) => (
      <SectionItem key={text} text={text} subtext={subtext} textColor={textColor} />
    ),
  );

  const getSectionContent = () => {
    if (!editing) {
      return basicInfoDetails;
    }
    return (
      <BasicData hideHeader ctaLabel={t('confirm.summary.save')} onComplete={stopEditing} onCancel={stopEditing} />
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
      testID="basic-data"
      title={t('confirm.basic-data.title')}
      actions={actions}
      IconComponent={IcoFileText24}
      content={getSectionContent()}
    />
  );
};
export default BasicDataSection;
