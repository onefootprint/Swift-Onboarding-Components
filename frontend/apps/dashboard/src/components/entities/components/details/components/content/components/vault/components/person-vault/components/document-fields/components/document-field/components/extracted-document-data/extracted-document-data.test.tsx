import { customRender, screen } from '@onefootprint/test-utils';
import { SupportedIdDocTypes } from '@onefootprint/types';
import React from 'react';

import type { ExtractedDocumentDataProps } from './extracted-document-data';
import ExtractedDocumentData from './extracted-document-data';
import { driversLicensePartialDIs, entityVaultWithAllDocumentDIs } from './extracted-document-data.test.config';

const renderExtractedDocumentData = ({ vault, documentType, activeDocumentVersion }: ExtractedDocumentDataProps) =>
  customRender(
    <ExtractedDocumentData vault={vault} documentType={documentType} activeDocumentVersion={activeDocumentVersion} />,
  );

describe('<ExtractedDocumentData />', () => {
  it('should display all attributes for drivers license correctly and not show id card or passport attributes', () => {
    renderExtractedDocumentData({
      vault: entityVaultWithAllDocumentDIs,
      documentType: SupportedIdDocTypes.driversLicense,
      activeDocumentVersion: '456',
    });
    expect(screen.getByText('Full name')).toBeInTheDocument();
    expect(screen.getByText('test drivers license full name')).toBeInTheDocument();

    expect(screen.getByText('Date of birth')).toBeInTheDocument();
    expect(screen.getByText('test drivers license DOB')).toBeInTheDocument();

    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getByText('test drivers license gender')).toBeInTheDocument();

    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('test drivers license full address')).toBeInTheDocument();

    expect(screen.getByText('Document number')).toBeInTheDocument();
    expect(screen.getByText('test drivers license document number')).toBeInTheDocument();

    expect(screen.getByText('Issued at')).toBeInTheDocument();
    expect(screen.getByText('test drivers license issued at')).toBeInTheDocument();

    expect(screen.getByText('Expires at')).toBeInTheDocument();
    expect(screen.getByText('test drivers license expires at')).toBeInTheDocument();

    expect(screen.getByText('Issuing state')).toBeInTheDocument();
    expect(screen.getByText('test drivers license issuing state')).toBeInTheDocument();

    expect(screen.getByText('Issuing country')).toBeInTheDocument();
    expect(screen.getByText('test drivers license issuing country')).toBeInTheDocument();

    expect(screen.getByText('Ref number')).toBeInTheDocument();
    expect(screen.getByText('test drivers license ref number')).toBeInTheDocument();

    expect(screen.queryByText('test drivers license front')).not.toBeInTheDocument();
    expect(screen.queryByText('test drivers license back')).not.toBeInTheDocument();
    expect(screen.queryByText('test drivers license selfie')).not.toBeInTheDocument();

    expect(screen.queryByText('id card')).not.toBeInTheDocument();
    expect(screen.queryByText('passport')).not.toBeInTheDocument();
  });

  it('should display all attributes for id card correctly and not show drivers license or passport attributes', () => {
    renderExtractedDocumentData({
      vault: entityVaultWithAllDocumentDIs,
      documentType: SupportedIdDocTypes.idCard,
      activeDocumentVersion: '123',
    });
    expect(screen.getByText('Full name')).toBeInTheDocument();
    expect(screen.getByText('test ID full name')).toBeInTheDocument();

    expect(screen.getByText('Date of birth')).toBeInTheDocument();
    expect(screen.getByText('test ID DOB')).toBeInTheDocument();

    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getByText('test id card gender')).toBeInTheDocument();

    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('test id card full address')).toBeInTheDocument();

    expect(screen.getByText('Document number')).toBeInTheDocument();
    expect(screen.getByText('test id card document number')).toBeInTheDocument();

    expect(screen.getByText('Issued at')).toBeInTheDocument();
    expect(screen.getByText('test id card issued at')).toBeInTheDocument();

    expect(screen.getByText('Expires at')).toBeInTheDocument();
    expect(screen.getByText('test id card expires at')).toBeInTheDocument();

    expect(screen.getByText('Issuing state')).toBeInTheDocument();
    expect(screen.getByText('test id card issuing state')).toBeInTheDocument();

    expect(screen.getByText('Issuing country')).toBeInTheDocument();
    expect(screen.getByText('test id card issuing country')).toBeInTheDocument();

    expect(screen.getByText('Ref number')).toBeInTheDocument();
    expect(screen.getByText('test id card ref number')).toBeInTheDocument();

    expect(screen.queryByText('test ID URL')).not.toBeInTheDocument();
    expect(screen.queryByText('drivers license')).not.toBeInTheDocument();
    expect(screen.queryByText('passport')).not.toBeInTheDocument();
  });

  it('should display all attributes for passport correctly and not show drivers license or id card attributes', () => {
    renderExtractedDocumentData({
      vault: entityVaultWithAllDocumentDIs,
      documentType: SupportedIdDocTypes.passport,
      activeDocumentVersion: '679',
    });
    expect(screen.getByText('Full name')).toBeInTheDocument();
    expect(screen.getByText('test passport full name')).toBeInTheDocument();

    expect(screen.getByText('Date of birth')).toBeInTheDocument();
    expect(screen.getByText('test passport DOB')).toBeInTheDocument();

    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getByText('test passport gender')).toBeInTheDocument();

    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('test passport full address')).toBeInTheDocument();

    expect(screen.getByText('Document number')).toBeInTheDocument();
    expect(screen.getByText('test passport document number')).toBeInTheDocument();

    expect(screen.getByText('Issued at')).toBeInTheDocument();
    expect(screen.getByText('test passport issued at')).toBeInTheDocument();

    expect(screen.getByText('Expires at')).toBeInTheDocument();
    expect(screen.getByText('test passport expires at')).toBeInTheDocument();

    expect(screen.getByText('Issuing state')).toBeInTheDocument();
    expect(screen.getByText('test passport issuing state')).toBeInTheDocument();

    expect(screen.getByText('Issuing country')).toBeInTheDocument();
    expect(screen.getByText('test passport issuing country')).toBeInTheDocument();

    expect(screen.getByText('Ref number')).toBeInTheDocument();
    expect(screen.getByText('test passport ref number')).toBeInTheDocument();

    expect(screen.queryByText('test passport URL')).not.toBeInTheDocument();
    expect(screen.queryByText('drivers license')).not.toBeInTheDocument();
    expect(screen.queryByText('passport')).not.toBeInTheDocument();
  });

  it('should only display subset of attributes when subset of attributes are provided', () => {
    renderExtractedDocumentData({
      vault: driversLicensePartialDIs,
      documentType: SupportedIdDocTypes.driversLicense,
      activeDocumentVersion: '456',
    });
    expect(screen.getByText('Full name')).toBeInTheDocument();
    expect(screen.getByText('test drivers license full name')).toBeInTheDocument();

    expect(screen.getByText('Date of birth')).toBeInTheDocument();
    expect(screen.getByText('test drivers license DOB')).toBeInTheDocument();

    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getByText('test drivers license gender')).toBeInTheDocument();

    // all of these are not in this particular DI
    // we should not see them even though they are drivers license DIs
    expect(screen.queryByText('Address')).not.toBeInTheDocument();
    expect(screen.queryByText('test drivers license full address')).not.toBeInTheDocument();

    expect(screen.queryByText('Document number')).not.toBeInTheDocument();
    expect(screen.queryByText('test drivers license document number')).not.toBeInTheDocument();

    expect(screen.queryByText('Issued at')).not.toBeInTheDocument();
    expect(screen.queryByText('test drivers license issued at')).not.toBeInTheDocument();

    expect(screen.queryByText('Expires at')).not.toBeInTheDocument();
    expect(screen.queryByText('test drivers license expires at')).not.toBeInTheDocument();

    expect(screen.queryByText('Issuing state')).not.toBeInTheDocument();
    expect(screen.queryByText('test drivers license issuing state')).not.toBeInTheDocument();

    expect(screen.queryByText('Issuing country')).not.toBeInTheDocument();
    expect(screen.queryByText('test drivers license issuing country')).not.toBeInTheDocument();

    expect(screen.queryByText('Ref number')).not.toBeInTheDocument();
    expect(screen.queryByText('test drivers license ref number')).not.toBeInTheDocument();

    expect(screen.queryByText('test drivers license front')).not.toBeInTheDocument();
    expect(screen.queryByText('test drivers license back')).not.toBeInTheDocument();
    expect(screen.queryByText('test drivers license selfie')).not.toBeInTheDocument();

    expect(screen.queryByText('id card')).not.toBeInTheDocument();
    expect(screen.queryByText('passport')).not.toBeInTheDocument();
  });
});
