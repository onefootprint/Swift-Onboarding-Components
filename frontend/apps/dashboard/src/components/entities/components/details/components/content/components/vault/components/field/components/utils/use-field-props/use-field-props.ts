import {
  isAddressLine,
  isDobInTheFuture,
  isDobTooOld,
  isDobTooYoung,
  isSsn4,
  isSsn9,
  isTin,
  isURL,
  isValidDate,
} from '@onefootprint/core';
import { COUNTRIES, STATES } from '@onefootprint/global-constants';
import { BusinessDI, CorporationType, type DataIdentifier, IdDI, UsLegalStatus } from '@onefootprint/types';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import EMPTY_SELECT_VALUE from '../../../../../constants';
import validateCitizenships, { CitizenshipsValidationError } from '../validate-citizenships';
import validateName, { NameValidationError } from '../validate-name';

type SelectOption = {
  label: string;
  value: string;
};

type Common = {
  validate?: (value: string) => boolean | string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
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
    options: SelectOption[];
    defaultOption?: SelectOption;
  };

type FieldProps =
  | {
      inputOptions: InputOptions;
      selectOptions?: never;
    }
  | {
      inputOptions?: never;
      selectOptions: SelectOptions;
    };

const useFieldProps = (di: DataIdentifier): FieldProps => {
  const { t } = useTranslation('common');
  const { watch, clearErrors } = useFormContext();
  const formLegalStatus = useWatch({ name: IdDI.usLegalStatus });
  const fieldValue = useWatch({ name: di });

  // IdDI fields
  if (di === IdDI.firstName) {
    return {
      inputOptions: {
        validate: (value: string) => {
          if (!value) {
            return t('pages.entity.edit.errors.name.required');
          }
          const validationResult = validateName(value);
          if (validationResult === NameValidationError.SPECIAL_CHARS) {
            return t('pages.entity.edit.errors.name.special-chars');
          }
          return true;
        },
      },
    };
  }
  if (di === IdDI.middleName) {
    return {
      inputOptions: {
        validate: (value: string) => {
          const validationResult = validateName(value);
          if (validationResult === NameValidationError.SPECIAL_CHARS) {
            return t('pages.entity.edit.errors.name.special-chars');
          }
          return true;
        },
      },
    };
  }
  if (di === IdDI.lastName) {
    return {
      inputOptions: {
        validate: (value: string) => {
          if (!value) {
            return t('pages.entity.edit.errors.name.required');
          }
          const validationResult = validateName(value);
          if (validationResult === NameValidationError.SPECIAL_CHARS) {
            return t('pages.entity.edit.errors.name.special-chars');
          }
          return true;
        },
      },
    };
  }
  if (di === IdDI.dob) {
    return {
      inputOptions: {
        placeholder: 'YYYY-MM-DD',
        inputMode: 'numeric',
        pattern: {
          value: /^(?:\d{4}[-/]\d{2}[-/]\d{2})$/,
          message: t('pages.entity.edit.errors.dob.pattern'),
        },
        validate: (value: string) => {
          if (!value) return t('pages.entity.edit.errors.dob.required');
          if (!isValidDate(value)) return t('pages.entity.edit.errors.dob.pattern');
          if (isDobInTheFuture(value)) return t('pages.entity.edit.errors.dob.future-date');
          if (isDobTooOld(value)) return t('pages.entity.edit.errors.dob.too-old');
          if (isDobTooYoung(value)) return t('pages.entity.edit.errors.dob.too-young');
          return true;
        },
      },
    };
  }
  if (di === IdDI.ssn9) {
    return {
      inputOptions: {
        type: 'tel',
        validate: (value: string) => {
          if (!value) {
            return t('pages.entity.edit.errors.ssn.required');
          }
          if (!isSsn9(value)) {
            return t('pages.entity.edit.errors.ssn.pattern');
          }
          return true;
        },
      },
    };
  }
  if (di === IdDI.ssn4) {
    return {
      inputOptions: {
        validate: (value: string) => {
          if (!value) {
            return t('pages.entity.edit.errors.ssn.required');
          }
          if (!isSsn4(value)) {
            return t('pages.entity.edit.errors.ssn.pattern');
          }
          return true;
        },
      },
    };
  }
  if (di === IdDI.addressLine1) {
    return {
      inputOptions: {
        validate: (value: string) => {
          if (!value) {
            return t('pages.entity.edit.errors.address-line.required');
          }
          if (!isAddressLine(value)) {
            return t('pages.entity.edit.errors.address-line.pattern');
          }
          return true;
        },
      },
    };
  }
  if (di === IdDI.city) {
    return {
      inputOptions: {
        validate: (value: string) => {
          if (!value || typeof value !== 'string') return t('pages.entity.edit.errors.city');
          return true;
        },
      },
    };
  }
  if (di === IdDI.state) {
    const formCountryVal = watch(IdDI.country);
    const isDomestic = formCountryVal === 'US';
    if (isDomestic) {
      return {
        selectOptions: {
          options: STATES,
          'aria-label': 'state',
          validate: (value: string) => {
            if (!value || value === EMPTY_SELECT_VALUE) {
              return t('pages.entity.edit.errors.state.required');
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
            return t('pages.entity.edit.errors.state.required');
          }
          return true;
        },
      },
    };
  }
  if (di === IdDI.nationality) {
    return {
      selectOptions: {
        'aria-label': 'County of birth',
        options: [
          {
            value: EMPTY_SELECT_VALUE,
            label: t('pages.entity.edit.legal-status.nationality-mapping.none'),
          },
          ...(COUNTRIES as SelectOption[]),
        ],
        validate: (value: string) => {
          if (formLegalStatus !== EMPTY_SELECT_VALUE && value === EMPTY_SELECT_VALUE) {
            return t('pages.entity.edit.errors.nationality');
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
          { value: EMPTY_SELECT_VALUE, label: t('pages.entity.edit.legal-status.legal-status-mapping.none') },
          { value: UsLegalStatus.citizen, label: t('pages.entity.edit.legal-status.legal-status-mapping.citizen') },
          {
            value: UsLegalStatus.permanentResident,
            label: t('pages.entity.edit.legal-status.legal-status-mapping.permanent_resident'),
          },
          { value: UsLegalStatus.visa, label: t('pages.entity.edit.legal-status.legal-status-mapping.visa') },
        ],
        onChange: () => clearErrors([IdDI.nationality, IdDI.citizenships, IdDI.visaKind, IdDI.visaExpirationDate]),
      },
    };
  }
  if (di === IdDI.citizenships) {
    return {
      inputOptions: {
        hint: t('pages.entity.edit.errors.citizenships.hint'),
        defaultValue: Array.isArray(fieldValue) ? fieldValue.join(', ') : '',
        validate: (countriesStr: string) => {
          const validationError = validateCitizenships(countriesStr, formLegalStatus);
          if (validationError?.errorType === CitizenshipsValidationError.REQUIRED) {
            return t('pages.entity.edit.errors.citizenships.required');
          }
          if (validationError?.errorType === CitizenshipsValidationError.SHOULD_BE_EMPTY) {
            return t('pages.entity.edit.errors.citizenships.should-be-empty');
          }
          if (validationError?.errorType === CitizenshipsValidationError.US_CITIZENSHIP) {
            return t('pages.entity.edit.errors.citizenships.us-citizenship');
          }
          if (validationError?.errorType === CitizenshipsValidationError.INVALID) {
            return t('pages.entity.edit.errors.citizenships.invalid', { countries: validationError.data });
          }
          return true;
        },
      },
    };
  }

  // Overlapping DI fields
  if (di === IdDI.country || di === BusinessDI.country) {
    return {
      selectOptions: {
        options: COUNTRIES as SelectOption[],
        validate: (value: string) => {
          if (!value) {
            return t('pages.entity.edit.errors.country.required');
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
        validate: (value: string) => {
          if (!value) {
            return t('pages.entity.edit.errors.name.required');
          }
          const validationResult = validateName(value);
          if (validationResult === NameValidationError.SPECIAL_CHARS) {
            return t('pages.entity.edit.errors.name.special-chars');
          }
          return true;
        },
      },
    };
  }
  if (di === BusinessDI.doingBusinessAs) {
    return {
      inputOptions: {
        validate: (value: string) => {
          if (!value) {
            return t('pages.entity.edit.errors.name.required');
          }
          const validationResult = validateName(value);
          if (validationResult === NameValidationError.SPECIAL_CHARS) {
            return t('pages.entity.edit.errors.name.special-chars');
          }
          return true;
        },
      },
    };
  }
  if (di === BusinessDI.website) {
    return {
      inputOptions: {
        placeholder: t('pages.entity.edit.errors.website.placeholder'),
        validate: (value: string) => {
          if (!isURL(value ?? '')) {
            return t('pages.entity.edit.errors.website.invalid');
          }
          return true;
        },
      },
    };
  }
  if (di === BusinessDI.tin) {
    return {
      inputOptions: {
        validate: (value: string) => {
          if (!value) {
            return t('pages.entity.edit.errors.tin.required');
          }
          if (!isTin(value)) {
            return t('pages.entity.edit.errors.tin.invalid');
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
          { value: EMPTY_SELECT_VALUE, label: t('pages.business.vault.basic.select-corporation-type') },
          { value: CorporationType.agent, label: t('pages.business.vault.basic.corporation-type.agent') },
          {
            value: CorporationType.c_corporation,
            label: t('pages.business.vault.basic.corporation-type.c_corporation'),
          },
          {
            value: CorporationType.s_corporation,
            label: t('pages.business.vault.basic.corporation-type.s_corporation'),
          },
          {
            value: CorporationType.b_corporation,
            label: t('pages.business.vault.basic.corporation-type.b_corporation'),
          },
          { value: CorporationType.llc, label: t('pages.business.vault.basic.corporation-type.llc') },
          { value: CorporationType.llp, label: t('pages.business.vault.basic.corporation-type.llp') },
          { value: CorporationType.non_profit, label: t('pages.business.vault.basic.corporation-type.non_profit') },
          { value: CorporationType.partnership, label: t('pages.business.vault.basic.corporation-type.partnership') },
          {
            value: CorporationType.sole_proprietorship,
            label: t('pages.business.vault.basic.corporation-type.sole_proprietorship'),
          },
          { value: CorporationType.trust, label: t('pages.business.vault.basic.corporation-type.trust') },
          { value: CorporationType.unknown, label: t('pages.business.vault.basic.corporation-type.unknown') },
        ],
      },
    };
  }
  if (di === BusinessDI.addressLine1) {
    return {
      inputOptions: {
        validate: (value: string) => {
          if (!value) {
            return t('pages.entity.edit.errors.address-line.required');
          }
          if (!isAddressLine(value)) {
            return t('pages.entity.edit.errors.address-line.pattern');
          }
          return true;
        },
      },
    };
  }
  if (di === BusinessDI.city) {
    return {
      inputOptions: {
        validate: (value: string) => {
          if (!value || typeof value !== 'string') return t('pages.entity.edit.errors.city');
          return true;
        },
      },
    };
  }
  if (di === BusinessDI.state) {
    const formCountryVal = watch(BusinessDI.country);
    const isDomestic = formCountryVal === 'US';
    if (isDomestic) {
      return {
        selectOptions: {
          options: STATES,
          validate: (value: string) => {
            if (!value || value === EMPTY_SELECT_VALUE) {
              return t('pages.entity.edit.errors.state.required');
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
            return t('pages.entity.edit.errors.state.required');
          }
          return true;
        },
      },
    };
  }
  if (di === BusinessDI.formationState) {
    const formCountryVal = watch(BusinessDI.country);
    const isDomestic = formCountryVal === 'US';
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
        pattern: {
          value: /^(?:\d{4}[-/]\d{2}[-/]\d{2})$/,
          message: t('pages.entity.edit.errors.dob.pattern'),
        },
        validate: (value: string) => {
          if (!value) return t('pages.entity.edit.errors.dob.required');
          if (!isValidDate(value)) return t('pages.entity.edit.errors.dob.pattern');
          if (isDobInTheFuture(value)) return t('pages.entity.edit.errors.dob.future-date');
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
