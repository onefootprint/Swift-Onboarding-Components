import type { DataIdentifier } from '@onefootprint/request-types/dashboard';

const getFinancialData = (fields: DataIdentifier[]) => {
  // Group card fields by ID
  const cardGroups: Record<string, string[]> = {};
  fields.forEach(field => {
    if (field.startsWith('card.')) {
      const [, id] = field.split('card.');
      const [cardId] = id.split('.');
      cardGroups[cardId] = cardGroups[cardId] || [];
      cardGroups[cardId].push(field);
    }
  });

  // Build card objects
  const cards = Object.entries(cardGroups).map(([cardId, cardFields]) => {
    return {
      name: cardId,
      fields: cardFields.map(f => {
        const parts = f.split('.');
        return parts[parts.length - 1];
      }),
    };
  });

  // Group bank fields by ID
  const bankGroups: Record<string, string[]> = {};
  fields.forEach(field => {
    if (field.startsWith('bank.')) {
      const [, id] = field.split('bank.');
      const [bankId] = id.split('.');
      bankGroups[bankId] = bankGroups[bankId] || [];
      bankGroups[bankId].push(field);
    }
  });

  // Build bank account objects
  const bankAccounts = Object.entries(bankGroups).map(([bankId, bankFields]) => {
    return {
      name: bankId,
      fields: bankFields.map(f => {
        const parts = f.split('.');
        return parts[parts.length - 1];
      }),
    };
  });

  return {
    cards,
    bankAccounts,
    hasFinancialData: cards.length > 0 || bankAccounts.length > 0,
  };
};

export default getFinancialData;
