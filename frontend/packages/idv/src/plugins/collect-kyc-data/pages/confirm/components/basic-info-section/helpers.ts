import type { AuthMethodKind, CollectKycDataRequirement } from '@onefootprint/types';
import { CollectedKycDataOption, IdDI, isCountryCode } from '@onefootprint/types';
import type { TFunction } from 'i18next';

import type { SectionItemProps as SectionItem } from '../../../../../../components/confirm-collected-data';
import type { ReturnOfCollectKycDataMachine } from '../../../../hooks/use-collect-kyc-data-machine';
import getAllKycAttributes from '../../../../utils/all-attributes/all-attributes';
import getInitialCountry from '../../../../utils/get-initial-country';

type T = TFunction<'idv', 'kyc.pages'>;
type Maybe<X> = X | undefined;

type State = ReturnOfCollectKycDataMachine[0];
type ContextData = State['context']['data'];
type VerifiableKind = Exclude<`${AuthMethodKind}`, 'passkey'>;
type WithKind = { kind: VerifiableKind };
type WithIsVerified = { isVerified: boolean };
type AuthMethodRes = WithIsVerified & { kind: `${AuthMethodKind}` };
type AuthMethodMap = Record<VerifiableKind, boolean>;

export const isUsLegalStatusRequired = (req: CollectKycDataRequirement): boolean =>
  getAllKycAttributes(req).includes(CollectedKycDataOption.usLegalStatus);

/**
 * Retrieves basic information items from the provided context data and returns them as an array of SectionItems.
 *
 * @param {T} t - A function to translate text.
 * @param {ContextData} data - Context data containing information.
 * @returns {SectionItem[]} An array of SectionItem objects representing basic information items.
 */
export const getBasicInfoItems = (t: T, data: ContextData): SectionItem[] => {
  /**
   * An array of tuples representing property IDs and their corresponding labels.
   * Each tuple consists of the property ID (e.g., IdDI.firstName) and its translated label.
   * @type {[`${IdDI}`, string][]}
   */
  const listOfPropsAndLabels: [`${IdDI}`, string][] = [
    [IdDI.firstName, t('confirm.basic-info.first-name')],
    [IdDI.middleName, t('confirm.basic-info.middle-name')],
    [IdDI.lastName, t('confirm.basic-info.last-name')],
    [IdDI.dob, t('confirm.basic-info.dob')],
  ];

  return listOfPropsAndLabels.reduce<SectionItem[]>((list, [key, text]) => {
    if (data[key]?.value) {
      list.push({ text, subtext: String(data[key]?.value) });
    }
    return list;
  }, []);
};

export const getVerifiableItems = (t: T, data: ContextData) => {
  const listOfPropsAndLabels: [`${IdDI}`, string, VerifiableKind][] = [
    [IdDI.phoneNumber, t('phone-number'), 'phone'],
    [IdDI.email, t('confirm.email.text'), 'email'],
  ];

  return listOfPropsAndLabels.reduce<(SectionItem & WithKind)[]>((list, [key, text, kind]) => {
    if (data[key]?.value) {
      list.push({ kind, text, subtext: String(data[key]?.value) });
    }
    return list;
  }, []);
};

export const getNationalityItems = (t: T, data: ContextData): SectionItem[] => {
  const country = data[IdDI.nationality]?.value;
  const defaultCountry = country && isCountryCode(country) ? country : undefined;
  const nationality = getInitialCountry(defaultCountry)?.label;

  if (country && nationality) {
    return [{ text: t('confirm.basic-info.nationality'), subtext: nationality }];
  }

  return [];
};

export const getVerifiedMap = (list?: AuthMethodRes[]): Maybe<AuthMethodMap> =>
  list
    ? list.reduce<AuthMethodMap>((map, { kind, isVerified }) => {
        if (kind === 'passkey') return map;
        map[kind] = Boolean(isVerified); // eslint-disable-line no-param-reassign
        return map;
      }, Object.create(null))
    : undefined;

export const getVerifiedMethods = (
  data: ContextData,
  map?: Maybe<AuthMethodMap>,
): { phone: string | false; email: string | false } | undefined => {
  const emailValue = data[IdDI.email]?.value;
  const phoneValue = data[IdDI.phoneNumber]?.value;
  return map
    ? {
        email: map.email && emailValue ? emailValue : false,
        phone: map.phone && phoneValue ? phoneValue : false,
      }
    : undefined;
};
