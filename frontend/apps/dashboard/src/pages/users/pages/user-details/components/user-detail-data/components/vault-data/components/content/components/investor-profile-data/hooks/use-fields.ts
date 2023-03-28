import { useTranslation } from '@onefootprint/hooks';
import {
  DocumentDI,
  InvestorProfileDI,
  isVaultDataDecrypted,
  RoleScope,
  Vault,
  VaultValue,
} from '@onefootprint/types';
import get from 'lodash/get';
import usePermissions from 'src/hooks/use-permissions';
import { User } from 'src/pages/users/users.types';
import createStringList from 'src/utils/create-string-list';

import useFormValues from '../../../hooks/use-form-values';
import { allFieldsChecked, canSelectAtLeastOne } from './utils';

const useFields = (user: User, vault: Vault, isDecrypting: boolean) => {
  const { t, allT } = useTranslation(
    'pages.user-details.user-info.investor-profile',
  );
  const { hasPermission } = usePermissions();
  const values = useFormValues();

  const getData = ({
    attribute,
    getValue = () => vault.investorProfile[attribute],
    formatValue = (value?: VaultValue) => value,
  }: {
    attribute: InvestorProfileDI | DocumentDI;
    getValue?: () => VaultValue;
    formatValue?: (value?: VaultValue) => VaultValue;
  }) => {
    const canDecrypt = hasPermission(RoleScope.decryptInvestorProfile);
    const canAccessData =
      user.onboarding?.canAccessAttributes.includes(attribute);
    const value = getValue();
    const hasValue = user.attributes.includes(attribute);
    const canAccess = !user.isPortable || !!canAccessData;
    const isDataDecrypted = isVaultDataDecrypted(value);
    const checked = !!get(values, attribute);

    return {
      canAccess,
      canSelect: hasValue && !isDataDecrypted && canDecrypt && canAccess,
      checked,
      hasPermission: canDecrypt,
      isDataDecrypted,
      hasValue,
      label: allT(`di.${attribute}`),
      name: attribute,
      showCheckbox: isDecrypting,
      value: formatValue(value),
    };
  };

  const left = [
    {
      title: t('occupation.title'),
      fields: [
        getData({
          attribute: InvestorProfileDI.occupation,
        }),
      ],
    },
    {
      title: t('brokerage-firm.title'),
      fields: [
        getData({
          attribute: InvestorProfileDI.employedByBrokerageFirm,
        }),
      ],
    },
    {
      title: t('annual-income.title'),
      fields: [
        getData({
          attribute: InvestorProfileDI.annualIncome,
          formatValue: value => {
            if (!value) return value;
            return t(`annual-income.options.${value}`);
          },
        }),
      ],
    },
    {
      title: t('net-worth.title'),
      fields: [
        getData({
          attribute: InvestorProfileDI.netWorth,
          formatValue: value => {
            if (!value) return value;
            return t(`net-worth.options.${value}`);
          },
        }),
      ],
    },
  ];
  const right = [
    {
      title: t('investment-goals.title'),
      fields: [
        getData({
          attribute: InvestorProfileDI.investmentGoals,
          formatValue: value => {
            if (!value || typeof value !== 'string') return value;
            try {
              const parsedValue = JSON.parse(value);
              const valuesWithTranslation = parsedValue.map((option: string) =>
                t(`investment-goals.options.${option}`),
              );
              return createStringList(valuesWithTranslation);
            } catch (_) {
              return value;
            }
          },
        }),
      ],
    },
    {
      title: t('risk-tolerance.title'),
      fields: [
        getData({
          attribute: InvestorProfileDI.riskTolerance,
          formatValue: value => {
            if (!value) return value;
            return t(`risk-tolerance.options.${value}`);
          },
        }),
      ],
    },
    {
      title: t('declarations.title'),
      fields: [
        getData({
          attribute: InvestorProfileDI.declarations,
          formatValue: value => {
            if (!value || typeof value !== 'string') return value;
            try {
              const parsedValue = JSON.parse(value);
              const valuesWithTranslation = parsedValue.map((option: string) =>
                t(`declarations.options.${option}`),
              );
              return createStringList(valuesWithTranslation);
            } catch (_) {
              return value;
            }
          },
        }),
        getData({
          attribute: DocumentDI.finraComplianceLetter,
          getValue: () => vault.document[DocumentDI.finraComplianceLetter],
        }),
      ],
    },
  ];

  const fields = [left, right];
  const meta = {
    allChecked: allFieldsChecked(fields),
    canSelectAtLeastOne: canSelectAtLeastOne(fields),
  };
  return [fields, meta] as const;
};

export default useFields;
