import { useToggle } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';

import Dialog from './components/dialog';

const Invite = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'pages.members.invite' });
  const [isOpen, open, close] = useToggle(false);

  return (
    <>
      <PermissionGate scopeKind="org_settings" fallbackText={t('not-allowed')}>
        <Button variant="secondary" onClick={open}>
          {t('title')}
        </Button>
      </PermissionGate>
      <Dialog onClose={close} open={isOpen} />
    </>
  );
};

export default Invite;
