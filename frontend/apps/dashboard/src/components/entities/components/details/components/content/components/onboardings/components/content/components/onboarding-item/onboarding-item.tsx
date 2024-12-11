import { IcoCheckSmall16 } from '@onefootprint/icons';
import type { EntityOnboarding } from '@onefootprint/request-types/dashboard';
import { Dropdown, Tag } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useStatusText from '../../../../hooks/use-status-text';
import { getStatusColor } from '../../utils';
import getTimestampText from '../../utils/get-timeline-text';

type OnboardingItemProps = {
  isChecked: boolean;
  isLatest: boolean;
  onboarding: EntityOnboarding;
  onClick: () => void;
};

const OnboardingItem = ({ isLatest, onboarding, onClick }: OnboardingItemProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'onboardings.header',
  });
  const statusT = useStatusText();
  const statusColor = getStatusColor(onboarding.status);
  const timestampText = getTimestampText(onboarding.timestamp);

  return (
    <Dropdown.RadioItem onSelect={onClick} height="68px" value={onboarding.id}>
      <div className="flex flex-col p-2">
        <div className="flex items-center gap-1">
          <p>{onboarding.playbookName}</p>
          <span>⋅</span>
          <p className={`text-${statusColor}`}>{statusT(onboarding.status)}</p>
          {isLatest && <Tag className="flex-shrink-0">{t('latest')}</Tag>}
        </div>
        <p className="text-label-3 text-tertiary">{timestampText}</p>
      </div>
      <Dropdown.ItemIndicator className="flex items-start justify-center w-6 h-full pt-3">
        <IcoCheckSmall16 />
      </Dropdown.ItemIndicator>
    </Dropdown.RadioItem>
  );
};

export default OnboardingItem;
