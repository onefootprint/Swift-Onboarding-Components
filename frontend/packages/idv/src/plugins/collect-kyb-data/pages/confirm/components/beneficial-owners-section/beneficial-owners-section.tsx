import { IcoUserCircle24 } from '@onefootprint/icons';
import { BeneficialOwnerDataAttribute, BusinessDI, CollectedKybDataOption } from '@onefootprint/types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { SectionItemProps, SectionProps } from '../../../../../../components/confirm-collected-data';
import { MultiSection, Section, SectionItem } from '../../../../../../components/confirm-collected-data';
import useCollectKybDataMachine from '../../../../hooks/use-collect-kyb-data-machine';
import BeneficialOwners from '../../../beneficial-owners/beneficial-owners';

const BeneficialOwnersSection = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.confirm' });
  const [state] = useCollectKybDataMachine();
  const {
    data,
    kybRequirement: { missingAttributes },
  } = state.context;
  const isMultiKyc = missingAttributes.includes(CollectedKybDataOption.kycedBeneficialOwners);
  const [editing, setEditing] = useState(false);

  const beneficialOwners =
    (isMultiKyc ? data[BusinessDI.kycedBeneficialOwners] : data[BusinessDI.beneficialOwners]) ?? [];
  if (!beneficialOwners.length) {
    return null;
  }

  const sections: SectionProps[] = [];
  beneficialOwners.forEach((beneficialOwner, index) => {
    const items: { text: string; subtext: string }[] = [
      {
        text: t('beneficial-owners.first-name'),
        subtext: beneficialOwner[BeneficialOwnerDataAttribute.firstName],
      },
      {
        text: t('beneficial-owners.last-name'),
        subtext: beneficialOwner[BeneficialOwnerDataAttribute.lastName],
      },
    ];

    const email = beneficialOwner[BeneficialOwnerDataAttribute.email];
    if (index > 0 && email) {
      items.push({
        text: t('beneficial-owners.email'),
        subtext: email,
      });
    }

    items.push({
      text: t('beneficial-owners.ownership-stake'),
      subtext: `${beneficialOwner[BeneficialOwnerDataAttribute.ownershipStake]}%`,
    });

    sections.push({
      title: index === 0 ? t('beneficial-owners.beneficial-owner-you') : t('beneficial-owners.beneficial-owner-other'),
      content: items.map(({ text, subtext, textColor }: SectionItemProps) => (
        <SectionItem key={text} text={text} subtext={subtext} textColor={textColor} />
      )),
    });
  });

  const startEditing = () => {
    setEditing(true);
  };

  const stopEditing = () => {
    setEditing(false);
  };

  return editing ? (
    <Section
      title={t('beneficial-owners.title')}
      IconComponent={IcoUserCircle24}
      content={
        <BeneficialOwners hideHeader ctaLabel={t('summary.save')} onComplete={stopEditing} onCancel={stopEditing} />
      }
      testID="beneficial-owners"
    />
  ) : (
    <MultiSection
      title={t('beneficial-owners.title')}
      editLabel={t('summary.edit')}
      onEdit={startEditing}
      IconComponent={IcoUserCircle24}
      sections={sections}
      testID="beneficial-owners"
    />
  );
};

export default BeneficialOwnersSection;
