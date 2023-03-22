import { DecryptedIdDoc } from './decrypted-id-doc';
import { IdDI, InvestorProfileDI } from './di';
import IdDocDI from './id-doc-data-attribute';

export type VaultText = string | null | undefined;
export type VaultIdDoc = DecryptedIdDoc[] | null | undefined;

export type VaultIdKeys = IdDI;
export type VaultId = Partial<Record<IdDI, VaultText>>;

export type VaultInvestorProfileKey = InvestorProfileDI;
export type VaultInvestorProfile = Partial<
  Record<VaultInvestorProfileKey, VaultText>
>;

export type VaultIdDocumentKey = IdDocDI;
export type VaultIdDocument = Partial<Record<VaultIdDocumentKey, VaultIdDoc>>;

export type Vault = {
  id: VaultId;
  idDoc: VaultIdDocument;
  investorProfile: VaultInvestorProfile;
};
