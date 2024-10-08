import { customRender, screen, userEvent } from '@onefootprint/test-utils';

import type { CardSelectorProps } from './card-selector';
import CardSelector from './card-selector';
import { defaultCard } from './card-selector.test.config';

const renderSelector = (props: CardSelectorProps) => customRender(<CardSelector {...props} />);

describe('<CardSelector />', () => {
  it('should display card alias and last 4 if both exist', () => {
    const currentCard = {
      ...defaultCard,
      alias: 'Personal',
      issuer: 'visa',
      number_last4: '1234',
    };

    renderSelector({
      cards: [currentCard],
      selected: currentCard,
      onChange: () => undefined,
    });

    const element = screen.getByText('•••• 1234 (Personal)');
    expect(element).toBeInTheDocument();
  });

  it('should display just four dots if no last 4 digits provided for selected card', () => {
    const currentCard = {
      ...defaultCard,
      alias: 'Personal',
      issuer: 'visa',
      number_last4: null,
    };

    renderSelector({
      cards: [currentCard],
      selected: currentCard,
      onChange: () => undefined,
    });

    const element = screen.getByText('•••• (Personal)');
    expect(element).toBeInTheDocument();
  });

  it('should display other cards in dropdown', async () => {
    const cards = [
      { ...defaultCard, alias: 'Personal', issuer: 'visa', number_last4: undefined },
      { ...defaultCard, alias: 'Business', issuer: 'mastercard', number_last4: undefined },
      { ...defaultCard, alias: 'Travel', issuer: 'discover', number_last4: undefined },
    ];

    renderSelector({
      cards,
      selected: cards[0],
      onChange: () => undefined,
    });

    const dropdownTrigger = screen.getByRole('combobox');
    await userEvent.click(dropdownTrigger);

    const businessCard = await screen.findByText('•••• (Business)');
    expect(businessCard).toBeInTheDocument();

    const travelCard = await screen.findByText('•••• (Travel)');
    expect(travelCard).toBeInTheDocument();
  });

  it('should display last4 on dropdown element', async () => {
    const cards = [
      { ...defaultCard, alias: 'Personal', issuer: 'visa', number_last4: '1111' },
      { ...defaultCard, alias: 'Business', issuer: 'mastercard', number_last4: '1234' },
      { ...defaultCard, alias: 'Travel', issuer: 'discover', number_last4: '5678' },
    ];

    renderSelector({
      cards,
      selected: cards[0],
      onChange: () => undefined,
    });

    const dropdownTrigger = screen.getByRole('combobox');
    await userEvent.click(dropdownTrigger);

    const businessCard = await screen.findByText('•••• 1234 (Business)');
    expect(businessCard).toBeInTheDocument();

    const travelCard = await screen.findByText('•••• 5678 (Travel)');
    expect(travelCard).toBeInTheDocument();
  });

  it('should display card issuer icon in the selected option', () => {
    const currentCard = {
      ...defaultCard,
      alias: 'Personal',
      issuer: 'visa',
      number_last4: '1234',
    };

    renderSelector({
      cards: [currentCard],
      selected: currentCard,
      onChange: () => undefined,
    });

    const issuerIcon = screen.getByRole('img', { name: 'visa' });
    expect(issuerIcon).toBeInTheDocument();
  });

  it('should display card issuer icons in the dropdown options', async () => {
    const cards = [
      { ...defaultCard, alias: 'Personal', issuer: 'visa', number_last4: '1111' },
      { ...defaultCard, alias: 'Business', issuer: 'mastercard', number_last4: '1234' },
      { ...defaultCard, alias: 'Travel', issuer: 'discover', number_last4: '5678' },
    ];

    renderSelector({
      cards,
      selected: cards[0],
      onChange: () => undefined,
    });

    const dropdownTrigger = screen.getByRole('combobox');
    await userEvent.click(dropdownTrigger);

    const visaIcon = screen.getByRole('img', { name: 'visa' });
    expect(visaIcon).toBeInTheDocument();

    const mastercardIcon = screen.getByRole('img', { name: 'mastercard' });
    expect(mastercardIcon).toBeInTheDocument();

    const discoverIcon = screen.getByRole('img', { name: 'discover' });
    expect(discoverIcon).toBeInTheDocument();
  });
});
