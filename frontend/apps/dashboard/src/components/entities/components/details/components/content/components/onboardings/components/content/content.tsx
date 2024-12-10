import type { EntityOnboarding } from '@onefootprint/request-types/dashboard';
import { Dropdown, LinkButton } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStatusText from '../../hooks/use-status-text';
import OnboardingData from '../onboarding-data';
import LatestTag from './components/latest-tag';
import OnboardingItem from './components/onboarding-item';
import { getStatusColor, getTimestampText } from './utils';

type ContentProps = {
  onboardings: EntityOnboarding[];
};

const Content = ({ onboardings }: ContentProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'onboardings.header',
  });
  const statusT = useStatusText();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState<EntityOnboarding>(onboardings[0]);
  const { playbookName, status, timestamp } = selectedOnboarding;
  const isLatest = selectedOnboarding.id === onboardings[0].id;

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <fieldset className="flex flex-col justify-between w-full h-full border border-solid rounded border-tertiary">
      <header className="flex justify-between px-5 py-2 border-b border-solid rounded-t bg-secondary border-tertiary max-h-40px">
        <div className="flex items-center gap-2">
          <p className="text-primary text-label-3">
            {playbookName} {timestamp && t('timestamp', { timestamp: getTimestampText(timestamp) })}
          </p>
          <span className="text-primary text-label-2">⋅</span>
          <p className="text-label-2">{t('outcome')}</p>
          <p className={`text-${getStatusColor(status)} text-label-2`}>{statusT(status)}</p>
          {isLatest && <LatestTag />}
        </div>
        <Dropdown.Root open={isOpen} onOpenChange={toggleDropdown}>
          <Dropdown.Trigger asChild>
            <LinkButton>{t('trigger')}</LinkButton>
          </Dropdown.Trigger>
          <Dropdown.Portal>
            <Dropdown.Content maxWidth="360px" minWidth="fit-content" align="end" sideOffset={4}>
              <Dropdown.RadioGroup value={selectedOnboarding.id}>
                {onboardings.map(onboarding => (
                  <OnboardingItem
                    key={onboarding.id}
                    isChecked={selectedOnboarding.id === onboarding.id}
                    isLatest={onboarding.id === onboardings[0].id}
                    onboarding={onboarding}
                    onClick={() => setSelectedOnboarding(onboarding)}
                  />
                ))}
              </Dropdown.RadioGroup>
            </Dropdown.Content>
          </Dropdown.Portal>
        </Dropdown.Root>
      </header>
      <OnboardingData onboarding={selectedOnboarding} />
    </fieldset>
  );
};

export default Content;
