export enum Vendor {
  footprint = 'footprint',
  idology = 'idology',
  socure = 'socure',
  lexisNexis = 'lexis_nexis',
  experian = 'experian',
}
export const vendorToDisplayName: Record<Vendor, String> = {
  [Vendor.footprint]: 'Footprint',
  [Vendor.idology]: 'IDology',
  [Vendor.socure]: 'Socure',
  [Vendor.lexisNexis]: 'LexisNexis',
  [Vendor.experian]: 'Experian',
};
