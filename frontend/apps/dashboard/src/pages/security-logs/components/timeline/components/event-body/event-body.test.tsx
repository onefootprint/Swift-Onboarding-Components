import { customRender, screen } from '@onefootprint/test-utils';
import EventBody from './event-body';
import { createOrgApiKeyFixture, decryptUserDataFixture } from './event-body.test.config';

describe('<EventBody />', () => {
  it('renders decryption reason when kind is DecryptUserData', () => {
    customRender(<EventBody accessEvent={decryptUserDataFixture} />);
    const element = screen.getByLabelText('Decryption reason body');
    expect(element).toBeInTheDocument();
  });

  it('renders nothing for other kinds', () => {
    customRender(<EventBody accessEvent={createOrgApiKeyFixture} />);
    expect(screen.queryByLabelText('Decryption reason body')).not.toBeInTheDocument();
  });
});
