import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
import type { FinancialDataItem } from '../../types';

const getFinancialData = (fields: DataIdentifier[]) => {
  // Group card fields by ID
  const cardGroups: Record<string, string[]> = {};
  fields.forEach(field => {
    if (field.startsWith('card.')) {
      const [, id] = field.split('card.');
      const [cardId] = id.split('.');
      cardGroups[cardId] = cardGroups[cardId] || [];
      const aliasedField = field.replace(`card.${cardId}.`, 'card.*.');
      cardGroups[cardId].push(aliasedField);
    }
  });

  // Build card objects
  const cards: FinancialDataItem[] = Object.entries(cardGroups).map(([cardId, cardFields]) => {
    return {
      name: cardId,
      fields: cardFields as DataIdentifier[],
    };
  });

  // Group bank fields by ID
  const bankGroups: Record<string, string[]> = {};
  fields.forEach(field => {
    if (field.startsWith('bank.')) {
      const [, id] = field.split('bank.');
      const [bankId] = id.split('.');
      bankGroups[bankId] = bankGroups[bankId] || [];
      const aliasedField = field.replace(`bank.${bankId}.`, 'bank.*.');
      bankGroups[bankId].push(aliasedField);
    }
  });

  // Build bank account objects
  const bankAccounts: FinancialDataItem[] = Object.entries(bankGroups).map(([bankId, bankFields]) => {
    return {
      name: bankId,
      fields: bankFields as DataIdentifier[],
    };
  });

  // Get non-financial fields
  const nonFinancialFields = fields.filter(field => !field.startsWith('card.') && !field.startsWith('bank.'));

  return {
    cards,
    bankAccounts,
    nonFinancialFields,
    hasFinancialData: cards.length > 0 || bankAccounts.length > 0,
  };
};

export default getFinancialData;
