import { customRender, screen } from '@onefootprint/test-utils';
import DecryptionReason from './decryption-reason';
import { decryptUserDataFixture } from './decryption-reason.test.config';

describe('<DecryptionReason />', () => {
  it('renders standard elements', () => {
    customRender(<DecryptionReason detail={decryptUserDataFixture} />);
    const label = screen.getByText('Decryption reason');
    expect(label).toBeInTheDocument();
  });

  it('displays the provided decryption reason', () => {
    customRender(<DecryptionReason detail={decryptUserDataFixture} />);
    const reason = screen.getByText('Test reason');
    expect(reason).toBeInTheDocument();
  });
});
