import type { RiskSignal } from '@onefootprint/request-types/dashboard';
import { cx } from 'class-variance-authority';
import { capitalize } from 'lodash';

type ReasonCodeCardProps = {
  reason: RiskSignal;
  hasSubcategory: boolean;
};

const ReasonCodeCard = ({ reason, hasSubcategory }: ReasonCodeCardProps) => {
  return (
    <div
      key={reason.id}
      className={cx('relative flex-col py-1 my-1 border rounded', {
        'pl-4': !hasSubcategory,
        'pl-6': hasSubcategory,
      })}
    >
      <div className="flex gap-2">
        <h4 className="truncate text-label-3">{reason.note}</h4>
        <h4 className="shrink-0">⋅</h4>
        <p
          className={cx('text-label-3 shrink-0', {
            'text-error': reason.severity === 'high',
            'text-warning': reason.severity === 'medium',
            'text-success': reason.severity === 'low',
          })}
        >
          {capitalize(reason.severity)}
        </p>
      </div>
      <div className="flex flex-col">
        <p className="text-body-3 text-tertiary">{reason.description}</p>
      </div>
    </div>
  );
};

export default ReasonCodeCard;
