import { customRender, screen } from '@onefootprint/test-utils';
import DecryptionReason from './decryption-reason';
import { auditEventFixture } from './decryption-reason.test.config';

describe('<DecryptionReason />', () => {
  it('renders standard elements', () => {
    customRender(<DecryptionReason detail={auditEventFixture} />);
    const label = screen.getByText('Decryption reason');
    expect(label).toBeInTheDocument();
  });

  it('displays the provided decryption reason', () => {
    customRender(<DecryptionReason detail={auditEventFixture} />);
    const reason = screen.getByText('Test reason');
    expect(reason).toBeInTheDocument();
  });
});
