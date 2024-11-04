import { customRender, screen } from '@onefootprint/test-utils';
import { SupportedIdDocTypes } from '@onefootprint/types';

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

    const nameLabel = screen.getByText('Full name');
    expect(nameLabel).toBeInTheDocument();
    const name = screen.getByText('test drivers license full name');
    expect(name).toBeInTheDocument();

    const dobLabel = screen.getByText('Date of birth');
    expect(dobLabel).toBeInTheDocument();
    const dob = screen.getByText('test drivers license DOB');
    expect(dob).toBeInTheDocument();

    const genderLabel = screen.getByText('Gender');
    expect(genderLabel).toBeInTheDocument();
    const gender = screen.getByText('test drivers license gender');
    expect(gender).toBeInTheDocument();

    const addressLabel = screen.getByText('Address');
    expect(addressLabel).toBeInTheDocument();
    const address = screen.getByText('test drivers license full address');
    expect(address).toBeInTheDocument();

    const documentNumberLabel = screen.getByText('Document number');
    expect(documentNumberLabel).toBeInTheDocument();
    const documentNumber = screen.getByText('test drivers license document number');
    expect(documentNumber).toBeInTheDocument();

    const issuedAtLabel = screen.getByText('Issued at');
    expect(issuedAtLabel).toBeInTheDocument();
    const issuedAt = screen.getByText('test drivers license issued at');
    expect(issuedAt).toBeInTheDocument();

    const expiresAtLabel = screen.getByText('Expires at');
    expect(expiresAtLabel).toBeInTheDocument();
    expect(screen.getByText('test drivers license expires at')).toBeInTheDocument();

    const issuingStateLabel = screen.getByText('Issuing state');
    expect(issuingStateLabel).toBeInTheDocument();
    const issuingState = screen.getByText('test drivers license issuing state');
    expect(issuingState).toBeInTheDocument();

    const issuingCountryLabel = screen.getByText('Issuing country');
    expect(issuingCountryLabel).toBeInTheDocument();
    const issuingCountry = screen.getByText('test drivers license issuing country');
    expect(issuingCountry).toBeInTheDocument();

    const refNumberLabel = screen.getByText('Ref number');
    expect(refNumberLabel).toBeInTheDocument();
    const refNumber = screen.getByText('test drivers license ref number');
    expect(refNumber).toBeInTheDocument();

    const docFrontSrc = 'test drivers license front';
    expect(screen.queryByText(docFrontSrc)).not.toBeInTheDocument();
    const docBackSrc = 'test drivers license back';
    expect(screen.queryByText(docBackSrc)).not.toBeInTheDocument();
    const selfieSrc = 'test drivers license selfie';
    expect(screen.queryByText(selfieSrc)).not.toBeInTheDocument();

    const idCardText = 'id card';
    expect(screen.queryByText(idCardText)).not.toBeInTheDocument();
    const passportText = 'passport';
    expect(screen.queryByText(passportText)).not.toBeInTheDocument();
  });

  it('should display all attributes for id card correctly and not show drivers license or passport attributes', () => {
    renderExtractedDocumentData({
      vault: entityVaultWithAllDocumentDIs,
      documentType: SupportedIdDocTypes.idCard,
      activeDocumentVersion: '123',
    });

    const nameLabel = screen.getByText('Full name');
    expect(nameLabel).toBeInTheDocument();
    const name = screen.getByText('test ID full name');
    expect(name).toBeInTheDocument();

    const dobLabel = screen.getByText('Date of birth');
    expect(dobLabel).toBeInTheDocument();
    const dob = screen.getByText('test ID DOB');
    expect(dob).toBeInTheDocument();

    const genderLabel = screen.getByText('Gender');
    expect(genderLabel).toBeInTheDocument();
    const gender = screen.getByText('test id card gender');
    expect(gender).toBeInTheDocument();

    const addressLabel = screen.getByText('Address');
    expect(addressLabel).toBeInTheDocument();
    const address = screen.getByText('test id card full address');
    expect(address).toBeInTheDocument();

    const documentNumberLabel = screen.getByText('Document number');
    expect(documentNumberLabel).toBeInTheDocument();
    const documentNumber = screen.getByText('test id card document number');
    expect(documentNumber).toBeInTheDocument();

    const issuedAtLabel = screen.getByText('Issued at');
    expect(issuedAtLabel).toBeInTheDocument();
    const issuedAt = screen.getByText('test id card issued at');
    expect(issuedAt).toBeInTheDocument();

    const expiresAtLabel = screen.getByText('Expires at');
    expect(expiresAtLabel).toBeInTheDocument();
    const expiresAt = screen.getByText('test id card expires at');
    expect(expiresAt).toBeInTheDocument();

    const issuingStateLabel = screen.getByText('Issuing state');
    expect(issuingStateLabel).toBeInTheDocument();
    const issuingState = screen.getByText('test id card issuing state');
    expect(issuingState).toBeInTheDocument();

    const issuingCountryLabel = screen.getByText('Issuing country');
    expect(issuingCountryLabel).toBeInTheDocument();
    const issuingCountry = screen.getByText('test id card issuing country');
    expect(issuingCountry).toBeInTheDocument();

    const refNumberLabel = screen.getByText('Ref number');
    expect(refNumberLabel).toBeInTheDocument();
    const refNumber = screen.getByText('test id card ref number');
    expect(refNumber).toBeInTheDocument();

    const docFrontSrc = 'test ID URL';
    expect(screen.queryByText(docFrontSrc)).not.toBeInTheDocument();
    const licenseText = 'drivers license';
    expect(screen.queryByText(licenseText)).not.toBeInTheDocument();
    const passportText = 'passport';
    expect(screen.queryByText(passportText)).not.toBeInTheDocument();
  });

  it('should display all attributes for passport correctly and not show drivers license or id card attributes', () => {
    renderExtractedDocumentData({
      vault: entityVaultWithAllDocumentDIs,
      documentType: SupportedIdDocTypes.passport,
      activeDocumentVersion: '679',
    });

    const nameLabel = screen.getByText('Full name');
    expect(nameLabel).toBeInTheDocument();
    const name = screen.getByText('test passport full name');
    expect(name).toBeInTheDocument();

    const dobLabel = screen.getByText('Date of birth');
    expect(dobLabel).toBeInTheDocument();
    const dob = screen.getByText('test passport DOB');
    expect(dob).toBeInTheDocument();

    const genderLabel = screen.getByText('Gender');
    expect(genderLabel).toBeInTheDocument();
    const gender = screen.getByText('test passport gender');
    expect(gender).toBeInTheDocument();

    const addressLabel = screen.getByText('Address');
    expect(addressLabel).toBeInTheDocument();
    const address = screen.getByText('test passport full address');
    expect(address).toBeInTheDocument();

    const documentNumberLabel = screen.getByText('Document number');
    expect(documentNumberLabel).toBeInTheDocument();
    const documentNumber = screen.getByText('test passport document number');
    expect(documentNumber).toBeInTheDocument();

    const issuedAtLabel = screen.getByText('Issued at');
    expect(issuedAtLabel).toBeInTheDocument();
    const issuedAt = screen.getByText('test passport issued at');
    expect(issuedAt).toBeInTheDocument();

    const expiresAtLabel = screen.getByText('Expires at');
    expect(expiresAtLabel).toBeInTheDocument();
    const expiresAt = screen.getByText('test passport expires at');
    expect(expiresAt).toBeInTheDocument();

    const issuingStateLabel = screen.getByText('Issuing state');
    expect(issuingStateLabel).toBeInTheDocument();
    const issuingState = screen.getByText('test passport issuing state');
    expect(issuingState).toBeInTheDocument();

    const issuingCountryLabel = screen.getByText('Issuing country');
    expect(issuingCountryLabel).toBeInTheDocument();
    const issuingCountry = screen.getByText('test passport issuing country');
    expect(issuingCountry).toBeInTheDocument();

    const refNumberLabel = screen.getByText('Ref number');
    expect(refNumberLabel).toBeInTheDocument();
    const refNumber = screen.getByText('test passport ref number');
    expect(refNumber).toBeInTheDocument();

    const docSrc = 'test passport URL';
    expect(screen.queryByText(docSrc)).not.toBeInTheDocument();
    const licenseText = 'drivers license';
    expect(screen.queryByText(licenseText)).not.toBeInTheDocument();
    const passportText = 'passport';
    expect(screen.queryByText(passportText)).not.toBeInTheDocument();
  });

  it('should only display subset of attributes when subset of attributes are provided', () => {
    renderExtractedDocumentData({
      vault: driversLicensePartialDIs,
      documentType: SupportedIdDocTypes.driversLicense,
      activeDocumentVersion: '456',
    });

    const nameLabel = screen.getByText('Full name');
    expect(nameLabel).toBeInTheDocument();
    const name = screen.getByText('test drivers license full name');
    expect(name).toBeInTheDocument();

    const dobLabel = screen.getByText('Date of birth');
    expect(dobLabel).toBeInTheDocument();
    const dob = screen.getByText('test drivers license DOB');
    expect(dob).toBeInTheDocument();

    const genderLabel = screen.getByText('Gender');
    expect(genderLabel).toBeInTheDocument();
    const gender = screen.getByText('test drivers license gender');
    expect(gender).toBeInTheDocument();

    // all of these are not in this particular DI
    // we should not see them even though they are drivers license DIs
    const addressLabel = screen.queryByText('Address');
    expect(addressLabel).not.toBeInTheDocument();
    const address = screen.queryByText('test drivers license full address');
    expect(address).not.toBeInTheDocument();

    const documentNumberLabel = screen.queryByText('Document number');
    expect(documentNumberLabel).not.toBeInTheDocument();
    const documentNumber = screen.queryByText('test drivers license document number');
    expect(documentNumber).not.toBeInTheDocument();

    const issuedAtLabel = screen.queryByText('Issued at');
    expect(issuedAtLabel).not.toBeInTheDocument();
    const issuedAt = screen.queryByText('test drivers license issued at');
    expect(issuedAt).not.toBeInTheDocument();

    const expiresAtLabel = screen.queryByText('Expires at');
    expect(expiresAtLabel).not.toBeInTheDocument();
    const expiresAt = screen.queryByText('test drivers license expires at');
    expect(expiresAt).not.toBeInTheDocument();

    const issuingStateLabel = screen.queryByText('Issuing state');
    expect(issuingStateLabel).not.toBeInTheDocument();
    const issuingState = screen.queryByText('test drivers license issuing state');
    expect(issuingState).not.toBeInTheDocument();

    const issuingCountryLabel = screen.queryByText('Issuing country');
    expect(issuingCountryLabel).not.toBeInTheDocument();
    const issuingCountry = screen.queryByText('test drivers license issuing country');
    expect(issuingCountry).not.toBeInTheDocument();

    const refNumberLabel = screen.queryByText('Ref number');
    expect(refNumberLabel).not.toBeInTheDocument();
    const refNumber = screen.queryByText('test drivers license ref number');
    expect(refNumber).not.toBeInTheDocument();

    const docFrontSrc = screen.queryByText('test drivers license front');
    expect(docFrontSrc).not.toBeInTheDocument();
    const docBackSrc = 'test drivers license back';
    expect(screen.queryByText(docBackSrc)).not.toBeInTheDocument();
    const selfieSrc = 'test drivers license selfie';
    expect(screen.queryByText(selfieSrc)).not.toBeInTheDocument();

    const idCardText = 'id card';
    expect(screen.queryByText(idCardText)).not.toBeInTheDocument();
    const passportText = 'passport';
    expect(screen.queryByText(passportText)).not.toBeInTheDocument();
  });
});
