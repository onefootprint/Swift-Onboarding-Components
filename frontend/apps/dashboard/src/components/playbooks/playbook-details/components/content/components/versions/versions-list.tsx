import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import getAuthor from './utils/get-author';
import getCreatedTime from './utils/get-created-time';

type VersionsListProps = {
  onChange: (playbook: OnboardingConfiguration) => void;
  playbooks: OnboardingConfiguration[];
  selected: OnboardingConfiguration;
};

const VersionsList = ({ playbooks, onChange, selected }: VersionsListProps) => {
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
                {isOriginal
                  ? t('created-by', { name: getAuthor(playbook) })
                  : t('edited-by', { name: getAuthor(playbook) })}
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

export default VersionsList;
