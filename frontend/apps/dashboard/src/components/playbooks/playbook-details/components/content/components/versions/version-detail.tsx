import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { LinkButton, SegmentedControl } from '@onefootprint/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PlaybookConfig from 'src/components/playbooks/playbook-config';
import PlaybookDiff from 'src/components/playbooks/playbook-diff';
import getAuthor from './utils/get-author';
import getCreatedTime from './utils/get-created-time';

type VersionDetailsProps = {
  playbook: OnboardingConfiguration;
  previousPlaybook: OnboardingConfiguration | null;
  isCurrent: boolean;
  isOriginal: boolean;
  onRestore: () => void;
};

const VersionDetails = ({ playbook, previousPlaybook, isCurrent, isOriginal, onRestore }: VersionDetailsProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'versions' });
  const [nav, setNav] = useState('diff');

  useEffect(() => {
    setNav(isOriginal ? 'config' : 'diff');
  }, [playbook.id]);

  return (
    <div className="bg-primary h-full py-5 px-6 overflow-auto flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-label-2 text-primary">
              {isOriginal
                ? t('created-by', { name: getAuthor(playbook) })
                : t('edited-by', { name: getAuthor(playbook) })}
            </h2>
            {' · '}
            {isCurrent ? (
              <div className="text-label-2 text-info">Current version</div>
            ) : (
              <LinkButton variant="label-2" onClick={onRestore}>
                Restore to this version
              </LinkButton>
            )}
          </div>
          {isOriginal ? null : (
            <SegmentedControl
              aria-label="lorem"
              value={nav}
              onChange={setNav}
              options={[
                {
                  value: 'diff',
                  label: 'Changes',
                },
                {
                  value: 'config',
                  label: 'Configurations',
                },
              ]}
            />
          )}
        </div>
        <div className="text-snippet-2 text-tertiary">{getCreatedTime(playbook)}</div>
      </header>
      <div>
        {nav === 'diff' && playbook && previousPlaybook && (
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
        {nav === 'config' && playbook && <PlaybookConfig playbook={playbook} />}
      </div>
    </div>
  );
};

export default VersionDetails;
