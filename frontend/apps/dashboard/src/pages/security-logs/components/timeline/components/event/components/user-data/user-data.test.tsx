import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import UserData from './user-data';
import {
  fifteenFieldsFixture,
  financialWithManyFieldsFixture,
  financialWithThreeFieldsFixture,
  fiveFieldsFixture,
  fourFieldsFixture,
  oneFieldFixture,
  onlyFinancialFixture,
  threeFieldsFixture,
  twoFieldsFixture,
} from './user-data.test.config';

describe('<UserData />', () => {
  it('should render correctly with one field', () => {
    customRender(<UserData detail={oneFieldFixture} />);
    const text = screen.getByText('First name');
    expect(text).toBeInTheDocument();
  });

  it('should render correctly with two fields', () => {
    customRender(<UserData detail={twoFieldsFixture} />);
    const text = screen.getByText('First name and Last name');
    expect(text).toBeInTheDocument();
  });

  it('should render correctly with three fields', () => {
    customRender(<UserData detail={threeFieldsFixture} />);
    const elements = screen.getAllByRole('paragraph');
    expect(elements.map(el => el.textContent).join('')).toBe('Date of birth,First name,and Last name');
  });

  it('should render correctly with four fields', async () => {
    customRender(<UserData detail={fourFieldsFixture} />);
    const elements = screen.getAllByRole('paragraph');
    expect(elements.map(el => el.textContent).join('')).toBe('Date of birth,Email,First name,and');
    const otherText = screen.getByText('1 other attribute');
    expect(otherText).toBeInTheDocument();

    await userEvent.hover(otherText);
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip', { name: 'Last name' });
      expect(tooltip).toBeInTheDocument();
    });
  });

  it('should render correctly with five fields', async () => {
    customRender(<UserData detail={fiveFieldsFixture} />);
    const elements = screen.getAllByRole('paragraph');
    expect(elements.map(el => el.textContent).join('')).toBe('Date of birth,Email,First name,and');
    const otherText = screen.getByText('2 other attributes');
    expect(otherText).toBeInTheDocument();

    await userEvent.hover(otherText);
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip', { name: 'Last name; Phone number' });
      expect(tooltip).toBeInTheDocument();
    });
  });

  it('should render correctly with fifteen fields', async () => {
    customRender(<UserData detail={fifteenFieldsFixture} />);
    const elements = screen.getAllByRole('paragraph');
    expect(elements.map(el => el.textContent).join('')).toBe('Date of birth,Email,Address line 1,and');
    const otherText = screen.getByText('12 other attributes');
    expect(otherText).toBeInTheDocument();

    await userEvent.hover(otherText);
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip', {
        name: 'Zip code; Country; First name; Last name; Nationality; Phone number; SSN (Last 4); Legal status; Visa type; Visa expiration date; Citizenship; US Tax ID',
      });
      expect(tooltip).toBeInTheDocument();
    });
  });
});

describe('UserData for different event types', () => {
  it('should render correctly for delete_user_data event', () => {
    customRender(
      <UserData
        detail={{
          kind: 'delete_user_data',
          data: {
            fpId: '123',
            deletedFields: ['id.first_name', 'id.last_name'],
          },
        }}
      />,
    );

    const deletedText = screen.getByText('deleted');
    const fieldsText = screen.getByText('First name and Last name');
    expect(deletedText).toBeInTheDocument();
    expect(fieldsText).toBeInTheDocument();
  });

  it('should render correctly for update_user_data event', () => {
    customRender(
      <UserData
        detail={{
          kind: 'update_user_data',
          data: {
            fpId: '123',
            updatedFields: ['id.email', 'id.phone_number'],
          },
        }}
      />,
    );

    const updatedText = screen.getByText('updated');
    const fieldsText = screen.getByText('Email and Phone number');
    expect(updatedText).toBeInTheDocument();
    expect(fieldsText).toBeInTheDocument();
  });
});

describe('UserData with financial data', () => {
  it('should render correctly with only financial data', async () => {
    customRender(<UserData detail={onlyFinancialFixture} />);

    const decryptedText = screen.getByText('decrypted');
    expect(decryptedText).toBeInTheDocument();

    const financialData = screen.getByText('Financial data');
    expect(financialData).toBeInTheDocument();

    await userEvent.hover(financialData);
    await waitFor(() => {
      const hoverCard = screen.getByText('* (Card)');
      expect(hoverCard).toBeInTheDocument();

      const cardDetails = screen.getByText('Issuer');
      expect(cardDetails).toBeInTheDocument();

      const bankDetails = screen.getByText('Bank name');
      expect(bankDetails).toBeInTheDocument();
    });
  });

  it('should render correctly with financial data and three other fields', async () => {
    customRender(<UserData detail={financialWithThreeFieldsFixture} />);

    const financialData = screen.getByText('Financial data,');
    expect(financialData).toBeInTheDocument();

    const elements = screen.getAllByRole('paragraph');
    expect(elements.map(el => el.textContent).join('')).toBe('Financial data,Date of birth,First name,and Last name');

    await userEvent.hover(financialData);
    await waitFor(() => {
      const hoverCard = screen.getByText('* (Card)');
      expect(hoverCard).toBeInTheDocument();

      const cardDetails = screen.getByText('Issuer');
      expect(cardDetails).toBeInTheDocument();

      const bankDetails = screen.getByText('Bank name');
      expect(bankDetails).toBeInTheDocument();
    });
  });

  it('should render correctly with financial data and many other fields', async () => {
    customRender(<UserData detail={financialWithManyFieldsFixture} />);

    const financialData = screen.getByText('Financial data,');
    expect(financialData).toBeInTheDocument();

    const elements = screen.getAllByRole('paragraph');
    expect(elements.map(el => el.textContent).join('')).toBe('Financial data,Date of birth,Email,First name,and');

    const otherText = screen.getByText('3 other attributes');
    expect(otherText).toBeInTheDocument();

    await userEvent.hover(financialData);
    await waitFor(() => {
      const hoverCard = screen.getByText('* (Card)');
      expect(hoverCard).toBeInTheDocument();

      const cardDetails = screen.getByText('Issuer');
      expect(cardDetails).toBeInTheDocument();

      const bankDetails = screen.getByText('Bank name');
      expect(bankDetails).toBeInTheDocument();
    });

    await userEvent.hover(otherText);
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip', { name: 'Last name; Nationality; Phone number' });
      expect(tooltip).toBeInTheDocument();
    });
  });
});
