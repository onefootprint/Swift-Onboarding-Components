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
    const name = screen.getByText('Test Drivers License Full Name');
    expect(name).toBeInTheDocument();

    const dobLabel = screen.getByText('Date of birth');
    expect(dobLabel).toBeInTheDocument();
    const dob = screen.getByText('06/15/1992');
    expect(dob).toBeInTheDocument();

    const genderLabel = screen.getByText('Gender');
    expect(genderLabel).toBeInTheDocument();
    const gender = screen.getByText('Test Drivers License Gender');
    expect(gender).toBeInTheDocument();

    const addressLabel = screen.getByText('Address');
    expect(addressLabel).toBeInTheDocument();
    const address = screen.getByText('Test Drivers License Full Address');
    expect(address).toBeInTheDocument();

    const documentNumberLabel = screen.getByText('Document number');
    expect(documentNumberLabel).toBeInTheDocument();
    const documentNumber = screen.getByText('test drivers license document number');
    expect(documentNumber).toBeInTheDocument();

    const issuedAt = screen.getByText('01/15/2021');
    expect(issuedAt).toBeInTheDocument();

    const expiresAtLabel = screen.getByText('Expires at');
    expect(expiresAtLabel).toBeInTheDocument();
    expect(screen.getByText('01/15/2026')).toBeInTheDocument();

    const issuingStateLabel = screen.getByText('Issuing state');
    expect(issuingStateLabel).toBeInTheDocument();
    const issuingState = screen.getByText('Test Drivers License Issuing State');
    expect(issuingState).toBeInTheDocument();

    const issuingCountryLabel = screen.getByText('Issuing country');
    expect(issuingCountryLabel).toBeInTheDocument();
    const issuingCountry = screen.getByText('Test Drivers License Issuing Country');
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
    const name = screen.getByText('Test ID Full Name');
    expect(name).toBeInTheDocument();

    const dobLabel = screen.getByText('Date of birth');
    expect(dobLabel).toBeInTheDocument();
    const dob = screen.getByText('04/15/1990');
    expect(dob).toBeInTheDocument();

    const genderLabel = screen.getByText('Gender');
    expect(genderLabel).toBeInTheDocument();
    const gender = screen.getByText('Test ID Card Gender');
    expect(gender).toBeInTheDocument();

    const addressLabel = screen.getByText('Address');
    expect(addressLabel).toBeInTheDocument();
    const address = screen.getByText('Test ID Card Full Address');
    expect(address).toBeInTheDocument();

    const documentNumberLabel = screen.getByText('Document number');
    expect(documentNumberLabel).toBeInTheDocument();
    const documentNumber = screen.getByText('test id card document number');
    expect(documentNumber).toBeInTheDocument();

    const issuedAt = screen.getByText('04/23/2020');
    expect(issuedAt).toBeInTheDocument();

    const expiresAtLabel = screen.getByText('Expires at');
    expect(expiresAtLabel).toBeInTheDocument();
    const expiresAt = screen.getByText('12/31/2025');
    expect(expiresAt).toBeInTheDocument();

    const issuingStateLabel = screen.getByText('Issuing state');
    expect(issuingStateLabel).toBeInTheDocument();
    const issuingState = screen.getByText('Test ID Card Issuing State');
    expect(issuingState).toBeInTheDocument();

    const issuingCountryLabel = screen.getByText('Issuing country');
    expect(issuingCountryLabel).toBeInTheDocument();
    const issuingCountry = screen.getByText('Test ID Card Issuing Country');
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
    const name = screen.getByText('Test Passport Full Name');
    expect(name).toBeInTheDocument();

    const dobLabel = screen.getByText('Date of birth');
    expect(dobLabel).toBeInTheDocument();
    const dob = screen.getByText('03/03/1988');
    expect(dob).toBeInTheDocument();

    const genderLabel = screen.getByText('Gender');
    expect(genderLabel).toBeInTheDocument();
    const gender = screen.getByText('Test Passport Gender');
    expect(gender).toBeInTheDocument();

    const addressLabel = screen.getByText('Address');
    expect(addressLabel).toBeInTheDocument();
    const address = screen.getByText('Test Passport Full Address');
    expect(address).toBeInTheDocument();

    const documentNumberLabel = screen.getByText('Document number');
    expect(documentNumberLabel).toBeInTheDocument();
    const documentNumber = screen.getByText('test passport document number');
    expect(documentNumber).toBeInTheDocument();

    const issuedAtLabel = screen.getByText('Issued at');
    expect(issuedAtLabel).toBeInTheDocument();
    const issuedAt = screen.getByText('08/20/2019');
    expect(issuedAt).toBeInTheDocument();

    const expiresAtLabel = screen.getByText('Expires at');
    expect(expiresAtLabel).toBeInTheDocument();
    const expiresAt = screen.getByText('08/20/2029');
    expect(expiresAt).toBeInTheDocument();

    const issuingStateLabel = screen.getByText('Issuing state');
    expect(issuingStateLabel).toBeInTheDocument();
    const issuingState = screen.getByText('Test Passport Issuing State');
    expect(issuingState).toBeInTheDocument();

    const issuingCountryLabel = screen.getByText('Issuing country');
    expect(issuingCountryLabel).toBeInTheDocument();
    const issuingCountry = screen.getByText('Test Passport Issuing Country');
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
    const name = screen.getByText('Test Drivers License Full Name');
    expect(name).toBeInTheDocument();

    const dobLabel = screen.getByText('Date of birth');
    expect(dobLabel).toBeInTheDocument();
    const dob = screen.getByText('04/15/1990');
    expect(dob).toBeInTheDocument();

    const genderLabel = screen.getByText('Gender');
    expect(genderLabel).toBeInTheDocument();
    const gender = screen.getByText('Test Drivers License Gender');
    expect(gender).toBeInTheDocument();

    // all of these are not in this particular DI
    // we should not see them even though they are drivers license DIs
    const addressLabel = screen.queryByText('Address');
    expect(addressLabel).not.toBeInTheDocument();
    const address = screen.queryByText('Test Drivers License Full Address');
    expect(address).not.toBeInTheDocument();

    const documentNumberLabel = screen.queryByText('Document number');
    expect(documentNumberLabel).not.toBeInTheDocument();
    const documentNumber = screen.queryByText('test drivers license document number');
    expect(documentNumber).not.toBeInTheDocument();

    const issuedAtLabel = screen.queryByText('Issued at');
    expect(issuedAtLabel).not.toBeInTheDocument();
    const issuedAt = screen.queryByText('01/15/2021');
    expect(issuedAt).not.toBeInTheDocument();

    const expiresAtLabel = screen.queryByText('Expires at');
    expect(expiresAtLabel).not.toBeInTheDocument();
    const expiresAt = screen.queryByText('01/15/2026');
    expect(expiresAt).not.toBeInTheDocument();

    const issuingStateLabel = screen.queryByText('Issuing state');
    expect(issuingStateLabel).not.toBeInTheDocument();
    const issuingState = screen.queryByText('Test Drivers License Issuing State');
    expect(issuingState).not.toBeInTheDocument();

    const issuingCountryLabel = screen.queryByText('Issuing country');
    expect(issuingCountryLabel).not.toBeInTheDocument();
    const issuingCountry = screen.queryByText('Test Drivers License Issuing Country');
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
