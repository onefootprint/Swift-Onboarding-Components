import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import EmailPreview, { EmailPreviewProps } from './email-preview';

describe('<EmailPreview />', () => {
  const renderPreview = ({
    email,
    onChange = () => {},
  }: Partial<EmailPreviewProps>) =>
    customRender(<EmailPreview email={email} onChange={onChange} />);

  it('should render correctly with email', async () => {
    renderPreview({ email: 'piip@onefootprint.com' });
    expect(screen.getByText('piip@onefootprint.com')).toBeInTheDocument();
    expect(screen.getByText('Change')).toBeInTheDocument();
  });

  it('should call onChange when clicking button', async () => {
    const onChange = jest.fn();
    renderPreview({ email: 'piip@onefootprint.com', onChange });
    const button = screen.getByText('Change');
    await userEvent.click(button);
    expect(onChange).toHaveBeenCalled();
  });
});
