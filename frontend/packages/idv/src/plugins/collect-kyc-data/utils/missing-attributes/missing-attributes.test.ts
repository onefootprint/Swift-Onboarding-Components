import { CollectedKycDataOption, IdDI, UsLegalStatus, VisaKind } from '@onefootprint/types';

import { isDiMissing } from './missing-attributes';

describe('isDiMissing for basic info', () => {
  it('should return false if missing attributes array is empty', () => {
    expect(isDiMissing([], {})).toEqual(false);
  });

  it('should return false if the user has all the basic attributes but they are disabled', () => {
    expect(
      isDiMissing([CollectedKycDataOption.name], {
        [IdDI.firstName]: { value: 'Belce', disabled: true },
        [IdDI.middleName]: { value: 'C.', disabled: true },
        [IdDI.lastName]: { value: 'Dogru', disabled: true },
        [IdDI.city]: { value: 'Enclave', disabled: true },
      }),
    ).toEqual(false);

    expect(
      isDiMissing([CollectedKycDataOption.name], {
        [IdDI.firstName]: { value: 'Belce', disabled: true },
        [IdDI.middleName]: { value: 'C.', disabled: true },
        [IdDI.lastName]: { value: 'Dogru', disabled: true },
      }),
    ).toEqual(false);
  });

  it('should return true if only some of the data values are disabled', () => {
    expect(
      isDiMissing([CollectedKycDataOption.name], {
        [IdDI.firstName]: { value: 'Belce', disabled: true },
        [IdDI.city]: { value: 'Enclave', disabled: true },
      }),
    ).toEqual(true);

    expect(
      isDiMissing([CollectedKycDataOption.name], {
        [IdDI.firstName]: { value: 'Belce', disabled: true },
        [IdDI.lastName]: { value: 'Dogru' },
        [IdDI.city]: { value: 'Enclave', disabled: true },
      }),
    ).toEqual(false);

    expect(
      isDiMissing([CollectedKycDataOption.name], {
        [IdDI.lastName]: { value: 'Dogru', disabled: true },
      }),
    ).toEqual(true);

    expect(
      isDiMissing([CollectedKycDataOption.name], {
        [IdDI.firstName]: { value: 'Belce' },
        [IdDI.lastName]: { value: 'Dogru', disabled: true },
      }),
    ).toEqual(false);
  });

  it('should return true if only some of the data values are bootstrapped', () => {
    expect(
      isDiMissing([CollectedKycDataOption.name], {
        [IdDI.firstName]: { value: 'Belce', bootstrap: true },
        [IdDI.city]: { value: 'Enclave', bootstrap: true },
      }),
    ).toEqual(true);

    expect(
      isDiMissing([CollectedKycDataOption.name], {
        [IdDI.firstName]: { value: 'Belce', bootstrap: true },
        [IdDI.middleName]: { value: 'M.', bootstrap: true },
        [IdDI.lastName]: { value: 'Dogru' },
        [IdDI.city]: { value: 'Enclave', bootstrap: true },
      }),
    ).toEqual(false);

    expect(
      isDiMissing([CollectedKycDataOption.name], {
        [IdDI.lastName]: { value: 'Dogru', bootstrap: true },
      }),
    ).toEqual(true);

    expect(
      isDiMissing([CollectedKycDataOption.name], {
        [IdDI.middleName]: { value: 'Dogru', bootstrap: true },
      }),
    ).toEqual(true);

    expect(
      isDiMissing([CollectedKycDataOption.name], {
        [IdDI.firstName]: { value: 'Belce' },
        [IdDI.lastName]: { value: 'Dogru', bootstrap: true },
      }),
    ).toEqual(false);
  });

  it('should return true if only some of the data values are decrypted', () => {
    expect(
      isDiMissing([CollectedKycDataOption.name], {
        [IdDI.firstName]: { value: 'Belce', decrypted: true },
        [IdDI.city]: { value: 'Enclave', decrypted: true },
      }),
    ).toEqual(true);

    expect(
      isDiMissing([CollectedKycDataOption.name], {
        [IdDI.firstName]: { value: 'Belce', decrypted: true },
        [IdDI.lastName]: { value: 'Dogru' },
        [IdDI.city]: { value: 'Enclave', decrypted: true },
      }),
    ).toEqual(false);

    expect(
      isDiMissing([CollectedKycDataOption.name], {
        [IdDI.lastName]: { value: 'Dogru', decrypted: true },
      }),
    ).toEqual(true);

    expect(
      isDiMissing([CollectedKycDataOption.name], {
        [IdDI.firstName]: { value: 'Belce' },
        [IdDI.lastName]: { value: 'Dogru', decrypted: true },
      }),
    ).toEqual(false);
  });

  it('should return false if the user has the missing attributes', () => {
    expect(
      isDiMissing([CollectedKycDataOption.name], {
        [IdDI.firstName]: { value: 'Belce' },
        [IdDI.lastName]: { value: 'Dogru' },
      }),
    ).toEqual(false);
  });
});

describe('isDiMissing for address', () => {
  it('should return true if the user is missing any of the attributes', () => {
    expect(
      isDiMissing([CollectedKycDataOption.address], {
        [IdDI.addressLine1]: { value: '1 Hayes St' },
      }),
    ).toEqual(true);
    expect(isDiMissing([CollectedKycDataOption.address], {})).toEqual(true);
  });

  it('should return false if the user has all the residential attributes but they are disabled', () => {
    expect(
      isDiMissing([CollectedKycDataOption.address], {
        [IdDI.addressLine1]: { value: '123 Main St', disabled: true },
        [IdDI.city]: { value: 'Enclave', disabled: true },
        [IdDI.state]: { value: 'NY', disabled: true },
        [IdDI.zip]: { value: '94117', disabled: true },
        [IdDI.country]: { value: 'US', disabled: true },
      }),
    ).toEqual(false);
  });

  it('should return true if only some of the data values are disabled', () => {
    expect(
      isDiMissing([CollectedKycDataOption.address], {
        [IdDI.addressLine1]: { value: '123 Main St', disabled: true },
        [IdDI.city]: { value: 'Enclave', disabled: true },
        [IdDI.country]: { value: 'US' },
      }),
    ).toEqual(true);

    expect(
      isDiMissing([CollectedKycDataOption.address], {
        [IdDI.addressLine1]: { value: '123 Main St', disabled: true },
        [IdDI.city]: { value: 'Enclave', disabled: true },
        [IdDI.state]: { value: 'NY', disabled: true },
        [IdDI.zip]: { value: '94117', disabled: true },
        [IdDI.country]: { value: 'US' },
      }),
    ).toEqual(false);

    expect(
      isDiMissing([CollectedKycDataOption.address], {
        [IdDI.addressLine1]: { value: '123 Main St', disabled: true },
        [IdDI.city]: { value: 'Enclave', disabled: true },
        [IdDI.state]: { value: 'NY' },
        [IdDI.zip]: { value: '94117', disabled: true },
        [IdDI.country]: { value: 'US', disabled: true },
      }),
    ).toEqual(false);
  });

  it('should return true if only some of the data values are bootstrapped', () => {
    expect(
      isDiMissing([CollectedKycDataOption.address], {
        [IdDI.addressLine1]: { value: '123 Main St', bootstrap: true },
        [IdDI.city]: { value: 'Enclave', bootstrap: true },
        [IdDI.country]: { value: 'US' },
      }),
    ).toEqual(true);

    expect(
      isDiMissing([CollectedKycDataOption.address], {
        [IdDI.addressLine1]: { value: '123 Main St', bootstrap: true },
        [IdDI.city]: { value: 'Enclave', bootstrap: true },
        [IdDI.state]: { value: 'NY', bootstrap: true },
        [IdDI.zip]: { value: '94117', bootstrap: true },
        [IdDI.country]: { value: 'US' },
      }),
    ).toEqual(false);

    expect(
      isDiMissing([CollectedKycDataOption.address], {
        [IdDI.addressLine1]: { value: '123 Main St', bootstrap: true },
        [IdDI.city]: { value: 'Enclave', bootstrap: true },
        [IdDI.state]: { value: 'NY' },
        [IdDI.zip]: { value: '94117', bootstrap: true },
        [IdDI.country]: { value: 'US', bootstrap: true },
      }),
    ).toEqual(false);
  });

  it('should return true if only some of the data values are decrypted', () => {
    expect(
      isDiMissing([CollectedKycDataOption.address], {
        [IdDI.addressLine1]: { value: '123 Main St', decrypted: true },
        [IdDI.city]: { value: 'Enclave', decrypted: true },
        [IdDI.country]: { value: 'US' },
      }),
    ).toEqual(true);

    expect(
      isDiMissing([CollectedKycDataOption.address], {
        [IdDI.addressLine1]: { value: '123 Main St', decrypted: true },
        [IdDI.city]: { value: 'Enclave', decrypted: true },
        [IdDI.state]: { value: 'NY', decrypted: true },
        [IdDI.zip]: { value: '94117', decrypted: true },
        [IdDI.country]: { value: 'US' },
      }),
    ).toEqual(false);

    expect(
      isDiMissing([CollectedKycDataOption.address], {
        [IdDI.addressLine1]: { value: '123 Main St', decrypted: true },
        [IdDI.city]: { value: 'Enclave', decrypted: true },
        [IdDI.state]: { value: 'NY' },
        [IdDI.zip]: { value: '94117', decrypted: true },
        [IdDI.country]: { value: 'US', decrypted: true },
      }),
    ).toEqual(false);
  });

  it('should return false if the user has the missing residential attributes', () => {
    expect(
      isDiMissing([CollectedKycDataOption.address], {
        [IdDI.addressLine1]: { value: '94117' },
        [IdDI.city]: { value: 'Enclave' },
        [IdDI.state]: { value: 'NY' },
        [IdDI.zip]: { value: '94117' },
        [IdDI.country]: { value: 'US' },
      }),
    ).toEqual(false);
  });

  it('should return true if the user is missing any of the residential attributes', () => {
    expect(isDiMissing([CollectedKycDataOption.address], {})).toEqual(true);
    expect(
      isDiMissing([CollectedKycDataOption.address], {
        [IdDI.zip]: { value: '94107' },
        [IdDI.country]: { value: 'US' },
      }),
    ).toEqual(true);
    expect(
      isDiMissing([CollectedKycDataOption.address], {
        [IdDI.zip]: { value: '94117' },
      }),
    ).toEqual(true);
    expect(
      isDiMissing([CollectedKycDataOption.dob, CollectedKycDataOption.address], {
        [IdDI.zip]: { value: '94117' },
      }),
    ).toEqual(true);
  });
});

describe('isDiMissing for US legal status', () => {
  it('should return true if only some of the data values are bootstrapped', () => {
    expect(
      isDiMissing([CollectedKycDataOption.usLegalStatus], {
        [IdDI.usLegalStatus]: {
          value: UsLegalStatus.visa,
          bootstrap: true,
        },
        [IdDI.visaKind]: { value: VisaKind.e1, bootstrap: true },
        [IdDI.visaExpirationDate]: { value: '01012030' },
      }),
    ).toEqual(true);

    expect(
      isDiMissing([CollectedKycDataOption.usLegalStatus], {
        [IdDI.usLegalStatus]: {
          value: UsLegalStatus.visa,
          bootstrap: true,
        },
        [IdDI.nationality]: { value: 'IT', bootstrap: true },
        [IdDI.citizenships]: { value: ['BR'], bootstrap: true },
        [IdDI.visaKind]: { value: VisaKind.e1, bootstrap: true },
        [IdDI.visaExpirationDate]: { value: '01012030', bootstrap: true },
      }),
    ).toEqual(false);

    expect(
      isDiMissing([CollectedKycDataOption.usLegalStatus], {
        [IdDI.usLegalStatus]: {
          value: UsLegalStatus.citizen,
          bootstrap: true,
        },
      }),
    ).toEqual(false);

    expect(
      isDiMissing([CollectedKycDataOption.usLegalStatus], {
        [IdDI.usLegalStatus]: {
          value: UsLegalStatus.permanentResident,
          bootstrap: true,
        },
      }),
    ).toEqual(true);

    expect(
      isDiMissing([CollectedKycDataOption.usLegalStatus], {
        [IdDI.usLegalStatus]: {
          value: UsLegalStatus.permanentResident,
          bootstrap: true,
        },
        [IdDI.citizenships]: { value: ['BR'], bootstrap: true },
      }),
    ).toEqual(true);
  });

  it('should return true if only some of the data values are decrypted', () => {
    expect(
      isDiMissing([CollectedKycDataOption.usLegalStatus], {
        [IdDI.usLegalStatus]: {
          value: UsLegalStatus.citizen,
          decrypted: true,
        },
      }),
    ).toEqual(false);

    expect(
      isDiMissing([CollectedKycDataOption.usLegalStatus], {
        [IdDI.usLegalStatus]: {
          value: UsLegalStatus.visa,
          decrypted: true,
        },
        [IdDI.nationality]: { value: 'IT', decrypted: true },
        [IdDI.citizenships]: { value: ['BR'], decrypted: true },
        [IdDI.visaKind]: { value: VisaKind.e1, decrypted: true },
      }),
    ).toEqual(true);

    expect(
      isDiMissing([CollectedKycDataOption.usLegalStatus], {
        [IdDI.usLegalStatus]: {
          value: UsLegalStatus.permanentResident,
          decrypted: true,
        },
        [IdDI.nationality]: { value: 'IT', decrypted: true },
      }),
    ).toEqual(true);
  });

  it('should return false if the user has the missing residential attributes', () => {
    expect(
      isDiMissing([CollectedKycDataOption.usLegalStatus], {
        [IdDI.usLegalStatus]: { value: UsLegalStatus.citizen },
      }),
    ).toEqual(false);
    expect(
      isDiMissing([CollectedKycDataOption.usLegalStatus], {
        [IdDI.usLegalStatus]: { value: UsLegalStatus.permanentResident },
        [IdDI.nationality]: { value: 'IT' },
        [IdDI.citizenships]: { value: ['BR'] },
      }),
    ).toEqual(false);
    expect(
      isDiMissing([CollectedKycDataOption.usLegalStatus], {
        [IdDI.usLegalStatus]: { value: UsLegalStatus.visa },
        [IdDI.nationality]: { value: 'IT' },
        [IdDI.citizenships]: { value: ['BR'] },
        [IdDI.visaKind]: { value: VisaKind.e1 },
        [IdDI.visaExpirationDate]: { value: '01012030' },
      }),
    ).toEqual(false);
  });

  it('should return true if the user is missing any of the us legal status attributes', () => {
    expect(isDiMissing([CollectedKycDataOption.usLegalStatus], {})).toEqual(true);
    expect(
      isDiMissing([CollectedKycDataOption.usLegalStatus], {
        [IdDI.nationality]: { value: 'CN' },
        [IdDI.citizenships]: { value: ['HK'] },
      }),
    ).toEqual(true);
    expect(
      isDiMissing([CollectedKycDataOption.usLegalStatus], {
        [IdDI.visaKind]: { value: VisaKind.other },
      }),
    ).toEqual(true);
    expect(
      isDiMissing([CollectedKycDataOption.dob, CollectedKycDataOption.usLegalStatus], {
        [IdDI.visaExpirationDate]: { value: '01012030' },
      }),
    ).toEqual(true);
  });
});

describe('isDiMissing for SSN', () => {
  it('should return false if the user has SSN', () => {
    expect(
      isDiMissing([CollectedKycDataOption.ssn9], {
        [IdDI.ssn9]: { value: '000000' },
      }),
    ).toEqual(false);

    expect(
      isDiMissing([CollectedKycDataOption.ssn9], {
        [IdDI.ssn9]: { value: '000000', disabled: true },
      }),
    ).toEqual(false);

    expect(
      isDiMissing([CollectedKycDataOption.ssn9], {
        [IdDI.ssn9]: { value: '000000', decrypted: true },
      }),
    ).toEqual(false);

    expect(
      isDiMissing([CollectedKycDataOption.ssn9], {
        [IdDI.ssn9]: { value: '000000', bootstrap: true },
      }),
    ).toEqual(false);
  });

  it('should return false if the user has last 4 digits of SSN', () => {
    expect(
      isDiMissing([CollectedKycDataOption.ssn4], {
        [IdDI.ssn4]: { value: '000000' },
      }),
    ).toEqual(false);

    expect(
      isDiMissing([CollectedKycDataOption.ssn4], {
        [IdDI.ssn4]: { value: '000000', disabled: true },
      }),
    ).toEqual(false);

    expect(
      isDiMissing([CollectedKycDataOption.ssn4], {
        [IdDI.ssn4]: { value: '000000', decrypted: true },
      }),
    ).toEqual(false);

    expect(
      isDiMissing([CollectedKycDataOption.ssn4], {
        [IdDI.ssn4]: { value: '000000', bootstrap: true },
      }),
    ).toEqual(false);
  });

  it('should return true if the user does not have the SSN', () => {
    expect(isDiMissing([CollectedKycDataOption.ssn9], {})).toEqual(true);
    expect(isDiMissing([CollectedKycDataOption.ssn4], {})).toEqual(true);
    expect(
      isDiMissing([CollectedKycDataOption.ssn4], {
        [IdDI.ssn9]: { value: '0000000' },
      }),
    ).toEqual(true);
    expect(
      isDiMissing([CollectedKycDataOption.ssn4], {
        [IdDI.ssn9]: { value: '0000000', disabled: true },
      }),
    ).toEqual(true);
    expect(
      isDiMissing([CollectedKycDataOption.ssn4], {
        [IdDI.ssn9]: { value: '0000000', decrypted: true },
      }),
    ).toEqual(true);
    expect(
      isDiMissing([CollectedKycDataOption.ssn4], {
        [IdDI.ssn9]: { value: '0000000', bootstrap: true },
      }),
    ).toEqual(true);
    expect(
      isDiMissing([CollectedKycDataOption.ssn9], {
        [IdDI.ssn4]: { value: '0000' },
      }),
    ).toEqual(true);
    expect(
      isDiMissing([CollectedKycDataOption.ssn9], {
        [IdDI.ssn4]: { value: '0000', disabled: true },
      }),
    ).toEqual(true);
  });
});
