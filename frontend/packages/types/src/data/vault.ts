import type { BusinessDI, DocumentDI, IdDI, InvestorProfileDI } from './di';

export type VaultEncryptedData = null;

export type VaultEmptyData = undefined;

export type VaultTextData = string;

export type VaultObjectData<T = Object> = T;

export type VaultArrayData<T = any> = Array<T>;

export type VaultDocumentData = { name: string; content: Blob };

export type VaultImageData = { name: string; src: string };

export type VaultValue =
  | VaultTextData
  | VaultObjectData
  | VaultArrayData
  | VaultDocumentData
  | VaultImageData
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

export type VaultDocument = Partial<
  Record<DocumentDI, VaultDocumentData | VaultEncryptedData | VaultEmptyData>
>;

export type VaultImage = Partial<
  Record<DocumentDI, VaultImageData | VaultEncryptedData | VaultEmptyData>
>;

export const isVaultDataEncrypted = (data: any): data is VaultEncryptedData =>
  data === null;

export const isVaultDataEmpty = (data: any): data is VaultEmptyData =>
  data === undefined;

export const isVaultDataDecrypted = (data: any): data is VaultEncryptedData =>
  data !== null && data !== undefined;

export const isVaultDataText = (data: any): data is VaultTextData =>
  typeof data === 'string';

export const isVaultDataDocument = (data: any): data is VaultDocumentData => {
  if (typeof data !== 'object') return false;
  if (typeof data?.name !== 'string' || typeof data?.content !== 'object') {
    return false;
  }
  return true;
};

export const isVaultDataImage = (data: any): data is VaultImageData => {
  if (typeof data !== 'object') return false;
  if (typeof data?.name !== 'string' || typeof data?.src !== 'string') {
    return false;
  }
  return true;
};
