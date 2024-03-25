import { Dialog } from '@onefootprint/ui';
import { SelectNew } from '@onefootprint/ui/src/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import hasOptionRole from '@/helpers/has-option-role';

type DialogAssignProps = { isOpen?: boolean; onClose: () => void };

const DialogAssign = ({ isOpen, onClose }: DialogAssignProps) => {
  const { t } = useTranslation('common');

  const handleClose = (ev?: unknown) => {
    /** The options of <SelectNew /> are rendered outside of the dialog, causing CloseOnClickOutside */
    if (ev instanceof Event && hasOptionRole(ev?.target)) return;
    onClose();
  };

  return isOpen ? (
    <Dialog
      onClose={handleClose}
      open
      primaryButton={{ label: t('save'), type: 'submit' }}
      secondaryButton={{ label: t('cancel'), onClick: handleClose }}
      size="compact"
      title={t('doc.assign-document')}
    >
      <SelectNew
        size="compact"
        disabled={false}
        options={[
          { label: 'Boo Lee', value: '12873' },
          { label: 'Rita Lee', value: '98731' },
        ]}
        contentWidth="auto"
        label={t('assign-to')}
        placeholder={t('select-placeholder')}
        triggerWidth="full"
      />
    </Dialog>
  ) : null;
};

export default DialogAssign;
