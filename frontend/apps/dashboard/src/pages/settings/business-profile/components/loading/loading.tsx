import { Shimmer } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

const Loading = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'pages.business-profile' });

  return (
    <div aria-label={t('loading-aria')}>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <Avatar />
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-4 max-w-screen-sm">
              <InputRow />
              <InputRow />
              <InputRow />
            </div>
            <div className="flex flex-col gap-6 max-w-screen-sm">
              <div className="flex flex-col gap-2">
                <Label />
                <Shimmer height="20px" width="300px" borderRadius="default" />
              </div>
              <div className="flex flex-col gap-4">
                <InputRow />
                <InputRow />
                <InputRow />
              </div>
            </div>
          </div>
        </div>
        <Shimmer height="40px" width="120px" borderRadius="default" />
      </div>
    </div>
  );
};

const Avatar = () => <Shimmer height="80px" width="80px" borderRadius="default" />;

const Label = () => <Shimmer height="24px" width="143px" borderRadius="default" />;

const InputRow = () => (
  <div className="flex justify-between items-center">
    <Label />
    <Shimmer height="36px" width="300px" borderRadius="default" />
  </div>
);

export default Loading;
