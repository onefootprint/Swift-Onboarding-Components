import { customRender, screen } from '@onefootprint/test-utils';
import type { CollectedDataOption } from '@onefootprint/types';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';

import CdoList from './cdo-list';

describe('<CdoList />', () => {
  const renderCdoList = (cdos: CollectedDataOption[]) => customRender(<CdoList cdos={cdos} />);

  it('should list 1 item in correct order', () => {
    renderCdoList([CollectedKycDataOption.name]);
    expect(screen.getByText('Full name')).toBeInTheDocument();
  });

  it('should list 2 items in correct order', () => {
    const items = [CollectedKycDataOption.dob, CollectedKycDataOption.name];
    renderCdoList(items);
    expect(screen.getByText('Full name, Date of birth')).toBeInTheDocument();
  });

  it('should list multiple items in correct order', () => {
    const items = [
      CollectedKycDataOption.name,
      CollectedKycDataOption.ssn4,
      CollectedKybDataOption.kycedBeneficialOwners,
      CollectedDocumentDataOption.documentAndSelfie,
      CollectedKycDataOption.phoneNumber,
      CollectedKycDataOption.email,
      CollectedKycDataOption.ssn9,
      CollectedInvestorProfileDataOption.investorProfile,
      CollectedKycDataOption.dob,
    ];
    renderCdoList(items);
    expect(
      screen.getByText(
        'Full name, Email, Date of birth, Phone number, SSN (Last 4), SSN (Full), Business beneficial owners, Investor profile, ID Document & Selfie',
      ),
    ).toBeInTheDocument();
  });

  it('should show ID docs correctly', () => {
    const items = [SupportedIdDocTypes.passport, SupportedIdDocTypes.idCard, 'selfie'];
    renderCdoList(items);
    expect(screen.getByText('Passport, ID card, Selfie')).toBeInTheDocument();
  });
});
