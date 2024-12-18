import { Shimmer } from '@onefootprint/ui';

const Loading = () => (
  <div className="flex flex-col gap-3">
    <Shimmer height="24px" width="120px" />
    <Shimmer height="130px" width="100%" />
  </div>
);

export default Loading;
