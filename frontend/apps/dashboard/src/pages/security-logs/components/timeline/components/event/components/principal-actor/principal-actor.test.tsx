import { getActor } from '@onefootprint/fixtures/dashboard';
import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import PrincipalActor from './principal-actor';

describe('<PrincipalActor />', () => {
  describe('when actor is Footprint', () => {
    it('should show "Footprint"', async () => {
      customRender(<PrincipalActor principal={getActor({ kind: 'footprint' })} insightEvent={undefined} />);
      const footprint = await screen.findByText('Footprint');
      expect(footprint).toBeInTheDocument();
    });
  });

  describe('when actor is Firm Employee', () => {
    it('should show "Footprint"', async () => {
      customRender(<PrincipalActor principal={getActor({ kind: 'firm_employee' })} insightEvent={undefined} />);
      const name = await screen.findByText('Footprint');
      expect(name).toBeInTheDocument();
    });
  });

  describe('when actor is Organization', () => {
    describe('when both first and last name are present', () => {
      it('should show full name and email', async () => {
        customRender(
          <PrincipalActor
            principal={getActor({
              kind: 'organization',
              firstName: 'John',
              lastName: 'Smith',
              email: 'john.smith@example.com',
            })}
            insightEvent={undefined}
          />,
        );

        const name = screen.getByText('John Smith (john.smith@example.com)');
        expect(name).toBeInTheDocument();
      });
    });
  });

  describe('when only first name is present', () => {
    it('should show first name and email', async () => {
      customRender(
        <PrincipalActor
          principal={getActor({
            kind: 'organization',
            firstName: 'John',
            email: 'john.smith@example.com',
          })}
          insightEvent={undefined}
        />,
      );

      const name = screen.getByText('John (john.smith@example.com)');
      expect(name).toBeInTheDocument();
    });
  });

  describe('when only last name is present', () => {
    it('should show last name and email', async () => {
      customRender(
        <PrincipalActor
          principal={getActor({
            kind: 'organization',
            lastName: 'Smith',
            email: 'john.smith@example.com',
          })}
          insightEvent={undefined}
        />,
      );

      const name = screen.getByText('Smith (john.smith@example.com)');
      expect(name).toBeInTheDocument();
    });
  });

  describe('when neither first nor last name is present', () => {
    it('should show "An employee" and email', async () => {
      customRender(
        <PrincipalActor
          principal={getActor({
            kind: 'organization',
            email: 'john.smith@example.com',
          })}
          insightEvent={undefined}
        />,
      );

      const name = screen.getByText('An employee (john.smith@example.com)');
      expect(name).toBeInTheDocument();
    });
  });
});

describe('when actor is API Key', () => {
  it('should show API key label and name', async () => {
    customRender(
      <PrincipalActor
        principal={getActor({
          kind: 'api_key',
          name: 'test-key',
        })}
        insightEvent={undefined}
      />,
    );

    const name = screen.getByText('An API key (test-key)');
    expect(name).toBeInTheDocument();
  });
});

describe('when actor is User', () => {
  it('should show "A user"', async () => {
    customRender(<PrincipalActor principal={getActor({ kind: 'user' })} insightEvent={undefined} />);
    const name = screen.getByText('A user');
    expect(name).toBeInTheDocument();
  });
});

describe('with insight event', () => {
  it('should render hover card', async () => {
    const insightEvent = {
      id: '123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: 'test-insight',
      status: 'active' as const,
      timestamp: new Date().toISOString(),
    };

    customRender(
      <PrincipalActor
        principal={getActor({ kind: 'organization', email: 'test@example.com' })}
        insightEvent={insightEvent}
      />,
    );

    const name = screen.getByText('An employee (test@example.com)');
    expect(name).toBeInTheDocument();

    await userEvent.hover(name);
  });
});
