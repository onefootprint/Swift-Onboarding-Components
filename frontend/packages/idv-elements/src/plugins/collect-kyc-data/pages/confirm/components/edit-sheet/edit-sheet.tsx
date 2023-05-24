import { useTranslation } from '@onefootprint/hooks';
import { BottomSheet } from '@onefootprint/ui';
import React from 'react';

import BasicInformation from '../../../basic-information';
import Email from '../../../email';
import ResidentialAddress from '../../../residential-address';
import SSN from '../../../ssn';

export enum EditSection {
  email = 'email',
  basicInfo = 'basic-info',
  address = 'address',
  identity = 'identity',
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
      {section === EditSection.email && (
        <Email ctaLabel={ctaLabel} onComplete={onClose} hideHeader />
      )}
      {section === EditSection.basicInfo && (
        <BasicInformation ctaLabel={ctaLabel} onComplete={onClose} hideHeader />
      )}
      {section === EditSection.address && (
        <ResidentialAddress
          ctaLabel={ctaLabel}
          onComplete={onClose}
          hideHeader
        />
      )}
      {section === EditSection.identity && (
        <SSN
          ctaLabel={ctaLabel}
          onComplete={onClose}
          hideDisclaimer
          hideHeader
        />
      )}
    </BottomSheet>
  );
};

export default EditSheet;
