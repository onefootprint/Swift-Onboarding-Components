import { DecryptedIdDoc } from './decrypted-id-doc';
import { BusinessDI, DocumentDI, IdDI, InvestorProfileDI } from './di';
import IdDocDI from './id-doc-data-attribute';

export type VaultEncryptedData = null;

export type VaultEmptyData = undefined;

export type VaultTextData = string;

export type VaultObjectData<T = Object> = T;

export type VaultArrayData<T = any> = Array<T>;

export type VaultIdDocumentData = DecryptedIdDoc[];

export type VaultDocumentData = { name: string; content: Blob };

export type VaultValue =
  | VaultTextData
  | VaultObjectData
  | VaultArrayData
  | VaultIdDocumentData
  | VaultDocumentData
  | VaultEncryptedData
  | VaultEmptyData;

export type VaultInvestorProfile = Partial<
  Record<InvestorProfileDI, VaultTextData | VaultEncryptedData | VaultEmptyData>
>;

export type VaultBusiness = Partial<
  Record<BusinessDI, VaultTextData | VaultEncryptedData | VaultEmptyData>
>;
export type VaultId = Partial<
  Record<IdDI, VaultTextData | VaultEncryptedData | VaultEmptyData>
>;

export type VaultIdDocument = Partial<
  Record<IdDocDI, VaultIdDocumentData | VaultEncryptedData | VaultEmptyData>
>;

export type VaultDocument = Partial<
  Record<DocumentDI, VaultDocumentData | VaultEncryptedData | VaultEmptyData>
>;

export type Vault = {
  id: VaultId;
  idDoc: VaultIdDocument;
  investorProfile: VaultInvestorProfile;
  document: VaultDocument;
};

export const isVaultDataEncrypted = (data: any): data is VaultEncryptedData =>
  data === null;

export const isVaultDataEmpty = (data: any): data is VaultEmptyData =>
  data === undefined;

export const isVaultDataDecrypted = (data: any): data is VaultEncryptedData =>
  data !== null && data !== undefined;

export const isVaultDataText = (data: any): data is VaultTextData =>
  typeof data === 'string';

export const isVaultDataIdDocument = (
  data: any,
): data is VaultIdDocumentData => {
  if (!Array.isArray(data)) return false;
  return data.every(
    item => typeof item.front === 'string' && typeof item.status === 'string',
  );
};

export const isVaultDataDocument = (data: any): data is VaultDocumentData => {
  if (typeof data !== 'object') return false;
  if (typeof data?.name !== 'string' || typeof data?.content !== 'object') {
    return false;
  }
  return true;
};
