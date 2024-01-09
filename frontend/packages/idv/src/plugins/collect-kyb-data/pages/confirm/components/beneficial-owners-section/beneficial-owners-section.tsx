import { useTranslation } from '@onefootprint/hooks';
import { IcoUserCircle24 } from '@onefootprint/icons';
import {
  BeneficialOwnerDataAttribute,
  BusinessDI,
  CollectedKybDataOption,
} from '@onefootprint/types';
import React, { useState } from 'react';

import type {
  SectionItemProps,
  SectionProps,
} from '../../../../../../components/confirm-collected-data';
import {
  MultiSection,
  Section,
  SectionItem,
} from '../../../../../../components/confirm-collected-data';
import useCollectKybDataMachine from '../../../../hooks/use-collect-kyb-data-machine';
import BeneficialOwners from '../../../beneficial-owners/beneficial-owners';

const BeneficialOwnersSection = () => {
  const { t, allT } = useTranslation('kyb.pages.confirm.beneficial-owners');
  const [state] = useCollectKybDataMachine();
  const {
    data,
    kybRequirement: { missingAttributes },
  } = state.context;
  const isMultiKyc = missingAttributes.includes(
    CollectedKybDataOption.kycedBeneficialOwners,
  );
  const [editing, setEditing] = useState(false);

  const beneficialOwners =
    (isMultiKyc
      ? data[BusinessDI.kycedBeneficialOwners]
      : data[BusinessDI.beneficialOwners]) ?? [];
  if (!beneficialOwners.length) {
    return null;
  }

  const sections: SectionProps[] = [];
  beneficialOwners.forEach((beneficialOwner, index) => {
    const items = [
      {
        text: t('first-name'),
        subtext: beneficialOwner[BeneficialOwnerDataAttribute.firstName],
      },
      {
        text: t('last-name'),
        subtext: beneficialOwner[BeneficialOwnerDataAttribute.lastName],
      },
    ];

    const email = beneficialOwner[BeneficialOwnerDataAttribute.email];
    if (index > 0 && email) {
      items.push({
        text: t('email'),
        subtext: email,
      });
    }

    items.push({
      text: t('ownership-stake'),
      subtext: `${
        beneficialOwner[BeneficialOwnerDataAttribute.ownershipStake]
      }%`,
    });

    sections.push({
      title:
        index === 0 ? t('beneficial-owner-you') : t('beneficial-owner-other'),
      content: items.map(({ text, subtext, textColor }: SectionItemProps) => (
        <SectionItem
          key={text}
          text={text}
          subtext={subtext}
          textColor={textColor}
        />
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
      title={t('title')}
      IconComponent={IcoUserCircle24}
      content={
        <BeneficialOwners
          hideHeader
          ctaLabel={allT('kyb.pages.confirm.summary.save')}
          onComplete={stopEditing}
          onCancel={stopEditing}
        />
      }
      testID="beneficial-owners"
    />
  ) : (
    <MultiSection
      title={t('title')}
      editLabel={allT('kyb.pages.confirm.summary.edit')}
      onEdit={startEditing}
      IconComponent={IcoUserCircle24}
      sections={sections}
      testID="beneficial-owners"
    />
  );
};

export default BeneficialOwnersSection;
