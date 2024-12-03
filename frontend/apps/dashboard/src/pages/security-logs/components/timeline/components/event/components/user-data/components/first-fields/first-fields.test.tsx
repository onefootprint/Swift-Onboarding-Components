import { customRender, screen } from '@onefootprint/test-utils';
import FirstFieldsText from './first-fields';

describe('FirstFieldsText', () => {
  it('should render single field text', () => {
    customRender(<FirstFieldsText fields={['First name']} />);
    const elements = screen.getAllByRole('paragraph');
    expect(elements.map(el => el.textContent).join('')).toBe('First name');
  });

  it('should render two fields joined with "and"', () => {
    customRender(<FirstFieldsText fields={['First name', 'Last name']} />);
    const elements = screen.getAllByRole('paragraph');
    expect(elements.map(el => el.textContent).join('')).toBe('First name and Last name');
  });

  it('should render three fields joined with commas and "and"', () => {
    customRender(<FirstFieldsText fields={['First name', 'Last name', 'Email']} />);
    const elements = screen.getAllByRole('paragraph');
    expect(elements.map(el => el.textContent).join('')).toBe('First name,Last name,and Email');
  });

  it('should only show first three fields when more than three fields are provided', () => {
    customRender(<FirstFieldsText fields={['First name', 'Last name', 'Email']} hasCollapsedFields />);
    const elements = screen.getAllByRole('paragraph');
    expect(elements.map(el => el.textContent).join('')).toBe('First name,Last name,Email,and');
  });
});
