import { useToggle } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';
import { CREATE_DEFAULT_VALUES } from 'src/pages/proxy-configs/constants';

import Dialog from './components/dialog';

const Create = () => {
  const { t } = useTranslation('proxy-configs');
  const [isOpen, open, close] = useToggle(false);

  return (
    <>
      <PermissionGate scopeKind="manage_vault_proxy" fallbackText={t('create.cta-not-allowed')}>
        <Button variant="primary" onClick={open}>
          {t('create.cta')}
        </Button>
      </PermissionGate>
      <Dialog defaultValues={CREATE_DEFAULT_VALUES} onClose={close} open={isOpen} />
    </>
  );
};

export default Create;
