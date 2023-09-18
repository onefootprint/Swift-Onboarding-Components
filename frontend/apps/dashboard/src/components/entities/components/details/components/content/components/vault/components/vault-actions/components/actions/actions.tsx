import { useTranslation } from '@onefootprint/hooks';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import { EntityKind } from '@onefootprint/types';
import { Dropdown } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import type { WithEntityProps } from '../../../../../../../with-entity';
import RetriggerKYCDialog from './components/retrigger-kyc-dialog';

const Actions = ({ entity }: WithEntityProps) => {
  const router = useRouter();
  const { t } = useTranslation('pages.entity.actions');
  const [dialogOpen, setDialogOpen] = useState(false);

  const shouldShowActionsDropdown =
    entity?.isPortable && entity.kind === EntityKind.person;

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const share = () => {
    const { origin } = window.location;
    const path = router.asPath;
    navigator.clipboard.writeText(`${origin}${path}`);
  };

  return shouldShowActionsDropdown ? (
    <>
      <Dropdown.Root>
        <Dropdown.Trigger $asButton aria-label={t('cta')}>
          <IcoDotsHorizontal24 />
        </Dropdown.Trigger>
        <Dropdown.Content align="end" sideOffset={8}>
          <Dropdown.Item onSelect={handleOpenDialog}>
            {t('retrigger-kyc.label')}
          </Dropdown.Item>
          <Dropdown.Item onClick={share}>{t('share.label')}</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
      <RetriggerKYCDialog open={dialogOpen} onClose={handleCloseDialog} />
    </>
  ) : null;
};

export default Actions;
