import { getIsoDate, isValidIsoDate } from '@onefootprint/core';
import { BusinessDI, type BusinessDIData, type SupportedLocale } from '@onefootprint/types';
import isEqual from 'lodash/isEqual';
import { isObject } from '../../../utils';
import { BusinessAddressFields } from './constants';

export const omitNullAndUndefined = <T extends object>(data: T): T =>
  Object.entries(data).reduce((response, [key, value]) => {
    if (value != null) response[key] = value;
    return response;
  }, Object.create(null));

export const omitEqualData = <T extends BusinessDIData>(vaultData: T | undefined | null, payload: T): T => {
  const output = {} as T;

  if (!isObject(vaultData)) return payload;

  for (const key in payload) {
    if (key === BusinessDI.doingBusinessAs && !isEqual(payload[key], vaultData[key])) {
      output[BusinessDI.name] = payload[BusinessDI.name];
      output[BusinessDI.doingBusinessAs] = payload[BusinessDI.doingBusinessAs];
      continue;
    }

    if (BusinessAddressFields.includes(key) && !isEqual(payload[key], vaultData[key])) {
      output[BusinessDI.addressLine1] = payload[BusinessDI.addressLine1];
      output[BusinessDI.addressLine2] = payload[BusinessDI.addressLine2];
      output[BusinessDI.city] = payload[BusinessDI.city];
      output[BusinessDI.state] = payload[BusinessDI.state];
      output[BusinessDI.zip] = payload[BusinessDI.zip];
      output[BusinessDI.country] = payload[BusinessDI.country];
      continue;
    }

    if (isObject(payload[key]) || Array.isArray(payload[key])) {
      if (!isEqual(payload[key], vaultData[key])) {
        output[key] = payload[key];
      }
    } else if (payload[key] !== vaultData[key]) {
      output[key] = payload[key];
    }
  }

  return output;
};

export const formatPayload = (locale: SupportedLocale, data: BusinessDIData): BusinessDIData => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (key === BusinessDI.formationDate) {
        return [key, isValidIsoDate(value) ? value : getIsoDate(value, locale) || undefined];
      }
      return [key, value];
    }),
  );
};

export const isScrubbed = (str: unknown): str is 'scrubbed' => str === 'scrubbed';

export const formatTin = (tin?: string): string => {
  if (!tin) return '';
  const numericTin = tin.replace(/[^0-9]/g, '');
  return `${numericTin.slice(0, 2)}-${numericTin.slice(2)}`;
};

export const getTinDefaultValue = (tin?: string): string => {
  return !tin || isScrubbed(tin) ? '' : formatTin(tin);
};
