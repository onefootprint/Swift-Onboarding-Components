import { OrganizationSize } from '@onefootprint/types';

const SIZE_OPTIONS = [
  { value: OrganizationSize.s1_to10, label: '1-10' },
  { value: OrganizationSize.s11_to50, label: '11-50' },
  { value: OrganizationSize.s51_to100, label: '51-100' },
  { value: OrganizationSize.s101_to1000, label: '101-1000' },
  { value: OrganizationSize.s1001_plus, label: '> 1000' },
];

export default SIZE_OPTIONS;
