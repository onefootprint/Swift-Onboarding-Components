export enum OrganizationSize {
  s1_to10 = `s1_to10`,
  s11_to50 = `s11_to50`,
  s51_to100 = `s51_to100`,
  s101_to1000 = `s101_to1000`,
  s1001_plus = `s1001_plus`,
}

export type Organization = {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  companySize: OrganizationSize | null;
  isSandboxRestricted: boolean;
};
