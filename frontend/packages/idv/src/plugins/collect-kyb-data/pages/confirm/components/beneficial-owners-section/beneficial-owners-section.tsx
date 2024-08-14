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
    kybRequirement: { missingAttributes, populatedAttributes, hasLinkedBos },
    vaultBusinessData,
  } = state.context;
  const [isEditing, setIsEditing] = useState(false);
  const isKycBoMissing = missingAttributes.includes(CollectedKybDataOption.kycedBeneficialOwners);
  const isKycBoPopulated = populatedAttributes?.includes(CollectedKybDataOption.kycedBeneficialOwners) || false;
  const shouldHideEditButton = !!vaultBusinessData?.['business.kyced_beneficial_owners']?.length;
  const beneficialOwners =
    (isKycBoMissing || isKycBoPopulated ? data[BusinessDI.kycedBeneficialOwners] : data[BusinessDI.beneficialOwners]) ??
    [];

  if (!beneficialOwners.length || hasLinkedBos) {
    return null;
  }

  const getPreviewSections = () => {
    const sections: SectionProps[] = [];

    beneficialOwners.forEach((beneficialOwner, index) => {
      const items: { text: string; subtext: string }[] = [];
      const isPrimary = index === 0;
      const firstName = beneficialOwner[BeneficialOwnerDataAttribute.firstName];
      const middleName = beneficialOwner[BeneficialOwnerDataAttribute.middleName];
      const lastName = beneficialOwner[BeneficialOwnerDataAttribute.lastName];
      const email = beneficialOwner[BeneficialOwnerDataAttribute.email];
      const phoneNumber = beneficialOwner[BeneficialOwnerDataAttribute.phoneNumber];
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
      if (!isPrimary) {
        if (email) {
          items.push({ text: t('beneficial-owners.email'), subtext: email });
        }
        if (phoneNumber) {
          items.push({ text: t('beneficial-owners.phone-number'), subtext: phoneNumber });
        }
      }
      items.push({ text: t('beneficial-owners.ownership-stake'), subtext: `${ownershipStake}%` });

      sections.push({
        title: isPrimary ? t('beneficial-owners.beneficial-owner-you') : t('beneficial-owners.beneficial-owner-other'),
        content: (
          <Box display="flex" flexDirection="column" gap={6}>
            {items.map(({ text, subtext, textColor }: SectionItemProps) => (
              <SectionItem key={text} text={text} subtext={subtext} textColor={textColor} />
            ))}
          </Box>
        ),
      });
    });
    return sections;
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const stopEditing = () => {
    setIsEditing(false);
  };

  return isEditing ? (
    <Section
      content={
        <BeneficialOwners hideHeader ctaLabel={t('summary.save')} onComplete={stopEditing} onCancel={stopEditing} />
      }
      IconComponent={IcoUserCircle24}
      testID="beneficial-owners"
      title={t('beneficial-owners.title')}
    />
  ) : (
    <MultiSection
      editLabel={isKycBoPopulated || shouldHideEditButton ? '' : t('summary.edit')}
      IconComponent={IcoUserCircle24}
      onEdit={startEditing}
      sections={getPreviewSections()}
      testID="beneficial-owners"
      title={t('beneficial-owners.title')}
    />
  );
};

export default BeneficialOwnersSection;
