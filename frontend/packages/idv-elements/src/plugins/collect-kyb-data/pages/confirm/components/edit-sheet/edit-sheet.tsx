import { useTranslation } from '@onefootprint/hooks';
import { BottomSheet } from '@onefootprint/ui';
import React from 'react';

import BasicData from '../../../basic-data';
import BeneficialOwners from '../../../beneficial-owners';
import BusinessAddress from '../../../business-address';

export enum EditSection {
  basicData = 'basic-data',
  businessAddress = 'business-address',
  beneficialOwners = 'beneficial-owners',
}

// TODO: delete
type EditSheetProps = {
  open: boolean;
  section?: EditSection;
  onClose: () => void;
};

const EditSheet = ({ section, open, onClose }: EditSheetProps) => {
  const { t } = useTranslation('pages.confirm.edit-sheet');
  const ctaLabel = t('save');

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t('title', { name: t(`name.${section}`) })}
    >
      {section === EditSection.basicData && (
        <BasicData ctaLabel={ctaLabel} onComplete={onClose} hideHeader />
      )}
      {section === EditSection.businessAddress && (
        <BusinessAddress ctaLabel={ctaLabel} onComplete={onClose} hideHeader />
      )}
      {section === EditSection.beneficialOwners && (
        <BeneficialOwners ctaLabel={ctaLabel} onComplete={onClose} hideHeader />
      )}
    </BottomSheet>
  );
};

export default EditSheet;
