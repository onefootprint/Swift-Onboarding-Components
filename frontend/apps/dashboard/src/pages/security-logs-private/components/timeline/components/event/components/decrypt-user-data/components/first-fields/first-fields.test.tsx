import { customRender, screen } from '@onefootprint/test-utils';
import { IdDI } from '@onefootprint/types';
import FirstFieldsText from './first-fields';

describe('FirstFieldsText', () => {
  it('should render single field text', () => {
    customRender(<FirstFieldsText decryptedFields={[IdDI.firstName]} />);
    const element = screen.getByText('First name');
    expect(element).toBeInTheDocument();
  });

  it('should render two fields joined with "and"', () => {
    customRender(<FirstFieldsText decryptedFields={[IdDI.firstName, IdDI.lastName]} />);
    const element = screen.getByText('First name and Last name');
    expect(element).toBeInTheDocument();
  });

  it('should render three fields joined with commas and "and"', () => {
    customRender(<FirstFieldsText decryptedFields={[IdDI.firstName, IdDI.lastName, IdDI.email]} />);
    const element = screen.getByText('First name, Last name, and Email');
    expect(element).toBeInTheDocument();
  });

  it('should only show first three fields when more than three fields are provided', () => {
    customRender(
      <FirstFieldsText decryptedFields={[IdDI.firstName, IdDI.lastName, IdDI.email, IdDI.phoneNumber, IdDI.dob]} />,
    );
    const element = screen.getByText('First name, Last name, Email');
    expect(element).toBeInTheDocument();
  });
});
