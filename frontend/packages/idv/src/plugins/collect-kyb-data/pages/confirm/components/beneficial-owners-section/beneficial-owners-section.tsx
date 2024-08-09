import { IcoUserCircle24 } from '@onefootprint/icons';
import { BeneficialOwnerDataAttribute, BusinessDI, CollectedKybDataOption } from '@onefootprint/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box } from '@onefootprint/ui';
import type { SectionItemProps, SectionProps } from '../../../../../../components/confirm-collected-data';
import { MultiSection, Section, SectionItem } from '../../../../../../components/confirm-collected-data';
import useCollectKybDataMachine from '../../../../hooks/use-collect-kyb-data-machine';
import BeneficialOwners from '../../../beneficial-owners/beneficial-owners';

const BeneficialOwnersSection = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.confirm' });
  const [state] = useCollectKybDataMachine();
  const {
    data,
    kybRequirement: { missingAttributes, populatedAttributes },
    vaultBusinessData,
  } = state.context;
  const [isEditing, setIsEditing] = useState(false);
  const isKycBoMissing = missingAttributes.includes(CollectedKybDataOption.kycedBeneficialOwners);
  const isKycBoPopulated = populatedAttributes?.includes(CollectedKybDataOption.kycedBeneficialOwners) || false;

  const beneficialOwners =
    (isKycBoMissing || isKycBoPopulated ? data[BusinessDI.kycedBeneficialOwners] : data[BusinessDI.beneficialOwners]) ??
    [];

  if (!beneficialOwners.length) {
    return null;
  }

  const shouldHideEditButton = !!vaultBusinessData?.['business.kyced_beneficial_owners']?.length;

  const sections: SectionProps[] = [];
  beneficialOwners.forEach((beneficialOwner, index) => {
    const items: { text: string; subtext: string }[] = [];
    const firstName = beneficialOwner[BeneficialOwnerDataAttribute.firstName];
    const middleName = beneficialOwner[BeneficialOwnerDataAttribute.middleName];
    const lastName = beneficialOwner[BeneficialOwnerDataAttribute.lastName];
    const email = beneficialOwner[BeneficialOwnerDataAttribute.email];
    const ownershipStake = beneficialOwner[BeneficialOwnerDataAttribute.ownershipStake];

    if (firstName) {
      items.push({ text: t('beneficial-owners.first-name'), subtext: firstName });
    }

    if (middleName) {
      items.push({ text: t('beneficial-owners.middle-name'), subtext: middleName });
    }

    if (lastName) {
      items.push({ text: t('beneficial-owners.last-name'), subtext: lastName });
    }

    if (index > 0 && email) {
      items.push({ text: t('beneficial-owners.email'), subtext: email });
    }

    items.push({ text: t('beneficial-owners.ownership-stake'), subtext: `${ownershipStake}%` });

    sections.push({
      title: index === 0 ? t('beneficial-owners.beneficial-owner-you') : t('beneficial-owners.beneficial-owner-other'),
      content: (
        <Box display="flex" flexDirection="column" gap={6}>
          {items.map(({ text, subtext, textColor }: SectionItemProps) => (
            <SectionItem key={text} text={text} subtext={subtext} textColor={textColor} />
          ))}
        </Box>
      ),
    });
  });

  const startEditing = () => setIsEditing(true);

  const stopEditing = () => setIsEditing(false);

  return isEditing ? (
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
      editLabel={isKycBoPopulated || shouldHideEditButton ? '' : t('summary.edit')}
      onEdit={startEditing}
      IconComponent={IcoUserCircle24}
      sections={sections}
      testID="beneficial-owners"
    />
  );
};

export default BeneficialOwnersSection;
