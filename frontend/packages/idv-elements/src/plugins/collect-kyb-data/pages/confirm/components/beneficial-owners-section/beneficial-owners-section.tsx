import { useTranslation } from '@onefootprint/hooks';
import { IcoUserCircle24 } from '@onefootprint/icons';
import {
  BeneficialOwnerDataAttribute,
  BusinessDI,
  CollectedKybDataOption,
} from '@onefootprint/types';
import React from 'react';

import {
  MultiSection,
  SectionProps,
} from '../../../../../../components/confirm-collected-data';
import useCollectKybDataMachine from '../../../../hooks/use-collect-kyb-data-machine';

type BeneficialOwnersSectionProps = {
  onEdit: () => void;
};

const BeneficialOwnersSection = ({ onEdit }: BeneficialOwnersSectionProps) => {
  const { t, allT } = useTranslation('pages.confirm.beneficial-owners');
  const [state] = useCollectKybDataMachine();
  const { data, missingKybAttributes } = state.context;
  const isMultiKyc = missingKybAttributes.includes(
    CollectedKybDataOption.kycedBeneficialOwners,
  );

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
      items,
    });
  });

  return (
    <MultiSection
      title={t('title')}
      editLabel={allT('pages.confirm.summary.edit')}
      onEdit={onEdit}
      IconComponent={IcoUserCircle24}
      sections={sections}
    />
  );
};

export default BeneficialOwnersSection;
