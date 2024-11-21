import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { Dialog } from '@onefootprint/ui';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type VersionsProps = {
  open: boolean;
  onClose: () => void;
  playbooks: OnboardingConfiguration[];
};

const Versions = ({ open, onClose, playbooks }: VersionsProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'versions' });
  const [current] = playbooks;
  const [selectedPlaybook, setSelectedPlaybook] = useState<OnboardingConfiguration>(current);

  return (
    <Dialog title={t('title')} size="full-screen" open={open} onClose={onClose} noPadding noScroll>
      <div className="flex w-full overflow-hidden h-full">
        <div className="w-[30%] h-full">
          <List playbooks={playbooks} selected={selectedPlaybook} onChange={setSelectedPlaybook} />
        </div>
        <div className="w-[70%] h-full">
          <Details playbook={selectedPlaybook} isCurrent={selectedPlaybook.id === current.id} />
        </div>
      </div>
    </Dialog>
  );
};

const List = ({
  playbooks,
  onChange,
  selected,
}: {
  playbooks: OnboardingConfiguration[];
  onChange: (playbook: OnboardingConfiguration) => void;
  selected: OnboardingConfiguration;
}) => {
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

  const getAuthor = ({ author }: OnboardingConfiguration) => {
    if (author?.kind === 'organization') {
      const name = [author.firstName, author.lastName].filter(Boolean).join(' ');
      return name || author.email;
    }
    if (author?.kind === 'footprint') {
      return 'Footprint';
    }
    return 'Unknown';
  };

  return (
    <div className="bg-secondary h-full border-r border-tertiary border-solid py-5 px-6 overflow-auto">
      <h3 className="text-label-2 text-primary mb-4">{t('version-history')}</h3>
      <ul className="flex flex-col">
        {playbooks.map((playbook, index) => {
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
                    {index === 0 ? <div className="text-label-3 text-info">{t('current-version')}</div> : null}
                  </div>
                  <div className="text-snippet-2 text-tertiary">
                    {new Date(playbook.createdAt).toLocaleString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </div>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const Details = ({ playbook, isCurrent }: { playbook: OnboardingConfiguration; isCurrent: boolean }) => {
  console.log({ playbook, isCurrent });
  return <div>TO DO</div>;
};

export default Versions;
