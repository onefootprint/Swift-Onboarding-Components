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

const defaultAttribute = {
  source: 'user',
  dataKind: DataKind.vaultData,
  transforms: {},
};

export const entityFixture: Entity = {
  id: 'fp_id_yCZehsWNeywHnk5JqL20u',
  isIdentifiable: true,
  kind: EntityKind.person,
  startTimestamp: '2024-04-29T18:37:37.903573Z',
  watchlistCheck: null,
  data: [
    {
      ...defaultAttribute,
      identifier: DocumentDI.latestDriversLicenseFront,
      isDecryptable: true,
      value: null,
      dataKind: DataKind.documentData,
      source: 'hosted',
    },
    {
      ...defaultAttribute,
      identifier: DocumentDI.driversLicenseExpiresAt,
      isDecryptable: true,
      value: null,
      source: 'ocr',
    },
    { ...defaultAttribute, identifier: IdDI.addressLine1, isDecryptable: true, value: null, source: 'hosted' },
    {
      ...defaultAttribute,
      identifier: DocumentDI.driversLicenseGender,
      isDecryptable: true,
      value: null,
      source: 'ocr',
    },
    {
      ...defaultAttribute,
      identifier: DocumentDI.driversLicenseIssuingCountry,
      isDecryptable: true,
      value: null,
      source: 'ocr',
    },
    {
      ...defaultAttribute,
      identifier: DocumentDI.latestDriversLicenseSelfie,
      isDecryptable: true,
      value: null,
      dataKind: DataKind.documentData,
      source: 'hosted',
    },
    { ...defaultAttribute, identifier: IdDI.phoneNumber, isDecryptable: true, value: null, source: 'hosted' },
    {
      ...defaultAttribute,
      identifier: DocumentDI.driversLicenseRefNumber,
      isDecryptable: true,
      value: null,
      source: 'ocr',
    },
    { ...defaultAttribute, identifier: IdDI.city, isDecryptable: true, value: null, source: 'hosted' },
    { ...defaultAttribute, identifier: IdDI.ssn9, isDecryptable: true, value: null, source: 'hosted' },
    { ...defaultAttribute, identifier: IdDI.firstName, isDecryptable: true, value: 'rafael', source: 'hosted' },
    { ...defaultAttribute, identifier: IdDI.ssn4, isDecryptable: true, value: null, source: 'hosted' },
    { ...defaultAttribute, identifier: DocumentDI.driversLicenseDOB, isDecryptable: true, value: null, source: 'ocr' },
    {
      ...defaultAttribute,
      identifier: DocumentDI.latestDriversLicenseBack,
      isDecryptable: true,
      value: null,
      dataKind: DataKind.documentData,
      source: 'hosted',
    },
    { ...defaultAttribute, identifier: IdDI.zip, isDecryptable: true, value: null, source: 'hosted' },
    {
      ...defaultAttribute,
      identifier: DocumentDI.driversLicenseFullAddress,
      isDecryptable: true,
      value: null,
      source: 'ocr',
    },
    { ...defaultAttribute, identifier: IdDI.dob, isDecryptable: true, value: null, source: 'hosted' },
    {
      ...defaultAttribute,
      identifier: DocumentDI.driversLicenseFullName,
      isDecryptable: true,
      value: null,
      source: 'ocr',
    },
    {
      ...defaultAttribute,
      identifier: DocumentDI.driversLicenseDocumentNumber,
      isDecryptable: true,
      value: null,
      source: 'ocr',
    },
    { ...defaultAttribute, identifier: IdDI.lastName, isDecryptable: true, value: null, source: 'hosted' },
    {
      ...defaultAttribute,
      identifier: DocumentDI.driversLicenseIssuingState,
      isDecryptable: true,
      value: null,
      source: 'ocr',
    },
    { ...defaultAttribute, identifier: IdDI.email, isDecryptable: true, value: null, source: 'hosted' },
    { ...defaultAttribute, identifier: IdDI.state, isDecryptable: true, value: null, source: 'hosted' },
    {
      ...defaultAttribute,
      identifier: DocumentDI.driversLicenseIssuingState,
      isDecryptable: true,
      value: null,
      dataKind: DataKind.documentData,
      source: 'hosted',
    },
    { ...defaultAttribute, identifier: IdDI.country, isDecryptable: true, value: null, source: 'hosted' },
    {
      ...defaultAttribute,
      identifier: DocumentDI.driversLicenseClassifiedDocumentType,
      isDecryptable: true,
      value: null,
      source: 'ocr',
    },
  ],
  status: EntityStatus.pass,
  requiresManualReview: false,
  workflows: [],
  hasOutstandingWorkflowRequest: false,
  lastActivityAt: '2024-04-29T18:39:42.669015Z',
  label: null,
  attributes: [],
  decryptedAttributes: {},
  decryptableAttributes: [],
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

export const withDocuments = (entity = entityFixture, response = documentsFixture) =>
  mockRequest({
    method: 'get',
    path: `/entities/${entity.id}/documents`,
    response,
  });
