import { mockRequest } from '@onefootprint/test-utils';
import type { Document, Entity } from '@onefootprint/types';
import {
  DataKind,
  DocumentDI,
  EntityKind,
  EntityStatus,
  IdDI,
  IdDocImageTypes,
  IdDocStatus,
  SupportedIdDocTypes,
  UploadSource,
} from '@onefootprint/types';

export const entityFixture: Entity = {
  id: 'fp_id_yCZehsWNeywHnk5JqL20u',
  isIdentifiable: true,
  kind: EntityKind.person,
  startTimestamp: '2024-04-29T18:37:37.903573Z',
  watchlistCheck: null,
  data: [
    {
      identifier: DocumentDI.latestDriversLicenseFront,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.documentData,
      value: null,
      transforms: {},
    },
    {
      identifier: DocumentDI.driversLicenseExpiresAt,
      source: 'ocr',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: IdDI.addressLine1,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: DocumentDI.driversLicenseGender,
      source: 'ocr',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: DocumentDI.driversLicenseIssuingCountry,
      source: 'ocr',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: DocumentDI.latestDriversLicenseSelfie,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.documentData,
      value: null,
      transforms: {},
    },
    {
      identifier: IdDI.phoneNumber,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: DocumentDI.driversLicenseRefNumber,
      source: 'ocr',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: IdDI.city,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: IdDI.ssn9,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: IdDI.firstName,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: 'rafael',
      transforms: {},
    },
    {
      identifier: IdDI.ssn4,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: DocumentDI.driversLicenseDOB,
      source: 'ocr',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: DocumentDI.latestDriversLicenseBack,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.documentData,
      value: null,
      transforms: {},
    },
    {
      identifier: IdDI.zip,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: DocumentDI.driversLicenseFullAddress,
      source: 'ocr',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: IdDI.dob,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: DocumentDI.driversLicenseFullName,
      source: 'ocr',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: DocumentDI.driversLicenseDocumentNumber,
      source: 'ocr',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: IdDI.lastName,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: DocumentDI.driversLicenseIssuingState,
      source: 'ocr',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: IdDI.email,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: IdDI.state,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: DocumentDI.driversLicenseIssuingState,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.documentData,
      value: null,
      transforms: {},
    },
    {
      identifier: DocumentDI.driversLicenseIssuingState,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.documentData,
      value: null,
      transforms: {},
    },
    {
      identifier: DocumentDI.driversLicenseIssuingState,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.documentData,
      value: null,
      transforms: {},
    },
    {
      identifier: IdDI.country,
      source: 'hosted',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
    {
      identifier: DocumentDI.driversLicenseClassifiedDocumentType,
      source: 'ocr',
      isDecryptable: true,
      dataKind: DataKind.vaultData,
      value: null,
      transforms: {},
    },
  ],
  status: EntityStatus.pass,
  requiresManualReview: false,
  workflows: [],
  hasOutstandingWorkflowRequest: false,
  lastActivityAt: '2024-04-29T18:39:42.669015Z',
  label: null,
  attributes: [
    IdDI.addressLine1,
    IdDI.city,
    IdDI.country,
    IdDI.dob,
    IdDI.email,
    IdDI.firstName,
    IdDI.lastName,
    IdDI.phoneNumber,
    IdDI.ssn4,
    IdDI.ssn9,
    IdDI.state,
    IdDI.zip,
    DocumentDI.latestDriversLicenseFront,
    DocumentDI.driversLicenseExpiresAt,
    DocumentDI.driversLicenseGender,
    DocumentDI.driversLicenseIssuingCountry,
    DocumentDI.latestDriversLicenseSelfie,
    DocumentDI.driversLicenseRefNumber,
    DocumentDI.driversLicenseDOB,
    DocumentDI.latestDriversLicenseBack,
    DocumentDI.driversLicenseFullAddress,
    DocumentDI.driversLicenseFullName,
    DocumentDI.driversLicenseDocumentNumber,
    DocumentDI.driversLicenseIssuingState,
    DocumentDI.driversLicenseIssuingState,
    DocumentDI.driversLicenseIssuingState,
    DocumentDI.driversLicenseIssuingState,
    DocumentDI.driversLicenseClassifiedDocumentType,
  ],
  decryptedAttributes: {},
  decryptableAttributes: [
    IdDI.addressLine1,
    IdDI.city,
    IdDI.country,
    IdDI.dob,
    IdDI.email,
    IdDI.firstName,
    IdDI.lastName,
    IdDI.phoneNumber,
    IdDI.ssn4,
    IdDI.ssn9,
    IdDI.state,
    IdDI.zip,
    DocumentDI.latestDriversLicenseFront,
    DocumentDI.driversLicenseExpiresAt,
    DocumentDI.driversLicenseGender,
    DocumentDI.driversLicenseIssuingCountry,
    DocumentDI.latestDriversLicenseSelfie,
    DocumentDI.driversLicenseRefNumber,
    DocumentDI.driversLicenseDOB,
    DocumentDI.latestDriversLicenseBack,
    DocumentDI.driversLicenseFullAddress,
    DocumentDI.driversLicenseFullName,
    DocumentDI.driversLicenseDocumentNumber,
    DocumentDI.driversLicenseIssuingState,
    DocumentDI.driversLicenseIssuingState,
    DocumentDI.driversLicenseIssuingState,
    DocumentDI.driversLicenseIssuingState,
    DocumentDI.driversLicenseClassifiedDocumentType,
  ],
};

export const documentsFixture: Document[] = [
  {
    kind: SupportedIdDocTypes.driversLicense,
    startedAt: '2024-04-30T19:56:43.368966Z',
    status: IdDocStatus.complete,
    completedVersion: 15271928,
    uploads: [
      {
        timestamp: '2024-04-30T19:57:01.565634Z',
        side: IdDocImageTypes.front,
        failureReasons: [],
        version: 15271906,
        isExtraCompressed: false,
        identifier: DocumentDI.latestDriversLicenseFront,
      },
      {
        timestamp: '2024-04-30T19:57:11.681977Z',
        side: IdDocImageTypes.back,
        failureReasons: [],
        version: 15271914,
        isExtraCompressed: false,
        identifier: DocumentDI.latestDriversLicenseBack,
      },
      {
        timestamp: '2024-04-30T19:57:21.226280Z',
        side: IdDocImageTypes.selfie,
        failureReasons: [],
        version: 15271924,
        isExtraCompressed: false,
        identifier: DocumentDI.latestDriversLicenseSelfie,
      },
    ],
    documentScore: 100.0,
    selfieScore: 100.0,
    ocrConfidenceScore: 99.0,
    uploadSource: UploadSource.Desktop,
  },
  {
    kind: SupportedIdDocTypes.driversLicense,
    startedAt: '2024-04-29T18:38:42.202788Z',
    status: IdDocStatus.complete,
    completedVersion: 15187172,
    uploads: [
      {
        timestamp: '2024-04-29T18:38:55.713656Z',
        side: IdDocImageTypes.front,
        failureReasons: [],
        version: 15187121,
        isExtraCompressed: false,
        identifier: DocumentDI.latestDriversLicenseFront,
      },
      {
        timestamp: '2024-04-29T18:39:32.050157Z',
        side: IdDocImageTypes.selfie,
        failureReasons: [],
        version: 15187168,
        isExtraCompressed: false,
        identifier: DocumentDI.latestDriversLicenseSelfie,
      },
      {
        timestamp: '2024-04-29T18:39:05.987436Z',
        side: IdDocImageTypes.back,
        failureReasons: [],
        version: 15187130,
        isExtraCompressed: false,
        identifier: DocumentDI.latestDriversLicenseBack,
      },
    ],
    documentScore: 100.0,
    selfieScore: 100.0,
    ocrConfidenceScore: 99.0,
    uploadSource: UploadSource.Desktop,
  },
];

export const withDocuments = (
  entity = entityFixture,
  response = documentsFixture,
) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/documents`,
    response,
  });
