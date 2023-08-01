import { customRender, screen } from '@onefootprint/test-utils';
import {
  CollectedDataOption,
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import React from 'react';

import CdoTagList from './cdo-tag-list';

describe('<CdoTagList />', () => {
  const renderCdoTagList = (cdos: CollectedDataOption[]) =>
    customRender(<CdoTagList cdos={cdos} />);

  it('should list 1 item in correct order', () => {
    renderCdoTagList([CollectedKycDataOption.name]);
    expect(screen.getByText('Full name')).toBeInTheDocument();
  });

  it('should list 2 items in correct order', () => {
    const items = [CollectedKycDataOption.dob, CollectedKycDataOption.name];
    renderCdoTagList(items);
    const [fullName, dob] = screen.getAllByRole('listitem');
    expect(fullName.innerHTML).toEqual('Full name');
    expect(dob.innerHTML).toEqual('Date of birth');
  });

  it('should list multiple items in correct order', () => {
    const items = [
      CollectedKycDataOption.name,
      CollectedKycDataOption.ssn4,
      CollectedKybDataOption.beneficialOwners,
      CollectedDocumentDataOption.documentAndSelfie,
      CollectedKycDataOption.phoneNumber,
      CollectedKycDataOption.email,
      CollectedKycDataOption.ssn9,
      CollectedInvestorProfileDataOption.investorProfile,
      CollectedKycDataOption.dob,
    ];
    renderCdoTagList(items);
    const itemSorted: string[] = [
      'Full name',
      'Email',
      'Date of birth',
      'Phone number',
      'SSN (Last 4)',
      'SSN (Full)',
      'Business beneficial owners',
      'Investor profile',
      'ID Document &amp; Selfie',
    ];
    const tags = screen.getAllByRole('listitem');
    tags.forEach((tag, index) => {
      expect(tag.innerHTML).toEqual(itemSorted[index]);
    });
  });

  it('should show ID docs correctly', () => {
    const items = [
      SupportedIdDocTypes.passport,
      SupportedIdDocTypes.idCard,
      'selfie',
    ];
    renderCdoTagList(items);
    const itemSorted: string[] = ['Passport', 'ID card', 'Selfie'];
    const tags = screen.getAllByRole('listitem');
    tags.forEach((tag, index) => {
      expect(tag.innerHTML).toEqual(itemSorted[index]);
    });
  });
});
