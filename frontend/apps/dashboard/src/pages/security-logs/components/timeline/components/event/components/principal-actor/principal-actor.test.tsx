import { getActor } from '@onefootprint/fixtures/dashboard';
import { customRender, screen } from '@onefootprint/test-utils';
import PrincipalActor from './principal-actor';

describe('<PrincipalActor />', () => {
  describe('when actor is Footprint', () => {
    it('should show "Footprint"', () => {
      customRender(<PrincipalActor principal={getActor({ kind: 'footprint' })} insightEvent={undefined} />);
      const element = screen.getByText('Footprint');
      expect(element).toBeInTheDocument();
    });
  });

  describe('when actor is Firm Employee', () => {
    it('should show "Footprint"', () => {
      customRender(<PrincipalActor principal={getActor({ kind: 'firm_employee' })} insightEvent={undefined} />);
      const element = screen.getByText('Footprint');
      expect(element).toBeInTheDocument();
    });
  });

  describe('when actor is Organization', () => {
    describe('when both first and last name are present', () => {
      it('should show full name and email', () => {
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
        const nameElement = screen.getByText('John Smith');
        const emailElement = screen.getByText('(john.smith@example.com)');
        expect(nameElement).toBeInTheDocument();
        expect(emailElement).toBeInTheDocument();
      });
    });

    describe('when only first name is present', () => {
      it('should show first name and email', () => {
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
        const nameElement = screen.getByText('John');
        const emailElement = screen.getByText('(john.smith@example.com)');
        expect(nameElement).toBeInTheDocument();
        expect(emailElement).toBeInTheDocument();
      });
    });

    describe('when only last name is present', () => {
      it('should show last name and email', () => {
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
        const nameElement = screen.getByText('Smith');
        const emailElement = screen.getByText('(john.smith@example.com)');
        expect(nameElement).toBeInTheDocument();
        expect(emailElement).toBeInTheDocument();
      });
    });

    describe('when neither first nor last name is present', () => {
      it('should show "An employee" and email', () => {
        customRender(
          <PrincipalActor
            principal={getActor({
              kind: 'organization',
              email: 'john.smith@example.com',
            })}
            insightEvent={undefined}
          />,
        );
        const nameElement = screen.getByText('An employee');
        const emailElement = screen.getByText('(john.smith@example.com)');
        expect(nameElement).toBeInTheDocument();
        expect(emailElement).toBeInTheDocument();
      });
    });
  });

  describe('when actor is API Key', () => {
    it('should show API key label and name', () => {
      customRender(<PrincipalActor principal={getActor({ kind: 'api_key' })} insightEvent={undefined} />);
      const labelElement = screen.getByText('An API key');
      // TODO: Fix this once we have a fixture for API key, serialization on the BE has not been merged yet
      const nameElement = screen.getByText('()');
      expect(labelElement).toBeInTheDocument();
      expect(nameElement).toBeInTheDocument();
    });
  });

  describe('when actor is User', () => {
    it('should show "A user"', () => {
      customRender(<PrincipalActor principal={getActor({ kind: 'user' })} insightEvent={undefined} />);
      const element = screen.getByText('A user');
      expect(element).toBeInTheDocument();
    });
  });
});
