import { IcoCheckSmall24, IcoCloseSmall24 } from '@onefootprint/icons';
import { useTranslation } from 'react-i18next';

export type SingleItemType = 'usResidents' | 'nonUSResidents' | 'investorProfile';

type SingleItemProps = {
  name: SingleItemType;
  value: boolean;
};

const SingleItem = ({ name, value }: SingleItemProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'data-collection' });

  const singleItemMap: Record<SingleItemType, { title: string; enabled: string; disabled: string }> = {
    usResidents: {
      title: t('us-residents.title'),
      enabled: t('us-residents.enabled'),
      disabled: t('us-residents.disabled'),
    },
    nonUSResidents: {
      title: t('non-us-residents.title'),
      enabled: t('non-us-residents.enabled'),
      disabled: t('non-us-residents.disabled'),
    },
    investorProfile: {
      title: t('investor_profile.title'),
      enabled: t('investor_profile.enabled'),
      disabled: t('investor_profile.disabled'),
    },
  };

  const item = singleItemMap[name];
  return (
    <div className="flex flex-col gap-2">
      {item && <h4 className="text-label-2">{item.title}</h4>}
      <div className="flex justify-start w-full h-6 gap-2">
        {value ? <IcoCheckSmall24 /> : <IcoCloseSmall24 />}
        <p className="text-body-2 text-secondary">{value ? item.enabled : item.disabled}</p>
      </div>
    </div>
  );
};

export default SingleItem;
