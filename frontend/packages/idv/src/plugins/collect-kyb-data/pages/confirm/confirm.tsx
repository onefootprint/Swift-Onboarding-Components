import React from 'react';
import { useTranslation } from 'react-i18next';

import { BeneficialOwner, BusinessDI, BusinessDIData, SupportedLocale } from '@onefootprint/types';
import { ConfirmCollectedData } from '../../../../components/confirm-collected-data';
import { useL10nContext } from '../../../../components/l10n-provider';
import { getLogger } from '../../../../utils/logger';
import { fromUSDateToISO8601Format, strInputToUSDate } from '../../../../utils/string';
import { isString } from '../../../../utils/type-guards';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import BasicDataSection from './components/basic-data-section';
import BeneficialOwnersSection from './components/beneficial-owners-section';
import BusinessAddressSection from './components/business-address-section';

const { logError } = getLogger({ location: 'kyb-confirm' });

const isDate = (key: string) => key === BusinessDI.formationDate;

const shouldOmitFromPayload = (key: string, value: unknown): boolean => {
  return (
    key === BusinessDI.kycedBeneficialOwners &&
    Array.isArray(value) /** @ts-expect-error: Property 'linkId' does not exist on type 'BeneficialOwner' */ &&
    value.some((bo: BeneficialOwner) => bo.linkId || bo.link_id)
  );
};

const formatPayload = (locale: SupportedLocale, data: BusinessDIData) =>
  Object.entries(data).reduce((payload, [key, value]) => {
    if (isDate(key)) {
      const dateInputValue = isString(value) ? strInputToUSDate(locale, value) : undefined;
      payload[key] = fromUSDateToISO8601Format(dateInputValue);
      return payload;
    }

    if (shouldOmitFromPayload(key, value)) {
      return payload;
    }

    payload[key] = value;
    return payload;
  }, Object.create(null));

const Confirm = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.confirm.summary' });
  const [state, send] = useCollectKybDataMachine();
  const locale = useL10nContext()?.locale || 'en-US';
  const { mutation, syncData } = useSyncData();
  const { isLoading } = mutation;

  const handleConfirm = () => {
    syncData({
      authToken: state.context.idvContext.authToken,
      data: formatPayload(locale, state.context.data),
      speculative: false,
      onSuccess: () => send({ type: 'confirmed' }),
      onError: (error: string) => {
        logError(`Vaulting data failed in kyb confirm page: ${error}`, error);
      },
    });
  };

  return (
    <ConfirmCollectedData
      title={t('title')}
      subtitle={t('subtitle')}
      cta={t('cta')}
      onClickPrev={() => send({ type: 'navigatedToPrevPage' })}
      onClickConfirm={handleConfirm}
      isLoading={isLoading}
    >
      <BasicDataSection />
      <BusinessAddressSection />
      <BeneficialOwnersSection />
    </ConfirmCollectedData>
  );
};

export default Confirm;
