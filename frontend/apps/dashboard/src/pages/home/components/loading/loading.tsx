import { Shimmer } from '@onefootprint/ui';

const Loading = () => {
  const templateAreas = Array.from({ length: 6 }, (_, i) => `card-${i + 1}`);

  return (
    <div
      aria-label="Loading home..."
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={0}
      role="progressbar"
      tabIndex={0}
    >
      <div className="flex flex-col gap-10">
        {['users', 'businesses'].map(key => (
          <div key={key} className="flex flex-col gap-4">
            <div className="rounded animate-pulse h-6 max-w-[100px]" />
            <div className="grid grid-cols-3 gap-4">
              {templateAreas.map(gridArea => (
                <Shimmer key={gridArea} borderRadius="default" flex={1} minHeight="116px" minWidth="170px" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;
