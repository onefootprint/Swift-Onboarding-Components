import { customRender, screen } from '@onefootprint/test-utils';
import DuplicateUser from './duplicate-user';
import { mockDupe } from './duplicate-user.test.config';

describe('<DuplicateUser />', () => {
  it('should display the calculated name correctly', () => {
    customRender(<DuplicateUser dupe={mockDupe} />);
    const nameElement = screen.getByText('John D.');
    expect(nameElement).toBeInTheDocument();
  });

  it('should display the fpId correctly', () => {
    customRender(<DuplicateUser dupe={mockDupe} />);
    const fpIdElement = screen.getByText('fp_id_test_XwtUmiamP9k1JLmBZJM2ag');
    expect(fpIdElement).toBeInTheDocument();
  });

  it('should format and display the created at date correctly', () => {
    customRender(<DuplicateUser dupe={mockDupe} />);
    const dateElement = screen.getByText('05/15/23, 10:30am');
    expect(dateElement).toBeInTheDocument();
  });

  it('should create the correct link for the LinkButton', () => {
    customRender(<DuplicateUser dupe={mockDupe} />);
    const linkButton = screen.getByRole('link', { name: 'View user details' });
    expect(linkButton).toHaveAttribute('href', '/users/fp_id_test_XwtUmiamP9k1JLmBZJM2ag');
  });
});
