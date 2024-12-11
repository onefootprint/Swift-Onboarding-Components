import { Shimmer } from '@onefootprint/ui';

const Loading = () => (
  <div className="w-full flex justify-between items-center flex-row gap-2 pb-2 border-b border-tertiary">
    <Shimmer height="27px" width="300px" />
    <Shimmer height="20px" width="100%" />
    <Shimmer height="20px" width="100%" />
  </div>
);

export default Loading;
