import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText24 } from '@onefootprint/icons';
import { BusinessDI } from '@onefootprint/types';
import React, { useState } from 'react';

import type { SectionAction } from '../../../../../../components/confirm-collected-data';
import {
  Section,
  SectionItem,
} from '../../../../../../components/confirm-collected-data';
import type { SectionItemProps } from '../../../../../../components/confirm-collected-data/components/section-item';
import useCollectKybDataMachine from '../../../../hooks/use-collect-kyb-data-machine';
import BasicData from '../../../basic-data';

const BasicDataSection = () => {
  const { allT, t } = useTranslation('pages.confirm.basic-data');
  const [state] = useCollectKybDataMachine();
  const { data } = state.context;
  const [editing, setEditing] = useState(false);

  const basicInfo = [];

  const name = data[BusinessDI.name];
  if (name) {
    basicInfo.push({
      text: t('business-name'),
      subtext: name,
    });
  }

  const doingBusinessAs = data[BusinessDI.doingBusinessAs];
  if (doingBusinessAs) {
    basicInfo.push({
      text: t('doing-business-as'),
      subtext: doingBusinessAs,
    });
  }

  const tin = data[BusinessDI.tin];
  if (tin) {
    basicInfo.push({
      text: t('tin'),
      subtext: tin,
    });
  }

  const corporationType = data[BusinessDI.corporationType];
  if (corporationType) {
    basicInfo.push({
      text: t('corporation-type'),
      subtext: allT(
        `pages.basic-data.form.corporation-type.mapping.${corporationType}`,
      ),
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

  const stopEditing = () => {
    setEditing(false);
  };

  const basicInfoDetails = basicInfo.map(
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
      return basicInfoDetails;
    }
    return (
      <BasicData
        hideHeader
        ctaLabel={allT('pages.confirm.summary.save')}
        onComplete={stopEditing}
        onCancel={stopEditing}
      />
    );
  };

  const actions: SectionAction[] = [];
  if (!editing) {
    actions.push({
      label: allT('pages.confirm.summary.edit'),
      onClick: () => setEditing(true),
    });
  }

  return (
    <Section
      testID="basic-data"
      title={t('title')}
      actions={actions}
      IconComponent={IcoFileText24}
      content={getSectionContent()}
    />
  );
};
export default BasicDataSection;
