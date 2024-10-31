import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import DecryptUserData from './decrypt-user-data';
import {
  fiveFieldsFixture,
  fourFieldsFixture,
  oneFieldFixture,
  sixteenFieldsFixture,
  threeFieldsFixture,
  twoFieldsFixture,
} from './decrypt-user-data.test.config';

describe('<DecryptUserData />', () => {
  it('should render correctly with one field', () => {
    customRender(<DecryptUserData detail={oneFieldFixture} />);
    const text = screen.getByText('First name');
    expect(text).toBeInTheDocument();
  });

  it('should render correctly with two fields', () => {
    customRender(<DecryptUserData detail={twoFieldsFixture} />);
    const text = screen.getByText('First name and Last name');
    expect(text).toBeInTheDocument();
  });

  it('should render correctly with three fields', () => {
    customRender(<DecryptUserData detail={threeFieldsFixture} />);
    const text = screen.getByText('First name, Last name, and Date of birth');
    expect(text).toBeInTheDocument();
  });

  it('should render correctly with four fields', async () => {
    customRender(<DecryptUserData detail={fourFieldsFixture} />);
    const text = screen.getByText('First name, Last name, Date of birth and');
    expect(text).toBeInTheDocument();
    const otherText = screen.getByText('1 other attribute');
    expect(otherText).toBeInTheDocument();

    await userEvent.hover(otherText);
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip', { name: 'Email' });
      expect(tooltip).toBeInTheDocument();
    });
  });

  it('should render correctly with five fields', async () => {
    customRender(<DecryptUserData detail={fiveFieldsFixture} />);
    const text = screen.getByText('First name, Last name, Date of birth and');
    expect(text).toBeInTheDocument();
    const otherText = screen.getByText('2 other attributes');
    expect(otherText).toBeInTheDocument();

    await userEvent.hover(otherText);
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip', { name: 'Email; Phone number' });
      expect(tooltip).toBeInTheDocument();
    });
  });

  it('should render correctly with twenty fields', async () => {
    customRender(<DecryptUserData detail={sixteenFieldsFixture} />);
    const text = screen.getByText('First name, Last name, Date of birth and');
    expect(text).toBeInTheDocument();
    const otherText = screen.getByText('13 other attributes');
    expect(otherText).toBeInTheDocument();

    await userEvent.hover(otherText);
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip', {
        name: 'Email; Phone number; Nationality; Country; Nationality; SSN (Last 4); Citizenship; US Tax ID; Address line 1; Legal status; Visa expiration date; Visa type; Zip code',
      });
      expect(tooltip).toBeInTheDocument();
    });
  });
});
