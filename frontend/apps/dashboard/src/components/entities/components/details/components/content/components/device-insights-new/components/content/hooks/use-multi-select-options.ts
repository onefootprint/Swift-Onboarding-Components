import {
  BusinessDI,
  type Entity,
  IdDI,
  IdentifyScope,
  type Liveness,
} from '@onefootprint/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

enum OptionValue {
  businessAddress = 'businessAddress',
  residentialAddress = 'residentialAddress',
  onboarding = 'onboarding',
  auth = 'auth',
}

type Option = { label: string; value: OptionValue };

const useMultiSelectOptions = (entity: Entity, livenessData: Liveness[]) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.device-insights',
  });

  const options: Option[] = [];

  if (livenessData.length) {
    const scopes: IdentifyScope[] = Array.from(
      new Set(livenessData.map(liveness => liveness.scope)),
    );
    scopes.forEach(scope => {
      if (scope === IdentifyScope.onboarding || scope === IdentifyScope.auth) {
        options.push({
          value:
            scope === IdentifyScope.onboarding
              ? OptionValue.onboarding
              : OptionValue.auth,
          label: t(`scope.${scope}`),
        });
      }
    });
  }

  const hasBusinessAddress = entity.attributes.includes(
    BusinessDI.addressLine1,
  );
  if (hasBusinessAddress) {
    options.push({
      value: OptionValue.businessAddress,
      label: t('select.business-address'),
    });
  }
  const hasResidentialAddress = entity.attributes.includes(IdDI.addressLine1);
  if (hasResidentialAddress) {
    options.push({
      value: OptionValue.residentialAddress,
      label: t('select.residential-address'),
    });
  }

  const [selectedOptionsSet, setSelectedOptionsSet] = useState<
    Set<OptionValue>
  >(new Set(options.map(e => e.value)));
  const handleOptionsChange = (newOptions: readonly Option[]) => {
    setSelectedOptionsSet(new Set(newOptions.map(e => e.value)));
  };

  const isOnboardingSelected = selectedOptionsSet.has(OptionValue.onboarding);
  const isAuthSelected = selectedOptionsSet.has(OptionValue.auth);
  const isBusinessAddressSelected = selectedOptionsSet.has(
    OptionValue.businessAddress,
  );
  const isResidentialAddressSelected = selectedOptionsSet.has(
    OptionValue.residentialAddress,
  );

  return {
    options,
    isOnboardingSelected,
    isAuthSelected,
    isBusinessAddressSelected,
    isResidentialAddressSelected,
    handleOptionsChange,
  };
};

export default useMultiSelectOptions;
