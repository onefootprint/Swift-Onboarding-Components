import { SupportedIdDocTypes } from '@onefootprint/types';

import getDocumentStatus from './get-document-status';
import {
  driversLicenseFailed,
  driversLicensePending,
  driversLicenseSuccess,
  driversLicenseViaApi,
  idCardFail,
  idCardSuccess,
} from './get-document-status.test.config';

describe('getDocumentStatus', () => {
  it('should return pending if pending is the most recent', () => {
    const documents = [
      driversLicenseSuccess,
      driversLicenseFailed,
      driversLicensePending,
      idCardSuccess,
      idCardFail,
    ];
    expect(
      getDocumentStatus({
        documents,
        documentType: SupportedIdDocTypes.driversLicense,
      }),
    ).toEqual('warning');
  });

  it('should ignore document of another kind', () => {
    const documents = [driversLicenseFailed, idCardSuccess, idCardFail];
    expect(
      getDocumentStatus({
        documents,
        documentType: SupportedIdDocTypes.driversLicense,
      }),
    ).toEqual('error');
  });

  it('should return undefined if there are no documents', () => {
    expect(
      getDocumentStatus({
        documentType: SupportedIdDocTypes.driversLicense,
      }),
    ).toEqual(undefined);
  });

  it('should return undefined if all documents have undefined status', () => {
    expect(
      getDocumentStatus({
        documents: [driversLicenseViaApi],
        documentType: SupportedIdDocTypes.driversLicense,
      }),
    ).toEqual(undefined);
  });

  it('should return undefined if is no document type', () => {
    const documents = [
      driversLicenseFailed,
      driversLicensePending,
      idCardSuccess,
      idCardFail,
    ];
    expect(
      getDocumentStatus({
        documents,
      }),
    ).toEqual(undefined);
  });
});
