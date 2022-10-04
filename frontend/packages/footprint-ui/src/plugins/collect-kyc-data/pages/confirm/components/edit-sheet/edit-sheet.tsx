import { useTranslation } from '@onefootprint/hooks';
import { BottomSheet } from '@onefootprint/ui';
import React from 'react';

type EditSheetProps = {
  name: string;
  open: boolean;
  children: React.ReactNode;
  onClose: () => void;
};

const EditSheet = ({ name, children, open, onClose }: EditSheetProps) => {
  const { t } = useTranslation('pages.confirm.edit-sheet');
  return (
    <BottomSheet open={open} onClose={onClose} title={t('title', { name })}>
      {children}
    </BottomSheet>
  );
};

export default EditSheet;
