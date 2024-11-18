import { customRender, screen } from '@onefootprint/test-utils';
import { IdDI } from '@onefootprint/types';
import FirstFieldsText from './first-fields';

describe('FirstFieldsText', () => {
  it('should render single field text', () => {
    customRender(<FirstFieldsText fields={[IdDI.firstName]} />);
    const elements = screen.getAllByRole('paragraph');
    expect(elements.map(el => el.textContent).join('')).toBe('First name');
  });

  it('should render two fields joined with "and"', () => {
    customRender(<FirstFieldsText fields={[IdDI.firstName, IdDI.lastName]} />);
    const elements = screen.getAllByRole('paragraph');
    expect(elements.map(el => el.textContent).join('')).toBe('First name and Last name');
  });

  it('should render three fields joined with commas and "and"', () => {
    customRender(<FirstFieldsText fields={[IdDI.firstName, IdDI.lastName, IdDI.email]} />);
    const elements = screen.getAllByRole('paragraph');
    expect(elements.map(el => el.textContent).join('')).toBe('First name,Last name,and Email');
  });

  it('should only show first three fields when more than three fields are provided', () => {
    customRender(<FirstFieldsText fields={[IdDI.firstName, IdDI.lastName, IdDI.email, IdDI.phoneNumber, IdDI.dob]} />);
    const elements = screen.getAllByRole('paragraph');
    expect(elements.map(el => el.textContent).join('')).toBe('First name,Last name,Email and');
  });
});
