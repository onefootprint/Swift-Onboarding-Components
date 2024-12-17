import { IcoCheck16, IcoChevronDown16 } from '@onefootprint/icons';
import { Dropdown } from '@onefootprint/ui';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type OnboardingDataProps = {
  onClick: (isTriggered: boolean) => void;
};

const RulesDropdown = ({ onClick }: OnboardingDataProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.rules.dropdown' });
  const [isOpen, setIsOpen] = useState(false);
  const [isTriggeredSelected, setIsTriggeredSelected] = useState(true);

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const handleClick = (isTriggered: boolean) => {
    setIsTriggeredSelected(isTriggered);
    onClick(isTriggered);
  };

  return (
    <Dropdown.Root open={isOpen} onOpenChange={toggleDropdown}>
      <Dropdown.Trigger asChild>
        <button className="flex items-center gap-3" type="button">
          <span className="text-label-3">{isTriggeredSelected ? t('triggered') : t('not-triggered')}</span>
          <div
            className={cx('flex items-center justify-center transition-transform duration-100 ease-in', {
              'rotate-180': isOpen,
            })}
          >
            <IcoChevronDown16 />
          </div>
        </button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content className="w-[150px] py-1" align="end">
          <Dropdown.Item
            className="h-fit flex justify-between items-start py-2 px-4"
            onClick={() => handleClick(true)}
            checked={isTriggeredSelected}
            iconRight={isTriggeredSelected ? IcoCheck16 : undefined}
          >
            <span className="text-caption-2">{t('triggered')}</span>
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => handleClick(false)}
            checked={!isTriggeredSelected}
            iconRight={isTriggeredSelected ? undefined : IcoCheck16}
          >
            <span className="text-caption-2">{t('not-triggered')}</span>
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};

export default RulesDropdown;
