import { type DataIdentifier, type DocumentDI, RawJsonKinds, type VaultValue } from '@onefootprint/types';

type Output = Partial<Record<DocumentDI, string>>;

const parseDocumentsRawOcrJson = (input: Partial<Record<DataIdentifier, VaultValue>>): Output => {
  const output: Output = {};
  const relevantDocDis = Object.keys(input).filter(di => {
    const isDocument = di.includes('document');
    const rawJsonKinds = Object.values(RawJsonKinds);
    const containsRawJson = rawJsonKinds.some(kind => di.includes(kind));
    return isDocument && containsRawJson;
  }) as DocumentDI[];

  relevantDocDis.forEach(di => {
    const value = input[di];
    if (typeof value === 'object' && value !== null) output[di] = JSON.stringify(value, null, 4);
  });

  return output;
};

export default parseDocumentsRawOcrJson;
