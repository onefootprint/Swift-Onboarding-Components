import { useTranslation } from '@onefootprint/hooks';
import { BottomSheet, Button } from '@onefootprint/ui';
import { useIsMutating } from '@tanstack/react-query';
import React from 'react';

type EditSheetProps = {
  name: string;
  open: boolean;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
};

const EditSheet = ({
  name,
  children,
  open,
  onSave,
  onClose,
}: EditSheetProps) => {
  const { t } = useTranslation('pages.confirm.edit-sheet');
  const isMutating = useIsMutating();
  return (
    <BottomSheet open={open} onClose={onClose} title={t('title', { name })}>
      {children}
      <Button fullWidth loading={isMutating} onClick={onSave}>
        {t('save')}
      </Button>
    </BottomSheet>
  );
};

export default EditSheet;
