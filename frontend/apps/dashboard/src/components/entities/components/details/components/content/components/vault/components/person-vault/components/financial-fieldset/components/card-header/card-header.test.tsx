import { customRender, screen, userEvent } from '@onefootprint/test-utils';

import type { CardHeaderProps } from './card-header';
import { CardHeader } from './card-header';
import defaultCard from './card-header.config';

const renderCardHeader = ({ cards, selectedCard, onChange }: CardHeaderProps) =>
  customRender(<CardHeader cards={cards} selectedCard={selectedCard} onChange={onChange} />);

describe('<CardHeader />', () => {
  describe('should display topCard properly', () => {
    it('should display topcard alias it exists', () => {
      const currentCard = {
        ...defaultCard,
        alias: 'Personal',
        issuer: 'visa',
        number_last4: '1234',
      };

      renderCardHeader({
        cards: [currentCard],
        selectedCard: currentCard,
        onChange: () => undefined,
      });

      expect(screen.getByText('(Personal)')).toBeInTheDocument();
    });

    it('should display topcard last 4 if it exists', () => {
      const currentCard = {
        ...defaultCard,
        alias: 'Personal',
        issuer: 'visa',
        number_last4: '1234',
      };

      renderCardHeader({
        cards: [currentCard],
        selectedCard: currentCard,
        onChange: () => undefined,
      });

      expect(screen.getByText('••••1234')).toBeInTheDocument();
    });

    it('should display just for dots if no 4 provided for selected card', () => {
      const currentCard = {
        ...defaultCard,
        alias: 'Personal',
        issuer: 'visa',
        number_last4: null,
      };

      renderCardHeader({
        cards: [currentCard],
        selectedCard: currentCard,
        onChange: () => undefined,
      });

      expect(screen.getByText('••••')).toBeInTheDocument();
    });
  });

  describe('should display dropdown as expected', () => {
    it('should display other cards provided', async () => {
      const firstCard = { ...defaultCard, alias: 'Personal', issuer: 'visa' };

      renderCardHeader({
        cards: [
          firstCard,
          { ...defaultCard, alias: 'Business', issuer: 'mastercard' },
          { ...defaultCard, alias: 'Travel', issuer: 'discover' },
        ],
        selectedCard: firstCard,
        onChange: () => undefined,
      });

      const dropdownTrigger = screen.getByRole('combobox', { name: 'Open card options' });
      await userEvent.click(dropdownTrigger);

      const businessCard = await screen.findByText('Business', { exact: false });
      expect(businessCard).toBeInTheDocument();

      const travelCard = await screen.findByText('Travel', { exact: false });
      expect(travelCard).toBeInTheDocument();
    });

    it('should display last4 on dropdown element', async () => {
      const firstCard = {
        ...defaultCard,
        alias: 'Personal',
        issuer: 'visa',
        number_last4: null,
      };

      renderCardHeader({
        cards: [
          firstCard,
          {
            ...defaultCard,
            alias: 'Business',
            issuer: 'mastercard',
            number_last4: '1234',
          },
          {
            ...defaultCard,
            alias: 'Travel',
            issuer: 'discover',
            number_last4: null,
          },
        ],
        selectedCard: firstCard,
        onChange: () => undefined,
      });

      const dropdownTrigger = screen.getByRole('combobox', { name: 'Open card options' });
      await userEvent.click(dropdownTrigger);

      const lastFourDigits = await screen.findByText('••••1234');
      expect(lastFourDigits).toBeInTheDocument();
    });
  });
});
