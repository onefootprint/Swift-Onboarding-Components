import { useTranslation } from '@onefootprint/hooks';
import { BottomSheet } from '@onefootprint/ui';
import React from 'react';

import BasicInformation from '../../../basic-information';
import ResidentialAddress from '../../../residential-address';
import SSN from '../../../ssn';

export enum EditSection {
  basicInfo = 'basic-info',
  address = 'address',
  identity = 'identity',
}

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
      {section === EditSection.basicInfo && (
        <BasicInformation
          ctaLabel={ctaLabel}
          onComplete={onClose}
          hideTitle
          hideNavHeader
        />
      )}
      {section === EditSection.address && (
        <ResidentialAddress
          ctaLabel={ctaLabel}
          onComplete={onClose}
          hideTitle
          hideNavHeader
        />
      )}
      {section === EditSection.identity && (
        <SSN
          ctaLabel={ctaLabel}
          onComplete={onClose}
          hideDisclaimer
          hideTitle
          hideNavHeader
        />
      )}
    </BottomSheet>
  );
};

export default EditSheet;
