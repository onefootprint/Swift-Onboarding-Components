import {
  isAddressLine,
  isDobInTheFuture,
  isDobTooOld,
  isDobTooYoung,
  isPhoneNumber,
  isSSN9Flexible,
  isSsn4,
  isTin,
  isURL,
  isValidDate,
} from '@onefootprint/core';
import { COUNTRIES, STATES } from '@onefootprint/global-constants';
import {
  BusinessDI,
  CorporationType,
  type DataIdentifier,
  type Entity,
  IdDI,
  InvestorProfileAnnualIncome,
  InvestorProfileDI,
  InvestorProfileFundingSources,
  InvestorProfileInvestmentGoal,
  InvestorProfileNetWorth,
  InvestorProfileRiskTolerance,
  UsLegalStatus,
} from '@onefootprint/types';
import get from 'lodash/get';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useEntityVault from 'src/components/entities/hooks/use-entity-vault';
import { EMPTY_SELECT_VALUE } from '../../constants';
import useFormValues, { type EditDetailsFormData } from '../use-form-values';
import validateCitizenships, { CitizenshipsValidationError } from '../validate-citizenships';
import validateName, { NameValidationError } from '../validate-name';

type Option = {
  label: string;
  value: string;
};

type Common = {
  validate?: (value: string) => boolean | string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  fullWidth?: boolean;
};

type InputOptions = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'pattern'> &
  Common & {
    hint?: string;
    hasError?: boolean;
    pattern?: {
      value: RegExp;
      message: string;
    };
  };

type SelectOptions = React.SelectHTMLAttributes<HTMLSelectElement> &
  Common & {
    options: Option[];
    defaultOption?: Option;
  };

type RadioOptions = React.InputHTMLAttributes<HTMLInputElement> &
  Common & {
    options: Option[];
    defaultSelectedOption?: Option;
    hint?: string;
    hasError?: boolean;
  };

type CheckboxOptions = React.InputHTMLAttributes<HTMLInputElement> & {
  options: Option[];
  defaultSelectedOptions?: Option[];
  hint?: string;
  hasError?: boolean;
  validate?: (value: string[]) => boolean | string;
};

type FieldProps =
  | {
      inputOptions: InputOptions;
      selectOptions?: never;
      radioOptions?: never;
      checkboxOptions?: never;
    }
  | {
      inputOptions?: never;
      selectOptions: SelectOptions;
      radioOptions?: never;
      checkboxOptions?: never;
    }
  | {
      inputOptions?: never;
      selectOptions?: never;
      radioOptions?: never;
      checkboxOptions: CheckboxOptions;
    }
  | {
      inputOptions?: never;
      selectOptions?: never;
      radioOptions: RadioOptions;
      checkboxOptions?: never;
    };

const useFieldProps = (entity: Entity, di: DataIdentifier): FieldProps => {
  const { t } = useTranslation('business-details', { keyPrefix: 'vault.basic' });
  const { t: entityT } = useTranslation('entity-details', {
    keyPrefix: 'header-default.actions.edit-vault-drawer.fieldsets',
  });
  const { clearErrors } = useFormContext<EditDetailsFormData>();
  const formValues = useFormValues();
  const fieldValue = get(formValues, di as keyof EditDetailsFormData);
  const { data: previousData } = useEntityVault(entity.id, entity);
  const previousValue = (previousData?.vault[di] as string) ?? '';

  // IdDI fields
  if (di === IdDI.firstName) {
    return {
      inputOptions: {
        placeholder: entityT('placeholders.first-name'),
        validate: (value: string) => {
          if (!value) {
            return previousValue ? entityT('errors.name.required') : true;
          }
          const validationResult = validateName(value);
          if (validationResult === NameValidationError.SPECIAL_CHARS) {
            return entityT('errors.name.special-chars');
          }
          return true;
        },
      },
    };
  }
  if (di === IdDI.middleName) {
    return {
      inputOptions: {
        placeholder: entityT('placeholders.middle-name'),
        validate: (value: string) => {
          const validationResult = validateName(value);
          if (validationResult === NameValidationError.SPECIAL_CHARS) {
            return entityT('errors.name.special-chars');
          }
          return true;
        },
      },
    };
  }
  if (di === IdDI.lastName) {
    return {
      inputOptions: {
        placeholder: entityT('placeholders.last-name'),
        validate: (value: string) => {
          if (!value) {
            return previousValue ? entityT('errors.name.required') : true;
          }
          const validationResult = validateName(value);
          if (validationResult === NameValidationError.SPECIAL_CHARS) {
            return entityT('errors.name.special-chars');
          }
          return true;
        },
      },
    };
  }
  if (di === IdDI.dob) {
    return {
      inputOptions: {
        placeholder: entityT('placeholders.dob'),
        inputMode: 'numeric',
        pattern: {
          value: /^(?:\d{4}[-/]\d{2}[-/]\d{2})$/,
          message: entityT('errors.dob.pattern'),
        },
        validate: (value: string) => {
          if (!value) return previousValue ? entityT('errors.dob.required') : true;
          if (!isValidDate(value)) return entityT('errors.dob.pattern');
          if (isDobInTheFuture(value)) return entityT('errors.dob.future-date');
          if (isDobTooOld(value)) return entityT('errors.dob.too-old');
          if (isDobTooYoung(value)) return entityT('errors.dob.too-young');
          return true;
        },
      },
    };
  }
  if (di === IdDI.ssn9) {
    return {
      inputOptions: {
        type: 'tel',
        placeholder: entityT('placeholders.ssn9'),
        validate: (value: string) => {
          if (!value) {
            return previousValue ? entityT('errors.ssn.required') : true;
          }
          if (!isSSN9Flexible(value)) {
            return entityT('errors.ssn.pattern');
          }
          return true;
        },
      },
    };
  }
  if (di === IdDI.ssn4) {
    return {
      inputOptions: {
        placeholder: entityT('placeholders.ssn4'),
        validate: (value: string) => {
          if (!value) {
            return previousValue ? entityT('errors.ssn.required') : true;
          }
          if (!isSsn4(value)) {
            return entityT('errors.ssn.pattern');
          }
          return true;
        },
      },
    };
  }
  if (di === IdDI.addressLine1) {
    return {
      inputOptions: {
        placeholder: entityT('placeholders.address-line-1'),
        validate: (value: string) => {
          if (!value) {
            return previousValue ? entityT('errors.address-line.required') : true;
          }
          if (!isAddressLine(value)) {
            return entityT('errors.address-line.pattern');
          }
          return true;
        },
      },
    };
  }
  if (di === IdDI.city) {
    return {
      inputOptions: {
        placeholder: entityT('placeholders.city'),
        validate: (value: string) => {
          if (!value || typeof value !== 'string') return previousValue ? entityT('errors.city') : true;
          return true;
        },
      },
    };
  }
  if (di === IdDI.state) {
    const isDomestic = get(formValues, IdDI.country) === 'US';
    if (isDomestic) {
      return {
        selectOptions: {
          options: STATES,
          'aria-label': 'state',
          validate: (value: string) => {
            if (!value || value === EMPTY_SELECT_VALUE) {
              return previousValue ? entityT('errors.state.required') : true;
            }
            return true;
          },
        },
      };
    }
    return {
      inputOptions: {
        validate: (value: string) => {
          if (!value) {
            return previousValue ? entityT('errors.state.required') : true;
          }
          return true;
        },
      },
    };
  }
  if (di === IdDI.nationality) {
    const formLegalStatus = get(formValues, IdDI.usLegalStatus) || EMPTY_SELECT_VALUE;
    return {
      selectOptions: {
        'aria-label': 'County of birth',
        options: [
          {
            value: EMPTY_SELECT_VALUE,
            label: entityT('legal-status.nationality-mapping.none'),
          },
          ...(COUNTRIES as Option[]),
        ],
        validate: (value: string) => {
          if (formLegalStatus !== EMPTY_SELECT_VALUE && value === EMPTY_SELECT_VALUE) {
            return previousValue ? entityT('errors.nationality') : true;
          }
          return true;
        },
      },
    };
  }
  if (di === IdDI.usLegalStatus) {
    return {
      selectOptions: {
        'aria-label': 'Legal status',
        options: [
          { value: EMPTY_SELECT_VALUE, label: entityT('legal-status.legal-status-mapping.none') },
          { value: UsLegalStatus.citizen, label: entityT('legal-status.legal-status-mapping.citizen') },
          {
            value: UsLegalStatus.permanentResident,
            label: entityT('legal-status.legal-status-mapping.permanent_resident'),
          },
          { value: UsLegalStatus.visa, label: entityT('legal-status.legal-status-mapping.visa') },
        ],
        onChange: () => clearErrors([IdDI.nationality, IdDI.citizenships, IdDI.visaKind, IdDI.visaExpirationDate]),
      },
    };
  }
  if (di === IdDI.citizenships) {
    const formLegalStatus = get(formValues, IdDI.usLegalStatus) || '';
    return {
      inputOptions: {
        hint: entityT('errors.citizenships.hint'),
        defaultValue: Array.isArray(fieldValue) ? fieldValue.join(', ') : '',
        validate: (countriesStr: string) => {
          const validationError = validateCitizenships(countriesStr, formLegalStatus);
          if (validationError?.errorType === CitizenshipsValidationError.REQUIRED) {
            return previousValue ? entityT('errors.citizenships.required') : true;
          }
          if (validationError?.errorType === CitizenshipsValidationError.SHOULD_BE_EMPTY) {
            return entityT('errors.citizenships.should-be-empty');
          }
          if (validationError?.errorType === CitizenshipsValidationError.US_CITIZENSHIP) {
            return entityT('errors.citizenships.us-citizenship');
          }
          if (validationError?.errorType === CitizenshipsValidationError.INVALID) {
            return entityT('errors.citizenships.invalid', { countries: validationError.data });
          }
          return true;
        },
      },
    };
  }

  // InvestorProfileDI fields
  if (di === InvestorProfileDI.employmentStatus) {
    return {
      selectOptions: {
        options: [
          { value: 'employed', label: entityT('investor-profile.employment-status-mapping.employed') },
          { value: 'unemployed', label: entityT('investor-profile.employment-status-mapping.unemployed') },
          { value: 'retired', label: entityT('investor-profile.employment-status-mapping.retired') },
          { value: 'student', label: entityT('investor-profile.employment-status-mapping.student') },
        ],
        fullWidth: true,
        validate: (value: string) => {
          if (!value || value === EMPTY_SELECT_VALUE) {
            return previousValue ? entityT('errors.employment-status.required') : true;
          }
          return true;
        },
      },
    };
  }
  if (di === InvestorProfileDI.occupation) {
    const formEmployment = get(formValues, InvestorProfileDI.employmentStatus);
    const isEmployed = formEmployment === 'employed';
    return {
      inputOptions: {
        placeholder: entityT('placeholders.occupation'),
        validate: (value: string) => {
          if (isEmployed && !value) {
            return entityT('errors.occupation.required');
          }
          return true;
        },
        fullWidth: true,
      },
    };
  }
  if (di === InvestorProfileDI.employer) {
    const formEmployment = get(formValues, InvestorProfileDI.employmentStatus);
    const isEmployed = formEmployment === 'employed';
    return {
      inputOptions: {
        placeholder: entityT('placeholders.employer'),
        validate: (value: string) => {
          if (isEmployed && !value) {
            return entityT('errors.employer.required');
          }
          return true;
        },
        fullWidth: true,
      },
    };
  }
  if (di === InvestorProfileDI.annualIncome) {
    return {
      radioOptions: {
        options: [
          { value: InvestorProfileAnnualIncome.le25k, label: entityT('investor-profile.annual-income-mapping.le25k') },
          {
            value: InvestorProfileAnnualIncome.gt25kLe50k,
            label: entityT('investor-profile.annual-income-mapping.gt25kLe50k'),
          },
          {
            value: InvestorProfileAnnualIncome.gt50kLe100k,
            label: entityT('investor-profile.annual-income-mapping.gt50kLe100k'),
          },
          {
            value: InvestorProfileAnnualIncome.gt100kLe200k,
            label: entityT('investor-profile.annual-income-mapping.gt100kLe200k'),
          },
          {
            value: InvestorProfileAnnualIncome.gt200kLe300k,
            label: entityT('investor-profile.annual-income-mapping.gt200kLe300k'),
          },
          {
            value: InvestorProfileAnnualIncome.gt300kLe500k,
            label: entityT('investor-profile.annual-income-mapping.gt300kLe500k'),
          },
          {
            value: InvestorProfileAnnualIncome.gt500kLe1200k,
            label: entityT('investor-profile.annual-income-mapping.gt500kLe1200k'),
          },
          {
            value: InvestorProfileAnnualIncome.gt1200k,
            label: entityT('investor-profile.annual-income-mapping.gt1200k'),
          },
        ],
        validate: (value: string) => {
          if (!value || value === EMPTY_SELECT_VALUE) {
            return previousValue ? entityT('errors.annual-income.required') : true;
          }
          return true;
        },
      },
    };
  }
  if (di === InvestorProfileDI.netWorth) {
    return {
      radioOptions: {
        options: [
          { value: InvestorProfileNetWorth.le50k, label: entityT('investor-profile.net-worth-mapping.le50k') },
          {
            value: InvestorProfileNetWorth.gt50kLe100k,
            label: entityT('investor-profile.net-worth-mapping.gt50kLe100k'),
          },
          {
            value: InvestorProfileNetWorth.gt100kLe200k,
            label: entityT('investor-profile.net-worth-mapping.gt100kLe200k'),
          },
          {
            value: InvestorProfileNetWorth.gt200kLe500k,
            label: entityT('investor-profile.net-worth-mapping.gt200kLe500k'),
          },
          {
            value: InvestorProfileNetWorth.gt500kLe1m,
            label: entityT('investor-profile.net-worth-mapping.gt500kLe1m'),
          },
          { value: InvestorProfileNetWorth.gt1mLe5m, label: entityT('investor-profile.net-worth-mapping.gt1mLe5m') },
          { value: InvestorProfileNetWorth.gt5m, label: entityT('investor-profile.net-worth-mapping.gt5m') },
        ],
        validate: (value: string) => {
          if (!value || value === EMPTY_SELECT_VALUE) {
            return previousValue ? entityT('errors.net-worth.required') : true;
          }
          return true;
        },
      },
    };
  }
  if (di === InvestorProfileDI.fundingSources) {
    return {
      checkboxOptions: {
        options: [
          {
            value: InvestorProfileFundingSources.employmentIncome,
            label: entityT('investor-profile.funding-sources-mapping.employment_income'),
          },
          {
            value: InvestorProfileFundingSources.investments,
            label: entityT('investor-profile.funding-sources-mapping.investments'),
          },
          {
            value: InvestorProfileFundingSources.inheritance,
            label: entityT('investor-profile.funding-sources-mapping.inheritance'),
          },
          {
            value: InvestorProfileFundingSources.businessIncome,
            label: entityT('investor-profile.funding-sources-mapping.business_income'),
          },
          {
            value: InvestorProfileFundingSources.savings,
            label: entityT('investor-profile.funding-sources-mapping.savings'),
          },
          {
            value: InvestorProfileFundingSources.family,
            label: entityT('investor-profile.funding-sources-mapping.family'),
          },
        ],
        validate: (value: string[]) => {
          if (!value || !value.length) {
            return previousValue?.length ? entityT('errors.funding-sources.required') : true;
          }
          return true;
        },
      },
    };
  }
  if (di === InvestorProfileDI.investmentGoals) {
    return {
      checkboxOptions: {
        options: [
          {
            value: InvestorProfileInvestmentGoal.growth,
            label: entityT('investor-profile.investment-goals-mapping.growth'),
          },
          {
            value: InvestorProfileInvestmentGoal.income,
            label: entityT('investor-profile.investment-goals-mapping.income'),
          },
          {
            value: InvestorProfileInvestmentGoal.preserveCapital,
            label: entityT('investor-profile.investment-goals-mapping.preserve_capital'),
          },
          {
            value: InvestorProfileInvestmentGoal.speculation,
            label: entityT('investor-profile.investment-goals-mapping.speculation'),
          },
          {
            value: InvestorProfileInvestmentGoal.diversification,
            label: entityT('investor-profile.investment-goals-mapping.diversification'),
          },
          {
            value: InvestorProfileInvestmentGoal.other,
            label: entityT('investor-profile.investment-goals-mapping.other'),
          },
        ],
        validate: (value: string[]) => {
          if (!value || !value.length) {
            return previousValue?.length ? entityT('errors.investment-goals.required') : true;
          }
          return true;
        },
      },
    };
  }
  if (di === InvestorProfileDI.riskTolerance) {
    return {
      radioOptions: {
        options: [
          {
            value: InvestorProfileRiskTolerance.conservative,
            label: entityT('investor-profile.risk-tolerance-mapping.conservative'),
          },
          {
            value: InvestorProfileRiskTolerance.moderate,
            label: entityT('investor-profile.risk-tolerance-mapping.moderate'),
          },
          {
            value: InvestorProfileRiskTolerance.aggressive,
            label: entityT('investor-profile.risk-tolerance-mapping.aggressive'),
          },
        ],
        validate: (value: string) => {
          if (!value || value === EMPTY_SELECT_VALUE) {
            return previousValue ? entityT('errors.net-worth.required') : true;
          }
          return true;
        },
      },
    };
  }

  // Overlapping DI fields
  if (di === IdDI.addressLine2 || di === BusinessDI.addressLine2) {
    return {
      inputOptions: {
        placeholder: entityT('placeholders.address-line-2'),
      },
    };
  }

  if (di === IdDI.country || di === BusinessDI.country) {
    return {
      selectOptions: {
        options: COUNTRIES as Option[],
        validate: (value: string) => {
          if (!value) {
            return previousValue ? entityT('errors.country.required') : true;
          }
          return true;
        },
      },
    };
  }

  // BusinessDI fields
  if (di === BusinessDI.name) {
    return {
      inputOptions: {
        placeholder: entityT('placeholders.business-name'),
        validate: (value: string) => {
          if (!value) {
            return previousValue ? entityT('errors.name.required') : true;
          }
          const validationResult = validateName(value);
          if (validationResult === NameValidationError.SPECIAL_CHARS) {
            return entityT('errors.name.special-chars');
          }
          return true;
        },
      },
    };
  }
  if (di === BusinessDI.doingBusinessAs) {
    return {
      inputOptions: {
        placeholder: entityT('placeholders.doing-business-as'),
        validate: (value: string) => {
          if (!value) {
            return previousValue ? entityT('errors.name.required') : true;
          }
          const validationResult = validateName(value);
          if (validationResult === NameValidationError.SPECIAL_CHARS) {
            return entityT('errors.name.special-chars');
          }
          return true;
        },
      },
    };
  }
  if (di === BusinessDI.website) {
    return {
      inputOptions: {
        placeholder: entityT('placeholders.website'),
        validate: (value: string) => {
          if (!isURL(value ?? '')) {
            return previousValue ? entityT('errors.website.invalid') : true;
          }
          return true;
        },
      },
    };
  }
  if (di === BusinessDI.phoneNumber) {
    return {
      inputOptions: {
        placeholder: entityT('placeholders.phone-number'),
        validate: (value: string) => {
          if (value && !isPhoneNumber(value)) {
            return previousValue ? entityT('errors.phone-number.pattern') : true;
          }
          return true;
        },
      },
    };
  }
  if (di === BusinessDI.tin) {
    return {
      inputOptions: {
        placeholder: entityT('placeholders.tin'),
        validate: (value: string) => {
          if (!value) {
            return previousValue ? entityT('errors.tin.required') : true;
          }
          if (!isTin(value)) {
            return entityT('errors.tin.invalid');
          }
          return true;
        },
      },
    };
  }
  if (di === BusinessDI.corporationType) {
    return {
      selectOptions: {
        options: [
          { value: EMPTY_SELECT_VALUE, label: t('select-corporation-type') },
          { value: CorporationType.agent, label: t('corporation-type.agent') },
          {
            value: CorporationType.c_corporation,
            label: t('corporation-type.c_corporation'),
          },
          {
            value: CorporationType.s_corporation,
            label: t('corporation-type.s_corporation'),
          },
          {
            value: CorporationType.b_corporation,
            label: t('corporation-type.b_corporation'),
          },
          { value: CorporationType.llc, label: t('corporation-type.llc') },
          { value: CorporationType.llp, label: t('corporation-type.llp') },
          { value: CorporationType.non_profit, label: t('corporation-type.non_profit') },
          { value: CorporationType.partnership, label: t('corporation-type.partnership') },
          {
            value: CorporationType.sole_proprietorship,
            label: t('corporation-type.sole_proprietorship'),
          },
          { value: CorporationType.trust, label: t('corporation-type.trust') },
          { value: CorporationType.unknown, label: t('corporation-type.unknown') },
        ],
      },
    };
  }
  if (di === BusinessDI.addressLine1) {
    return {
      inputOptions: {
        placeholder: entityT('placeholders.address-line-1'),
        validate: (value: string) => {
          if (!value) {
            return previousValue ? entityT('errors.address-line.required') : true;
          }
          if (!isAddressLine(value)) {
            return entityT('errors.address-line.pattern');
          }
          return true;
        },
      },
    };
  }
  if (di === BusinessDI.city) {
    return {
      inputOptions: {
        placeholder: entityT('placeholders.city'),
        validate: (value: string) => {
          if (!value || typeof value !== 'string') return previousValue ? entityT('errors.city') : true;
          return true;
        },
      },
    };
  }
  if (di === BusinessDI.state) {
    const isDomestic = get(formValues, BusinessDI.country) === 'US';
    if (isDomestic) {
      return {
        selectOptions: {
          options: STATES,
          validate: (value: string) => {
            if (!value || value === EMPTY_SELECT_VALUE) {
              return previousValue ? entityT('errors.state.required') : true;
            }
            return true;
          },
        },
      };
    }
    return {
      inputOptions: {
        validate: (value: string) => {
          if (!value) {
            return previousValue ? entityT('errors.state.required') : true;
          }
          return true;
        },
      },
    };
  }
  if (di === BusinessDI.formationState) {
    const isDomestic = get(formValues, BusinessDI.country) === 'US';
    if (isDomestic) {
      return {
        selectOptions: {
          options: STATES,
        },
      };
    }
    return {
      inputOptions: {},
    };
  }
  if (di === BusinessDI.formationDate) {
    return {
      inputOptions: {
        placeholder: entityT('placeholders.formation-date'),
        pattern: {
          value: /^(?:\d{4}[-/]\d{2}[-/]\d{2})$/,
          message: entityT('errors.dob.pattern'),
        },
        validate: (value: string) => {
          if (!value) return previousValue ? entityT('errors.dob.required') : true;
          if (!isValidDate(value)) return entityT('errors.dob.pattern');
          if (isDobInTheFuture(value)) return entityT('errors.dob.future-date');
          return true;
        },
      },
    };
  }
  // fallback case - no validation
  if (Object.values(BusinessDI).includes(di as BusinessDI) || Object.values(IdDI).includes(di as IdDI)) {
    return {
      inputOptions: {},
    };
  }
  throw Error(`Invalid DataIdentifier in useFieldProps: ${di}`);
};

export default useFieldProps;
