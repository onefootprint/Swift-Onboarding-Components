import type { InsightEvent } from '@onefootprint/request-types/dashboard';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';

type InsightEventDisplayProps = {
  insightEvent?: InsightEvent;
};

const eventItems = [
  { label: 'labels.region', key: 'region' },
  { label: 'labels.country', key: 'country' },
  { label: 'labels.postal-code', key: 'postalCode' },
  { label: 'labels.ip-address', key: 'ipAddress' },
  { label: 'labels.user-agent', key: 'userAgent', fullWidth: true },
];

const InsightEventDisplay = ({ insightEvent }: InsightEventDisplayProps) => {
  const { t } = useTranslation('security-logs', {
    keyPrefix: 'principal-actor.insight-event',
  });

  const renderEventItem = (label: string, value: string | number, fullWidth: boolean = false) => (
    <div className={cx('flex flex-col gap-2 min-w-[190px]', { 'col-span-2': fullWidth })}>
      <p className="text-body-3 text-tertiary">{label}</p>
      <p className="overflow-hidden text-body-3 max-h-24 text-ellipsis line-clamp-4">{value}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-9 gap-y-4">
      {eventItems.map(item =>
        renderEventItem(t(item.label), insightEvent?.[item.key as keyof InsightEvent] ?? '-', item.fullWidth),
      )}
    </div>
  );
};

export default InsightEventDisplay;
