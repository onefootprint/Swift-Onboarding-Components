import { BusinessDI, type Entity, IdDI, IdentifyScope, type Liveness } from '@onefootprint/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export enum MultiSelectOptionValue {
  businessAddress = 'businessAddress',
  residentialAddress = 'residentialAddress',
  onboarding = 'onboarding',
  auth = 'auth',
}

export type MultiSelectOption = {
  label: string;
  value: MultiSelectOptionValue;
};

const useMultiSelectOptions = (entity: Entity, livenessData: Liveness[]) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.device-insights',
  });

  const allOptions: MultiSelectOption[] = [];

  if (livenessData.length) {
    const scopes: IdentifyScope[] = Array.from(new Set(livenessData.map(liveness => liveness.scope)));
    scopes.forEach(scope => {
      if (scope === IdentifyScope.onboarding || scope === IdentifyScope.auth) {
        allOptions.push({
          value: scope === IdentifyScope.onboarding ? MultiSelectOptionValue.onboarding : MultiSelectOptionValue.auth,
          label: t(`scope.${scope}`),
        });
      }
    });
  }

  const hasBusinessAddress = entity.attributes.includes(BusinessDI.addressLine1);
  if (hasBusinessAddress) {
    allOptions.push({
      value: MultiSelectOptionValue.businessAddress,
      label: t('select.business-address'),
    });
  }
  const hasResidentialAddress = entity.attributes.includes(IdDI.addressLine1);
  if (hasResidentialAddress) {
    allOptions.push({
      value: MultiSelectOptionValue.residentialAddress,
      label: t('select.residential-address'),
    });
  }

  const [selectedOptions, setSelectedOptions] = useState<MultiSelectOption[]>(allOptions);
  const handleOptionsChange = (newOptions: readonly MultiSelectOption[]) => {
    setSelectedOptions([...newOptions]);
  };

  return {
    allOptions,
    selectedOptions,
    handleOptionsChange,
  };
};

export default useMultiSelectOptions;
