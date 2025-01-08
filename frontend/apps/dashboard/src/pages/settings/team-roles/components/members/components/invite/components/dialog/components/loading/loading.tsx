import { Shimmer } from '@onefootprint/ui';

const Loading = () => (
  <div className="flex w-full" data-testid="members-roles-loading">
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex flex-col gap-2">
        <EmailLabel />
        <EmailInput />
      </div>
      <div className="flex flex-col gap-2">
        <RoleLabel />
        <RoleInput />
      </div>
    </div>
    <AddMoreButton />
  </div>
);

const EmailLabel = () => <Shimmer height="20px" width="93px" />;

const EmailInput = () => <Shimmer height="40px" width="395px" />;

const RoleLabel = () => <Shimmer height="20px" width="93px" />;

const RoleInput = () => <Shimmer height="40px" width="194px" />;

const AddMoreButton = () => <Shimmer height="21px" width="86px" />;

export default Loading;
