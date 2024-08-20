import { renderHook } from '@onefootprint/test-utils';
import useConvertFormData from './use-convert-form-data';

jest.mock('../../../../hooks/use-collect-kyc-data-machine', () => ({
  __esModule: true,
  default: () => [
    {
      context: {
        data: {
          'id.ssn4': { value: 'oldSsn4' },
          'id.ssn9': { value: 'oldSsn9' },
          'id.us_tax_id': { value: 'oldUsTaxId' },
        },
        requirement: {
          missingAttributes: ['ssn4', 'ssn9', 'us_tax_id'],
          populatedAttributes: [],
          optionalAttributes: [],
        },
      },
    },
    () => undefined,
  ],
}));

jest.mock('../../../../../../utils/logger/logger', () => ({
  __esModule: true,
  default: () => undefined,
  getLogger: () => ({
    logError: () => undefined,
    logInfo: () => undefined,
    logTrack: () => undefined,
    logWarn: () => undefined,
  }),
}));

describe('When ssn and usTaxId are required', () => {
  it('should return an empty strings for ssn4 and ssn9 when isSkipped is true', () => {
    const { result } = renderHook(() => useConvertFormData());
    const formData = { ssn4: 'newSsn4', ssn9: 'newSsn9', usTaxId: 'newUsTaxId' };
    const convertedData = result.current(formData, true);
    expect(convertedData).toEqual({
      'id.ssn4': { bootstrap: false, decrypted: false, dirty: true, disabled: false, value: '' },
      'id.ssn9': { bootstrap: false, decrypted: false, dirty: true, disabled: false, value: '' },
    });
  });

  it('should return an empty object if formData is empty', () => {
    const { result } = renderHook(() => useConvertFormData());
    const formData = { ssn4: '', ssn9: '', usTaxId: '' };
    const convertedData = result.current(formData);
    expect(convertedData).toEqual({});
  });

  it('Should new value for usTaxId', () => {
    const { result } = renderHook(() => useConvertFormData());
    const formData = { ssn4: '', ssn9: '', usTaxId: 'newUsTaxId' };
    const convertedData = result.current(formData);
    expect(convertedData).toEqual({
      'id.us_tax_id': { bootstrap: false, decrypted: false, dirty: true, disabled: false, value: 'newUsTaxId' },
    });
  });

  it('Should new value for ssn9', () => {
    const { result } = renderHook(() => useConvertFormData());
    const formData = { ssn4: '', ssn9: 'newSsn9', usTaxId: '' };
    const convertedData = result.current(formData);
    expect(convertedData).toEqual({
      'id.ssn9': { bootstrap: false, decrypted: false, dirty: true, disabled: false, value: 'newSsn9' },
    });
  });

  it('Should new value for ssn9', () => {
    const { result } = renderHook(() => useConvertFormData());
    const formData = { ssn4: 'newSsn4', ssn9: '', usTaxId: '' };
    const convertedData = result.current(formData);
    expect(convertedData).toEqual({
      'id.ssn4': { bootstrap: false, decrypted: false, dirty: true, disabled: false, value: 'newSsn4' },
    });
  });
});
