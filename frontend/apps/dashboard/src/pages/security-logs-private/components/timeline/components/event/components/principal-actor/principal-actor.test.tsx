import { customRender, screen } from '@onefootprint/test-utils';
import PrincipalActor from './principal-actor';
import { principalWithNameFixture, principalWithoutNameFixture } from './principal-actor.test.config';

describe('<PrincipalActor />', () => {
  it('displays the principal name when available', () => {
    customRender(<PrincipalActor principal={principalWithNameFixture} />);

    const linkButton = screen.getByRole('link', { name: 'John Doe' });
    expect(linkButton).toBeInTheDocument();
    expect(linkButton).toHaveAttribute('href', '/users/123');
  });

  it('displays "A user" when principal name is not available', () => {
    customRender(<PrincipalActor principal={principalWithoutNameFixture} />);

    const linkButton = screen.getByRole('link', { name: 'A user' });
    expect(linkButton).toBeInTheDocument();
    expect(linkButton).toHaveAttribute('href', '/users/456');
  });
});
