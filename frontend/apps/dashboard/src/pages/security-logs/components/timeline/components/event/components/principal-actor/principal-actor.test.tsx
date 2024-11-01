import { customRender, screen } from '@onefootprint/test-utils';
import PrincipalActor from './principal-actor';
import {
  apiKeyActorFixture,
  firmEmployeeActorFixture,
  firstNameOnlyFixture,
  footprintActorFixture,
  lastNameOnlyFixture,
  noNameFixture,
  organizationActorFixture,
  userActorFixture,
} from './principal-actor.test.config';

describe('<PrincipalActor />', () => {
  describe('when actor is Footprint', () => {
    it('should show "Footprint"', () => {
      customRender(<PrincipalActor principal={footprintActorFixture} insightEvent={undefined} />);
      const element = screen.getByText('Footprint');
      expect(element).toBeInTheDocument();
    });
  });

  describe('when actor is Firm Employee', () => {
    it('should show "Footprint"', () => {
      customRender(<PrincipalActor principal={firmEmployeeActorFixture} insightEvent={undefined} />);
      const element = screen.getByText('Footprint');
      expect(element).toBeInTheDocument();
    });
  });

  describe('when actor is Organization', () => {
    describe('when both first and last name are present', () => {
      it('should show full name and email', () => {
        customRender(<PrincipalActor principal={organizationActorFixture} insightEvent={undefined} />);
        const nameElement = screen.getByText('John Smith');
        const emailElement = screen.getByText('(john.smith@example.com)');
        expect(nameElement).toBeInTheDocument();
        expect(emailElement).toBeInTheDocument();
      });
    });

    describe('when only first name is present', () => {
      it('should show first name and email', () => {
        customRender(<PrincipalActor principal={firstNameOnlyFixture} insightEvent={undefined} />);
        const nameElement = screen.getByText('John');
        const emailElement = screen.getByText('(john.smith@example.com)');
        expect(nameElement).toBeInTheDocument();
        expect(emailElement).toBeInTheDocument();
      });
    });

    describe('when only last name is present', () => {
      it('should show last name and email', () => {
        customRender(<PrincipalActor principal={lastNameOnlyFixture} insightEvent={undefined} />);
        const nameElement = screen.getByText('Smith');
        const emailElement = screen.getByText('(john.smith@example.com)');
        expect(nameElement).toBeInTheDocument();
        expect(emailElement).toBeInTheDocument();
      });
    });

    describe('when neither first nor last name is present', () => {
      it('should show "One of your employees" and email', () => {
        customRender(<PrincipalActor principal={noNameFixture} insightEvent={undefined} />);
        const nameElement = screen.getByText('An employee');
        const emailElement = screen.getByText('(john.smith@example.com)');
        expect(nameElement).toBeInTheDocument();
        expect(emailElement).toBeInTheDocument();
      });
    });
  });

  describe('when actor is API Key', () => {
    it('should show API key label and name', () => {
      customRender(<PrincipalActor principal={apiKeyActorFixture} insightEvent={undefined} />);
      const labelElement = screen.getByText('An API key');
      const nameElement = screen.getByText('(Test API Key)');
      expect(labelElement).toBeInTheDocument();
      expect(nameElement).toBeInTheDocument();
    });
  });

  describe('when actor is User', () => {
    it('should show "One of your users"', () => {
      customRender(<PrincipalActor principal={userActorFixture} insightEvent={undefined} />);
      const element = screen.getByText('A user');
      expect(element).toBeInTheDocument();
    });
  });
});
