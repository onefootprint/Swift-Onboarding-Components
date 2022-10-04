import { useTranslation } from '@onefootprint/hooks';
import { BottomSheet, Button } from '@onefootprint/ui';
import React from 'react';

type EditSheetProps = {
  name: string;
  open: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
};

const EditSheet = ({
  name,
  children,
  open,
  isLoading,
  onSave,
  onClose,
}: EditSheetProps) => {
  const { t } = useTranslation('pages.confirm.edit-sheet');
  return (
    <BottomSheet open={open} onClose={onClose} title={t('title', { name })}>
      {children}
      <Button fullWidth loading={isLoading} onClick={onSave}>
        {t('save')}
      </Button>
    </BottomSheet>
  );
};

export default EditSheet;
