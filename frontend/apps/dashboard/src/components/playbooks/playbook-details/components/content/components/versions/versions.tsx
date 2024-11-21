import { postOrgPlaybooksByPlaybookIdRestoreMutation } from '@onefootprint/axios/dashboard';
import { getErrorMessage } from '@onefootprint/request';
import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { Dialog, useToast } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useInvalidateQueries from 'src/hooks/use-invalidate-queries';
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
  const restore = useMutation(postOrgPlaybooksByPlaybookIdRestoreMutation({}));
  const invalidateQueries = useInvalidateQueries();
  const toast = useToast();

  useEffect(() => {
    setSelectedPlaybook(current);
  }, [open, playbooks.length]);

  const getPreviousPlaybook = (selected: OnboardingConfiguration) => {
    const selectedIndex = playbooks.findIndex(p => p.id === selected.id);
    return selectedIndex < playbooks.length - 1 ? playbooks[selectedIndex + 1] : null;
  };

  const handleRestore = async (playbook: OnboardingConfiguration) => {
    try {
      await restore.mutateAsync({
        path: {
          playbookId: playbook.playbookId,
        },
        body: {
          expectedLatestObcId: current.id,
          restoreObcId: playbook.id,
        },
      });
      invalidateQueries();
      toast.show({ title: t('restore-success.title'), description: t('restore-success.description') });
    } catch (error) {
      toast.show({ title: t('restore-success.error'), description: getErrorMessage(error) });
    }
  };

  return (
    <Dialog noPadding noScroll onClose={onClose} open={open} size="full-screen" title={t('title')}>
      <div className="flex w-full overflow-hidden h-full">
        <div className="w-[30%] h-full">
          <VersionsList onChange={setSelectedPlaybook} playbooks={playbooks} selected={selectedPlaybook} />
        </div>
        <div className="w-[70%] h-full">
          <VersionDetails
            isCurrent={selectedPlaybook.id === current.id}
            isOriginal={selectedPlaybook.id === original.id}
            onRestore={handleRestore}
            playbook={selectedPlaybook}
            previousPlaybook={getPreviousPlaybook(selectedPlaybook)}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default Versions;
