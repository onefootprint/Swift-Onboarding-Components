import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import PhoneVerificationHeader, {
  PhoneVerificationHeaderProps,
} from './phone-verification-header';

describe('<PhoneVerificationHeader />', () => {
  const renderHeader = ({
    phone,
    userFound,
  }: Partial<PhoneVerificationHeaderProps>) =>
    customRender(
      <PhoneVerificationHeader phone={phone} userFound={userFound} />,
    );

  it('renders correctly with full phone', () => {
    renderHeader({ phone: '+1 (***) ***-**00', userFound: true });
    expect(screen.getByText('Welcome back! 🎉')).toBeInTheDocument();
    expect(
      screen.getByText('Enter the 6-digit code sent to +1 (•••) ••• ••00.'),
    ).toBeInTheDocument();
  });

  it('renders correctly with new user', () => {
    renderHeader({ phone: '+1 123 456-7890', userFound: false });
    expect(screen.getByText("Let's verify your identity!")).toBeInTheDocument();
    expect(
      screen.getByText('Enter the 6-digit code sent to +1 123 456 7890.'),
    ).toBeInTheDocument();
  });

  it('renders correctly with scrubbed phone from challenge data', () => {
    renderHeader({ phone: '+1 (***) ***-**00', userFound: true });
    expect(screen.getByText('Welcome back! 🎉')).toBeInTheDocument();
    expect(
      screen.getByText('Enter the 6-digit code sent to +1 (•••) ••• ••00.'),
    ).toBeInTheDocument();
  });
});
