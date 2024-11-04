import { BusinessDI } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import { Logger } from '@/idv/utils';
import HeaderTitle from '../../../../components/layout/components/header-title';
import CollectKybDataNavigationHeader from '../../components/collect-kyb-data-navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { BusinessAddressData } from '../../utils/state-machine/types';
import BusinessAddressForm from './components/business-address-form';

type BusinessAddressProps = {
  ctaLabel?: string;
  onComplete?: () => void;
  onCancel?: () => void;
  hideHeader?: boolean;
};

const BusinessAddress = ({ ctaLabel, onComplete, onCancel, hideHeader }: BusinessAddressProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyb.pages.business-address',
  });
  const [state, send] = useCollectKybDataMachine();
  const {
    idvContext: { authToken },
    data,
  } = state.context;
  const { mutation, syncData } = useSyncData();

  const handleSubmit = (businessAddress: BusinessAddressData) => {
    syncData({
      authToken,
      data: businessAddress,
      onSuccess: () => {
        send({ type: 'businessAddressSubmitted', payload: businessAddress });
        onComplete?.();
      },
      onError: (error: string) => {
        Logger.error(`Error vaulting kyb business-address data: ${error}`, { location: 'kyb-business-address' });
      },
    });
  };

  const defaultValues = {
    addressLine1: data?.[BusinessDI.addressLine1],
    addressLine2: data?.[BusinessDI.addressLine2],
    city: data?.[BusinessDI.city],
    state: data?.[BusinessDI.state],
    zip: data?.[BusinessDI.zip],
    country: data?.[BusinessDI.country],
  };

  return (
    <Stack direction="column" gap={5}>
      {!hideHeader && (
        <>
          <CollectKybDataNavigationHeader />
          <HeaderTitle title={t('title')} subtitle={t('subtitle')} marginBottom={7} />
        </>
      )}
      <BusinessAddressForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        isLoading={mutation.isPending}
        ctaLabel={ctaLabel}
      />
    </Stack>
  );
};

export default BusinessAddress;
