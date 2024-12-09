import { Shimmer } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const Loading = () => {
  const { t } = useTranslation('api-keys', { keyPrefix: 'create' });

  return (
    <div aria-label={t('form.loading-aria')} className="w-full">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col gap-2">
          <SecretKeyLabel />
          <SecretKeyInput />
        </div>
        <div className="flex flex-col gap-2">
          <RoleLabel />
          <RoleInput />
        </div>
      </div>
    </div>
  );
};

const SecretKeyLabel = () => <Shimmer height="20px" width="110px" />;

const SecretKeyInput = () => <Shimmer height="40px" width="395px" />;

const RoleLabel = () => <Shimmer height="20px" width="99px" />;

const RoleInput = () => <Shimmer height="40px" width="194px" />;

export default Loading;
