import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { Dialog, LinkButton } from '@onefootprint/ui';
import { cx } from 'class-variance-authority';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PlaybookDiff from 'src/components/playbooks/playbook-diff';
import getAuthor from './utils/get-author';
import getCreatedTime from './utils/get-created-time';

type VersionsProps = {
  open: boolean;
  onClose: () => void;
  playbooks: OnboardingConfiguration[];
};

const Versions = ({ open, onClose, playbooks }: VersionsProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'versions' });
  const [current] = playbooks;
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
          <List playbooks={playbooks} selected={selectedPlaybook} onChange={setSelectedPlaybook} />
        </div>
        <div className="w-[70%] h-full">
          <Details
            playbook={selectedPlaybook}
            previousPlaybook={getPreviousPlaybook(selectedPlaybook)}
            isCurrent={selectedPlaybook.id === current.id}
            onRestore={console.log}
          />
        </div>
      </div>
    </Dialog>
  );
};

type ListProps = {
  playbooks: OnboardingConfiguration[];
  onChange: (playbook: OnboardingConfiguration) => void;
  selected: OnboardingConfiguration;
};

const List = ({ playbooks, onChange, selected }: ListProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'versions' });

  const renderTimeline = (index: number) => {
    const isLast = index === playbooks.length - 1;
    return (
      <div className="relative flex flex-col items-center top-[30px] select-none">
        <div className="w-[7px] h-[7px] bg-senary rounded-full z-10" />
        {isLast ? null : <div className="w-[2px] h-full bg-senary absolute top-3 mt-[-6px]" />}
      </div>
    );
  };

  const renderItem = (playbook: OnboardingConfiguration, index: number) => {
    const isCurrent = index === 0;
    const isOriginal = index === playbooks.length - 1;

    return (
      <li key={playbook.id} className="relative">
        <div className="flex gap-4">
          {renderTimeline(index)}
          <button
            type="button"
            onClick={() => onChange(playbook)}
            className={cx('flex-1 flex flex-col gap-1 p-3 rounded border border-solid w-full mb-4 group', {
              'bg-primary border-tertiary hover:border-primary': selected.id !== playbook.id,
              'bg-active border-accent': selected.id === playbook.id,
            })}
          >
            <div className="flex justify-between gap-4 w-full">
              <div
                className={cx('text-label-3 group-hover:text-accent', {
                  'text-accent': selected.id === playbook.id,
                  'text-primary': selected.id !== playbook.id,
                })}
              >
                {t('edited-by', { name: getAuthor(playbook) })}
              </div>
              {isCurrent ? <div className="text-label-3 text-info">{t('current-version')}</div> : null}
              {isOriginal ? <div className="text-label-3 text-primary">{t('original-version')}</div> : null}
            </div>
            <div className="text-snippet-2 text-tertiary">{getCreatedTime(playbook)}</div>
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="bg-secondary h-full border-r border-tertiary border-solid py-5 px-6 overflow-auto">
      <h3 className="text-label-2 text-primary mb-4">{t('version-history')}</h3>
      <ul className="flex flex-col">{playbooks.map((playbook, index) => renderItem(playbook, index))}</ul>
    </div>
  );
};

type DetailsProps = {
  playbook: OnboardingConfiguration;
  previousPlaybook: OnboardingConfiguration | null;
  isCurrent: boolean;
  onRestore: () => void;
};

const Details = ({ playbook, previousPlaybook, isCurrent, onRestore }: DetailsProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'versions' });

  return (
    <div className="bg-primary h-full py-5 px-6 overflow-auto flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-label-2 text-primary">{t('edited-by', { name: getAuthor(playbook) })}</h2>
          {' · '}
          {isCurrent ? (
            <div className="text-label-2 text-info">Current version</div>
          ) : (
            <LinkButton variant="label-2" onClick={onRestore}>
              Restore to this version
            </LinkButton>
          )}
        </div>
        <div className="text-snippet-2 text-tertiary">{getCreatedTime(playbook)}</div>
      </header>
      <div>
        {playbook && previousPlaybook && (
          <PlaybookDiff
            oldPlaybook={previousPlaybook}
            newPlaybookPayload={{
              allowInternationalResidents: playbook.allowInternationalResidents,
              allowUsResidents: playbook.allowUsResidents,
              allowUsTerritories: playbook.allowUsTerritoryResidents,
              documentsToCollect: playbook.documentsToCollect,
              kind: playbook.kind,
              mustCollectData: playbook.mustCollectData,
              name: playbook.name,
              optionalData: playbook.optionalData,
              requiredAuthMethods: playbook.requiredAuthMethods,
              verificationChecks: playbook.verificationChecks,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Versions;
