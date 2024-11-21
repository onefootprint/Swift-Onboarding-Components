import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { Dialog } from '@onefootprint/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import VersionDetails from './version-detail';
import VersionsList from './versions-list';

type VersionsProps = {
  open: boolean;
  onClose: () => void;
  playbooks: OnboardingConfiguration[];
};

const Versions = ({ open, onClose, playbooks }: VersionsProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'versions' });
  const [current] = playbooks;
  const original = playbooks[playbooks.length - 1];
  const [selectedPlaybook, setSelectedPlaybook] = useState<OnboardingConfiguration>(current);

  useEffect(() => {
    if (!open) setSelectedPlaybook(current);
  }, [open]);

  const getPreviousPlaybook = (selected: OnboardingConfiguration) => {
    const selectedIndex = playbooks.findIndex(p => p.id === selected.id);
    return selectedIndex < playbooks.length - 1 ? playbooks[selectedIndex + 1] : null;
  };

  return (
    <Dialog title={t('title')} size="full-screen" open={open} onClose={onClose} noPadding noScroll>
      <div className="flex w-full overflow-hidden h-full">
        <div className="w-[30%] h-full">
          <VersionsList playbooks={playbooks} selected={selectedPlaybook} onChange={setSelectedPlaybook} />
        </div>
        <div className="w-[70%] h-full">
          <VersionDetails
            playbook={selectedPlaybook}
            previousPlaybook={getPreviousPlaybook(selectedPlaybook)}
            isCurrent={selectedPlaybook.id === current.id}
            isOriginal={selectedPlaybook.id === original.id}
            onRestore={console.log}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default Versions;
