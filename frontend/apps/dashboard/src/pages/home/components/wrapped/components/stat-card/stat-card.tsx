type StatCardProps = {
  label: string;
  value: number | string;
  isPercentage?: boolean;
};

const StatCard = ({ label, value, isPercentage }: StatCardProps) => (
  <div className="border border-solid border-tertiary rounded px-4 py-5">
    <div className="flex flex-col gap-6">
      <div className="text-body-3">{label}</div>
      <div className="text-display-3">
        {isPercentage ? `${Number(value).toFixed(1)}%` : Number(value).toLocaleString('en-US')}
      </div>
    </div>
  </div>
);

export default StatCard;
