import { IcoCheck16 } from '@onefootprint/icons';
import type { EntityOnboarding } from '@onefootprint/request-types/dashboard';
import { Dropdown } from '@onefootprint/ui';
import useStatusText from '../../../../hooks/use-status-text';
import { getStatusColor } from '../../utils';
import getTimestampText from '../../utils/get-timeline-text';
import LatestTag from '../latest-tag';

type OnboardingItemProps = {
  isChecked: boolean;
  isLatest: boolean;
  onboarding: EntityOnboarding;
  onClick: () => void;
};

const OnboardingItem = ({ isChecked, isLatest, onboarding, onClick }: OnboardingItemProps) => {
  const statusT = useStatusText();
  const statusColor = getStatusColor(onboarding.status);
  const timestampText = getTimestampText(onboarding.timestamp);

  return (
    <Dropdown.Item className="!h-fit flex items-start py-2 px-4" onClick={onClick}>
      <div className="flex justify-between items-start w-full">
        <div className="flex flex-col gap-1 mr-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-label-3 truncate flex-1 min-w-0 w-0 max-w-fit">{onboarding.playbookName}</span>
            <span className="text-primary text-label-3 flex-shrink-0">⋅</span>
            <span className={`text-${statusColor} text-label-3 flex-shrink-0`}>{statusT(onboarding.status)}</span>
            {isLatest && <LatestTag />}
          </div>
          <p className="text-label-3 text-tertiary">{timestampText}</p>
        </div>
        {isChecked && <IcoCheck16 className="flex-shrink-0 mt-1" />}
      </div>
    </Dropdown.Item>
  );
};

export default OnboardingItem;
