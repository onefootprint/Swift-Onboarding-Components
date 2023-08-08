import { SupportedIdDocTypes } from '@onefootprint/types';

import getDocumentStatus from './get-document-status';
import {
  driversLicenseFailed,
  driversLicensePending,
  driversLicenseSuccess,
  idCardFail,
  idCardSuccess,
} from './get-document-status.test.config';

describe('getDocumentStatus', () => {
  it('should return success if there is a successful document', () => {
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
    ).toEqual('success');
  });

  it('should return fail if there is a successful document of another kind', () => {
    const documents = [driversLicenseFailed, idCardSuccess, idCardFail];
    expect(
      getDocumentStatus({
        documents,
        documentType: SupportedIdDocTypes.driversLicense,
      }),
    ).toEqual('error');
  });

  it('should return pending/warning if there is a failed document but no success for that type', () => {
    const documents = [
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

  it('should return undefined if there are no documents', () => {
    expect(
      getDocumentStatus({
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
