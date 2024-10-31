import { AccessEventKind, IdDI } from '@onefootprint/types';

export const oneFieldFixture = {
  kind: AccessEventKind.DecryptUserData,
  data: {
    decryptedFields: [IdDI.firstName],
    fpId: '123',
    reason: 'Testing',
  },
};

export const twoFieldsFixture = {
  kind: AccessEventKind.DecryptUserData,
  data: {
    decryptedFields: [IdDI.firstName, IdDI.lastName],
    fpId: '123',
    reason: 'Testing',
  },
};

export const threeFieldsFixture = {
  kind: AccessEventKind.DecryptUserData,
  data: {
    decryptedFields: [IdDI.firstName, IdDI.lastName, IdDI.dob],
    fpId: '123',
    reason: 'Testing',
  },
};

export const fourFieldsFixture = {
  kind: AccessEventKind.DecryptUserData,
  data: {
    decryptedFields: [IdDI.firstName, IdDI.lastName, IdDI.dob, IdDI.email],
    fpId: '123',
    reason: 'Testing',
  },
};

export const fiveFieldsFixture = {
  kind: AccessEventKind.DecryptUserData,
  data: {
    decryptedFields: [IdDI.firstName, IdDI.lastName, IdDI.dob, IdDI.email, IdDI.phoneNumber],
    fpId: '123',
    reason: 'Testing',
  },
};

export const sixteenFieldsFixture = {
  kind: AccessEventKind.DecryptUserData,
  data: {
    decryptedFields: [
      IdDI.firstName,
      IdDI.lastName,
      IdDI.dob,
      IdDI.email,
      IdDI.phoneNumber,
      IdDI.nationality,
      IdDI.country,
      IdDI.nationality,
      IdDI.ssn4,
      IdDI.citizenships,
      IdDI.usTaxId,
      IdDI.addressLine1,
      IdDI.usLegalStatus,
      IdDI.visaExpirationDate,
      IdDI.visaKind,
      IdDI.zip,
    ],
    fpId: '123',
    reason: 'Testing',
  },
};
