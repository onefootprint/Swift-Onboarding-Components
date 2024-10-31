import { customRender, screen } from '@onefootprint/test-utils';
import Event from './event';
import { decryptEventFixture, nonDecryptEventFixture } from './event.test.config';

describe('<Event />', () => {
  it('shows decryption event description when event is DecryptUserData', () => {
    customRender(<Event accessEvent={decryptEventFixture} />);
    const element = screen.getByText('decrypted');
    expect(element).toBeInTheDocument();
  });

  it('does not show decryption event description when event is not DecryptUserData', () => {
    customRender(<Event accessEvent={nonDecryptEventFixture} />);
    const element = screen.queryByText('decrypted');
    expect(element).not.toBeInTheDocument();
  });
});
