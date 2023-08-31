import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

import {
  hasMissingAttributes,
  isMissingBasicAttribute,
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
} from './missing-attributes';

describe('MissingAttributesUtils', () => {
  describe('isMissingBasicAttribute', () => {
    it('should return false if missing attributes array is empty', () => {
      expect(isMissingBasicAttribute([], {})).toEqual(false);
    });

    it('should return false if the user has all the basic attributes but they are disabled', () => {
      expect(
        isMissingBasicAttribute(
          [CollectedKycDataOption.name, CollectedKycDataOption.fullAddress],
          {
            [IdDI.firstName]: { value: 'Belce', disabled: true },
            [IdDI.lastName]: { value: 'Dogru', disabled: true },
            [IdDI.city]: { value: 'Enclave', disabled: true },
          },
        ),
      ).toEqual(false);

      expect(
        isMissingBasicAttribute([CollectedKycDataOption.name], {
          [IdDI.firstName]: { value: 'Belce', disabled: true },
          [IdDI.lastName]: { value: 'Dogru', disabled: true },
        }),
      ).toEqual(false);
    });

    it('should return true if only some of the data values are disabled', () => {
      expect(
        isMissingBasicAttribute(
          [CollectedKycDataOption.name, CollectedKycDataOption.fullAddress],
          {
            [IdDI.firstName]: { value: 'Belce', disabled: true },
            [IdDI.city]: { value: 'Enclave', disabled: true },
          },
        ),
      ).toEqual(true);

      expect(
        isMissingBasicAttribute(
          [CollectedKycDataOption.name, CollectedKycDataOption.fullAddress],
          {
            [IdDI.firstName]: { value: 'Belce', disabled: true },
            [IdDI.lastName]: { value: 'Dogru' },
            [IdDI.city]: { value: 'Enclave', disabled: true },
          },
        ),
      ).toEqual(false);

      expect(
        isMissingBasicAttribute([CollectedKycDataOption.name], {
          [IdDI.lastName]: { value: 'Dogru', disabled: true },
        }),
      ).toEqual(true);

      expect(
        isMissingBasicAttribute([CollectedKycDataOption.name], {
          [IdDI.firstName]: { value: 'Belce' },
          [IdDI.lastName]: { value: 'Dogru', disabled: true },
        }),
      ).toEqual(false);
    });

    it('should return true if only some of the data values are bootstrapped', () => {
      expect(
        isMissingBasicAttribute(
          [CollectedKycDataOption.name, CollectedKycDataOption.fullAddress],
          {
            [IdDI.firstName]: { value: 'Belce', bootstrap: true },
            [IdDI.city]: { value: 'Enclave', bootstrap: true },
          },
        ),
      ).toEqual(true);

      expect(
        isMissingBasicAttribute(
          [CollectedKycDataOption.name, CollectedKycDataOption.fullAddress],
          {
            [IdDI.firstName]: { value: 'Belce', bootstrap: true },
            [IdDI.lastName]: { value: 'Dogru' },
            [IdDI.city]: { value: 'Enclave', bootstrap: true },
          },
        ),
      ).toEqual(false);

      expect(
        isMissingBasicAttribute([CollectedKycDataOption.name], {
          [IdDI.lastName]: { value: 'Dogru', bootstrap: true },
        }),
      ).toEqual(true);

      expect(
        isMissingBasicAttribute([CollectedKycDataOption.name], {
          [IdDI.firstName]: { value: 'Belce' },
          [IdDI.lastName]: { value: 'Dogru', bootstrap: true },
        }),
      ).toEqual(false);
    });

    it('should return true if only some of the data values are decrypted', () => {
      expect(
        isMissingBasicAttribute(
          [CollectedKycDataOption.name, CollectedKycDataOption.fullAddress],
          {
            [IdDI.firstName]: { value: 'Belce', decrypted: true },
            [IdDI.city]: { value: 'Enclave', decrypted: true },
          },
        ),
      ).toEqual(true);

      expect(
        isMissingBasicAttribute(
          [CollectedKycDataOption.name, CollectedKycDataOption.fullAddress],
          {
            [IdDI.firstName]: { value: 'Belce', decrypted: true },
            [IdDI.lastName]: { value: 'Dogru' },
            [IdDI.city]: { value: 'Enclave', decrypted: true },
          },
        ),
      ).toEqual(false);

      expect(
        isMissingBasicAttribute([CollectedKycDataOption.name], {
          [IdDI.lastName]: { value: 'Dogru', decrypted: true },
        }),
      ).toEqual(true);

      expect(
        isMissingBasicAttribute([CollectedKycDataOption.name], {
          [IdDI.firstName]: { value: 'Belce' },
          [IdDI.lastName]: { value: 'Dogru', decrypted: true },
        }),
      ).toEqual(false);
    });

    it('should return false if the user has the missing basic attributes', () => {
      expect(
        isMissingBasicAttribute([CollectedKycDataOption.fullAddress]),
      ).toEqual(false);
      expect(
        isMissingBasicAttribute([CollectedKycDataOption.fullAddress], {
          [IdDI.city]: { value: 'Enclave' },
        }),
      ).toEqual(false);
      expect(
        isMissingBasicAttribute(
          [CollectedKycDataOption.name, CollectedKycDataOption.fullAddress],
          {
            [IdDI.firstName]: { value: 'Belce' },
            [IdDI.lastName]: { value: 'Dogru' },
          },
        ),
      ).toEqual(false);
    });

    it('should return true if the user is missing any of the basic attributes', () => {
      expect(
        isMissingResidentialAttribute(
          [CollectedKycDataOption.name, CollectedKycDataOption.fullAddress],
          {},
        ),
      ).toEqual(true);
      expect(
        isMissingResidentialAttribute(
          [CollectedKycDataOption.name, CollectedKycDataOption.fullAddress],
          {
            [IdDI.firstName]: { value: 'Belce' },
          },
        ),
      ).toEqual(true);
      expect(
        isMissingBasicAttribute(
          [CollectedKycDataOption.name, CollectedKycDataOption.fullAddress],
          {},
        ),
      ).toEqual(true);
    });
  });

  describe('isMissingResidentialAttribute', () => {
    it('should return false if missing attributes array is empty', () => {
      expect(isMissingResidentialAttribute([], {})).toEqual(false);
    });

    it('should return false if the user has all the residential attributes but they are disabled', () => {
      expect(
        isMissingResidentialAttribute([CollectedKycDataOption.fullAddress], {
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
        isMissingResidentialAttribute([CollectedKycDataOption.fullAddress], {
          [IdDI.addressLine1]: { value: '123 Main St', disabled: true },
          [IdDI.city]: { value: 'Enclave', disabled: true },
          [IdDI.country]: { value: 'US' },
        }),
      ).toEqual(true);

      expect(
        isMissingResidentialAttribute([CollectedKycDataOption.fullAddress], {
          [IdDI.addressLine1]: { value: '123 Main St', disabled: true },
          [IdDI.city]: { value: 'Enclave', disabled: true },
          [IdDI.state]: { value: 'NY', disabled: true },
          [IdDI.zip]: { value: '94117', disabled: true },
          [IdDI.country]: { value: 'US' },
        }),
      ).toEqual(false);

      expect(
        isMissingResidentialAttribute([CollectedKycDataOption.fullAddress], {
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
        isMissingResidentialAttribute([CollectedKycDataOption.fullAddress], {
          [IdDI.addressLine1]: { value: '123 Main St', bootstrap: true },
          [IdDI.city]: { value: 'Enclave', bootstrap: true },
          [IdDI.country]: { value: 'US' },
        }),
      ).toEqual(true);

      expect(
        isMissingResidentialAttribute([CollectedKycDataOption.fullAddress], {
          [IdDI.addressLine1]: { value: '123 Main St', bootstrap: true },
          [IdDI.city]: { value: 'Enclave', bootstrap: true },
          [IdDI.state]: { value: 'NY', bootstrap: true },
          [IdDI.zip]: { value: '94117', bootstrap: true },
          [IdDI.country]: { value: 'US' },
        }),
      ).toEqual(false);

      expect(
        isMissingResidentialAttribute([CollectedKycDataOption.fullAddress], {
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
        isMissingResidentialAttribute([CollectedKycDataOption.fullAddress], {
          [IdDI.addressLine1]: { value: '123 Main St', decrypted: true },
          [IdDI.city]: { value: 'Enclave', decrypted: true },
          [IdDI.country]: { value: 'US' },
        }),
      ).toEqual(true);

      expect(
        isMissingResidentialAttribute([CollectedKycDataOption.fullAddress], {
          [IdDI.addressLine1]: { value: '123 Main St', decrypted: true },
          [IdDI.city]: { value: 'Enclave', decrypted: true },
          [IdDI.state]: { value: 'NY', decrypted: true },
          [IdDI.zip]: { value: '94117', decrypted: true },
          [IdDI.country]: { value: 'US' },
        }),
      ).toEqual(false);

      expect(
        isMissingResidentialAttribute([CollectedKycDataOption.fullAddress], {
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
        isMissingResidentialAttribute(
          [
            CollectedKycDataOption.name,
            CollectedKycDataOption.dob,
            CollectedKycDataOption.ssn4,
          ],
          {},
        ),
      ).toEqual(false);
      expect(
        isMissingResidentialAttribute([CollectedKycDataOption.fullAddress], {
          [IdDI.addressLine1]: { value: '94117' },
          [IdDI.city]: { value: 'Enclave' },
          [IdDI.state]: { value: 'NY' },
          [IdDI.zip]: { value: '94117' },
          [IdDI.country]: { value: 'US' },
        }),
      ).toEqual(false);
    });

    it('should return true if the user is missing any of the residential attributes', () => {
      expect(
        isMissingResidentialAttribute([CollectedKycDataOption.fullAddress], {}),
      ).toEqual(true);
      expect(
        isMissingResidentialAttribute([CollectedKycDataOption.fullAddress], {
          [IdDI.zip]: { value: '94107' },
          [IdDI.country]: { value: 'US' },
        }),
      ).toEqual(true);
      expect(
        isMissingResidentialAttribute([CollectedKycDataOption.fullAddress], {
          [IdDI.zip]: { value: '94117' },
        }),
      ).toEqual(true);
      expect(
        isMissingResidentialAttribute(
          [CollectedKycDataOption.dob, CollectedKycDataOption.fullAddress],
          {
            [IdDI.zip]: { value: '94117' },
          },
        ),
      ).toEqual(true);
    });
  });

  describe('isMissingSsnAttribute', () => {
    it('should return false if missing attributes array is empty', () => {
      expect(isMissingSsnAttribute([], {})).toEqual(false);
      expect(isMissingSsnAttribute([CollectedKycDataOption.dob], {})).toEqual(
        false,
      );
    });

    it('should return false if the user has SSN', () => {
      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn9], {
          [IdDI.ssn9]: { value: '000000' },
        }),
      ).toEqual(false);

      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn9], {
          [IdDI.ssn9]: { value: '000000', disabled: true },
        }),
      ).toEqual(false);

      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn9], {
          [IdDI.ssn9]: { value: '000000', decrypted: true },
        }),
      ).toEqual(false);

      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn9], {
          [IdDI.ssn9]: { value: '000000', bootstrap: true },
        }),
      ).toEqual(false);
    });

    it('should return false if the user has last 4 digits of SSN', () => {
      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn4], {
          [IdDI.ssn4]: { value: '000000' },
        }),
      ).toEqual(false);

      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn4], {
          [IdDI.ssn4]: { value: '000000', disabled: true },
        }),
      ).toEqual(false);

      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn4], {
          [IdDI.ssn4]: { value: '000000', decrypted: true },
        }),
      ).toEqual(false);

      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn4], {
          [IdDI.ssn4]: { value: '000000', bootstrap: true },
        }),
      ).toEqual(false);
    });

    it('should return true if the user does not have the SSN', () => {
      expect(isMissingSsnAttribute([CollectedKycDataOption.ssn9], {})).toEqual(
        true,
      );
      expect(isMissingSsnAttribute([CollectedKycDataOption.ssn4], {})).toEqual(
        true,
      );
      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn4], {
          [IdDI.ssn9]: { value: '0000000' },
        }),
      ).toEqual(true);
      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn4], {
          [IdDI.ssn9]: { value: '0000000', disabled: true },
        }),
      ).toEqual(true);
      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn4], {
          [IdDI.ssn9]: { value: '0000000', decrypted: true },
        }),
      ).toEqual(true);
      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn4], {
          [IdDI.ssn9]: { value: '0000000', bootstrap: true },
        }),
      ).toEqual(true);
      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn9], {
          [IdDI.ssn4]: { value: '0000' },
        }),
      ).toEqual(true);
      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn9], {
          [IdDI.ssn4]: { value: '0000', disabled: true },
        }),
      ).toEqual(true);
    });
  });

  describe('hasMissingAttributes', () => {
    it('should return false if missing attributes array is empty', () => {
      expect(hasMissingAttributes([], {})).toEqual(false);
    });

    it('should return false if the user has all the missing attributes', () => {
      expect(
        hasMissingAttributes(
          [CollectedKycDataOption.name, CollectedKycDataOption.ssn4],
          {
            [IdDI.firstName]: { value: 'Belce' },
            [IdDI.lastName]: { value: 'Dogru' },
            [IdDI.ssn4]: { value: '0000' },
          },
        ),
      ).toEqual(false);

      expect(
        hasMissingAttributes(
          [CollectedKycDataOption.name, CollectedKycDataOption.ssn4],
          {
            [IdDI.firstName]: { value: 'Belce', disabled: true },
            [IdDI.lastName]: { value: 'Dogru' },
            [IdDI.ssn4]: { value: '0000', disabled: true },
          },
        ),
      ).toEqual(false);
    });

    it('should return true if the user is missing any of the missing attributes', () => {
      expect(
        hasMissingAttributes(
          [
            CollectedKycDataOption.name,
            CollectedKycDataOption.ssn4,
            CollectedKycDataOption.fullAddress,
          ],
          {
            [IdDI.firstName]: { value: 'Belce', disabled: true },
            [IdDI.lastName]: { value: 'Dogru', disabled: true },
            [IdDI.ssn4]: { value: '0000' },
          },
        ),
      ).toEqual(true);
    });

    it('should skip attribute groups with all disabled/decrypted/bootstrapped data', () => {
      expect(
        hasMissingAttributes(
          [CollectedKycDataOption.name, CollectedKycDataOption.ssn4],
          {
            [IdDI.firstName]: { value: 'Belce', bootstrap: true },
            [IdDI.lastName]: { value: 'Dogru', disabled: true },
            [IdDI.ssn4]: { value: '0000', decrypted: true },
          },
        ),
      ).toEqual(false);

      expect(
        hasMissingAttributes(
          [CollectedKycDataOption.fullAddress, CollectedKycDataOption.ssn9],
          {
            [IdDI.addressLine1]: { value: '730 Hayes St', decrypted: true },
            [IdDI.city]: { value: 'San Francisco', decrypted: true },
            [IdDI.state]: { value: 'CA', decrypted: true },
            [IdDI.zip]: { value: '94117', decrypted: true },
            [IdDI.country]: { value: 'US', decrypted: true },
            [IdDI.ssn9]: { value: '000000000', bootstrap: true },
          },
        ),
      ).toEqual(false);

      expect(
        hasMissingAttributes(
          [CollectedKycDataOption.fullAddress, CollectedKycDataOption.ssn9],
          {
            [IdDI.zip]: { value: '94117', decrypted: true },
            [IdDI.ssn9]: { value: '000000000', bootstrap: true },
          },
        ),
      ).toEqual(true);
    });
  });
});
