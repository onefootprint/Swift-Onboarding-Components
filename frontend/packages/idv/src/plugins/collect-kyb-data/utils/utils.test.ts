import { BusinessDI, type BusinessDIData, type SupportedLocale } from '@onefootprint/types';
import { formatPayload, omitEqualData } from './utils';

describe('omitEqualData', () => {
  it('should return an empty object when both inputs are empty', () => {
    const vaultData = {};
    const data = {};
    expect(omitEqualData(vaultData, data)).toEqual({});
  });

  it('should return the entire data object when the vault data is empty', () => {
    const vaultData = {};
    const data = { 'business.name': 'Acme Bank Inc.' };

    expect(omitEqualData(vaultData, data)).toEqual(data);
  });

  it('should return the entire data object when the vault data is undefined', () => {
    const vaultData = undefined;
    const data = { 'business.name': 'Acme Bank Inc.' };

    expect(omitEqualData(vaultData, data)).toEqual(data);
  });

  it('should omit keys that are equal in both objects', () => {
    const vaultData = {
      'business.name': 'Acme Bank Inc.',
    };
    const data = {
      'business.name': 'Acme Bank Inc.',
      'business.dba': 'Acme Bank',
    };
    expect(omitEqualData(vaultData, data)).toEqual(data);
  });

  it('should return business.name data when business.name is different', () => {
    const vaultData = {
      'business.name': 'Company name A',
      'business.dba': 'Acme',
    };
    const data = {
      'business.name': 'Company name B',
      'business.dba': 'Acme',
    };

    expect(omitEqualData(vaultData, data)).toEqual({ 'business.name': 'Company name B' });
  });

  it('should return business.name and business.dba when business.dba is different', () => {
    const vaultData = {
      'business.name': 'Company name A',
      'business.dba': 'Acme',
    };
    const data = {
      'business.name': 'Company name A',
      'business.dba': 'Acme B',
    };
    expect(omitEqualData(vaultData, data)).toEqual(data);
  });

  it('should return data when it does not contain vault data', () => {
    const vaultData = { 'business.name': 'Acme Bank Inc.' };
    const data = { 'business.name': 'Banana Inc.' };
    expect(omitEqualData(vaultData, data)).toEqual({ 'business.name': 'Banana Inc.' });
  });

  describe('omitEqualData - businessAddress', () => {
    const vaultData = {
      'business.address_line1': '123 Main St',
      'business.address_line2': 'Apt 123',
      'business.city': 'Boston',
      'business.state': 'MA',
      'business.zip': '02117',
      'business.country': 'US' as const,
    };

    it('should return empty object when vault address data and payload address data are equal', () => {
      const data = {
        'business.address_line1': '123 Main St',
        'business.address_line2': 'Apt 123',
        'business.city': 'Boston',
        'business.state': 'MA',
        'business.zip': '02117',
        'business.country': 'US' as const,
      };
      expect(omitEqualData(vaultData, data)).toEqual({});
    });

    it('should return the payload data when line 1 is different', () => {
      const diffLine1 = {
        'business.address_line1': '1234 Main St',
        'business.address_line2': 'Apt 123',
        'business.city': 'Boston',
        'business.state': 'MA',
        'business.zip': '02117',
        'business.country': 'US' as const,
      };
      expect(omitEqualData(vaultData, diffLine1)).toEqual(diffLine1);
    });

    it('should return the payload data when line 2 is different', () => {
      const diffLine2 = {
        'business.address_line1': '123 Main St',
        'business.address_line2': 'Apt 1234',
        'business.city': 'Boston',
        'business.state': 'MA',
        'business.zip': '02117',
        'business.country': 'US' as const,
      };

      expect(omitEqualData(vaultData, diffLine2)).toEqual(diffLine2);
    });

    it('should return the payload data when city is different', () => {
      const diffCity = {
        'business.address_line1': '123 Main St',
        'business.address_line2': 'Apt 123',
        'business.city': 'Boston_',
        'business.state': 'MA',
        'business.zip': '02117',
        'business.country': 'US' as const,
      };

      expect(omitEqualData(vaultData, diffCity)).toEqual(diffCity);
    });

    it('should return the payload data when state is different', () => {
      const diffState = {
        'business.address_line1': '123 Main St',
        'business.address_line2': 'Apt 123',
        'business.city': 'Boston',
        'business.state': 'MA_',
        'business.zip': '02117',
        'business.country': 'US' as const,
      };

      expect(omitEqualData(vaultData, diffState)).toEqual(diffState);
    });

    it('should return the payload data when zip is different', () => {
      const diffZip = {
        'business.address_line1': '123 Main St',
        'business.address_line2': 'Apt 123',
        'business.city': 'Boston',
        'business.state': 'MA',
        'business.zip': '02118',
        'business.country': 'US' as const,
      };

      expect(omitEqualData(vaultData, diffZip)).toEqual(diffZip);
    });

    it('should return the payload data when country is different', () => {
      const diffCountry = {
        'business.address_line1': '123 Main St',
        'business.address_line2': 'Apt 123',
        'business.city': 'Boston',
        'business.state': 'MA',
        'business.zip': '02117',
        'business.country': 'NOT-US' as 'US',
      };

      expect(omitEqualData(vaultData, diffCountry)).toEqual(diffCountry);
    });

    it('should be able to handle business address and other types of data', () => {
      const vaultData = {
        'business.address_line1': '123 Main St',
        'business.address_line2': 'Apt 123',
        'business.city': 'Boston',
        'business.state': 'MA',
        'business.zip': '02118',
        'business.country': 'US' as const,
        'business.name': 'Acme Bank Inc.',
      };
      expect(
        omitEqualData(vaultData, {
          ...vaultData,
          'business.address_line2': 'Apt 1234',
          'business.name': 'Other Bank Inc.',
        }),
      ).toEqual({
        'business.address_line1': '123 Main St',
        'business.address_line2': 'Apt 1234',
        'business.city': 'Boston',
        'business.country': 'US',
        'business.name': 'Other Bank Inc.',
        'business.state': 'MA',
        'business.zip': '02118',
      });
    });
  });
});

describe('formatPayload', () => {
  it('should return the original data if the date is already in ISO 8601 format', () => {
    const locale: SupportedLocale = 'en-US';
    const data: BusinessDIData = { [BusinessDI.formationDate]: '2022-01-01' };

    expect(formatPayload(locale, data)).toEqual({ [BusinessDI.formationDate]: '2022-01-01' });
  });

  it('should convert a US date format to ISO 8601 format', () => {
    const locale: SupportedLocale = 'en-US';
    const data: BusinessDIData = { [BusinessDI.formationDate]: '01/01/2022' };

    expect(formatPayload(locale, data)).toEqual({ [BusinessDI.formationDate]: '2022-01-01' });
  });

  it('should return undefined if the date is empty or null', () => {
    const locale: SupportedLocale = 'en-US';
    const data: BusinessDIData = { [BusinessDI.formationDate]: '' };
    const expected: BusinessDIData = { [BusinessDI.formationDate]: undefined };

    expect(formatPayload(locale, data)).toEqual(expected);

    // @ts-expect-error: null is not a valid BusinessDIData
    data[BusinessDI.formationDate] = null;
    expect(formatPayload(locale, data)).toEqual(expected);
  });

  it('should handle different locales', () => {
    const locale: SupportedLocale = 'es-MX';
    const data: BusinessDIData = { [BusinessDI.formationDate]: '01/01/2022' };

    expect(formatPayload(locale, data)).toEqual({ [BusinessDI.formationDate]: '2022-01-01' });
  });
});
