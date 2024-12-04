import { IcoUpdated16 } from '@onefootprint/icons';
import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { RoleScopeKind } from '@onefootprint/types';
import { Button, CodeInline } from '@onefootprint/ui';
import { cx } from 'class-variance-authority';
import type { ParseKeys } from 'i18next';
import { Suspense, lazy, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';

const Create = lazy(() => import('src/components/playbooks/create-playbook'));
const Versions = lazy(() => import('../versions'));

export type HeaderProps = {
  isDisabled: boolean;
  playbook: OnboardingConfiguration;
  playbooks: OnboardingConfiguration[];
};

const Header = ({ playbook, isDisabled, playbooks }: HeaderProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'header' });
  const hasVersions = playbooks.length > 1;

  return (
    <>
      <div
        className={cx('flex flex-col gap-1', {
          'opacity-50 pointer-events-none select-none': isDisabled,
        })}
      >
        <h2 className="text-label-1 text-primary">{playbook.name}</h2>
        <div className="flex flex-wrap items-center justify-between gap-2 w-full min-h-[32px]">
          <div className="flex items-center justify-center gap-2">
            <h4 className="text-body-3 text-primary">{t(`type.${playbook.kind}` as ParseKeys<'common'>)}</h4>
            <span>·</span>
            <CodeInline truncate isPrivate>
              {playbook.key}
            </CodeInline>
            {hasVersions && <ManageVersions playbooks={playbooks} />}
          </div>
          <EditButton playbook={playbook} />
        </div>
      </div>
    </>
  );
};

const ManageVersions = ({ playbooks }: { playbooks: OnboardingConfiguration[] }) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'header' });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <span>·</span>
      <button
        className="flex gap-2 items-center text-label-3 text-secondary hover:cursor-pointer"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        {t('edited')}
        <IcoUpdated16 />
      </button>
      <Suspense>
        <Versions open={isOpen} onClose={() => setIsOpen(false)} playbooks={playbooks} />
      </Suspense>
    </>
  );
};

const EditButton = ({ playbook }: { playbook: OnboardingConfiguration }) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'header' });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <PermissionGate
        scopeKind={RoleScopeKind.onboardingConfiguration}
        fallbackText={t('edit.cta-not-allowed')}
        tooltipPosition="left"
      >
        <Button variant="secondary" onClick={() => setIsOpen(true)}>
          {t('edit.cta')}
        </Button>
      </PermissionGate>
      <Suspense>
        <Create open={isOpen} onClose={() => setIsOpen(false)} onDone={() => setIsOpen(false)} playbook={playbook} />
      </Suspense>
    </>
  );
};

export default Header;
