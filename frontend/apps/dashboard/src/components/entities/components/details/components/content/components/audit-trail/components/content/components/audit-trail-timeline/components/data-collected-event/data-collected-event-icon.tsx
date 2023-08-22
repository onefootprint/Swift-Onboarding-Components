import {
  IcoBuilding16,
  IcoCheckCircle16,
  IcoDollar16,
  IcoEmail16,
  IcoFlag16,
  Icon,
  IcoPhone16,
  IcoStore16,
  IcoUserCircle16,
} from '@onefootprint/icons';
import {
  CollectedDataEventData,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';
import React from 'react';

type DataCollectedEventIconProps = {
  data: CollectedDataEventData;
};

const iconForAttribute: Record<
  | CollectedKycDataOption
  | CollectedKybDataOption
  | CollectedInvestorProfileDataOption,
  Icon
> = {
  [CollectedKycDataOption.name]: IcoUserCircle16,
  [CollectedKycDataOption.email]: IcoEmail16,
  [CollectedKycDataOption.phoneNumber]: IcoPhone16,
  [CollectedKycDataOption.ssn4]: IcoUserCircle16,
  [CollectedKycDataOption.ssn9]: IcoUserCircle16,
  [CollectedKycDataOption.dob]: IcoUserCircle16,
  [CollectedKycDataOption.fullAddress]: IcoBuilding16,
  [CollectedKycDataOption.partialAddress]: IcoBuilding16,
  [CollectedKycDataOption.nationality]: IcoFlag16,
  [CollectedKycDataOption.usLegalStatus]: IcoCheckCircle16, // placeholder, will use IcoGlobe
  [CollectedKybDataOption.name]: IcoStore16,
  [CollectedKybDataOption.tin]: IcoStore16,
  [CollectedKybDataOption.address]: IcoBuilding16,
  [CollectedKybDataOption.phoneNumber]: IcoPhone16,
  [CollectedKybDataOption.website]: IcoStore16,
  [CollectedKybDataOption.corporationType]: IcoStore16,
  [CollectedKybDataOption.beneficialOwners]: IcoStore16,
  [CollectedKybDataOption.kycedBeneficialOwners]: IcoStore16,
  [CollectedInvestorProfileDataOption.investorProfile]: IcoDollar16,
};

const DataCollectedEventIcon = ({ data }: DataCollectedEventIconProps) => {
  const icons = data.attributes.map(attribute => iconForAttribute[attribute]);
  const HeaderIcon = icons
    .sort(
      (a: Icon, b: Icon) =>
        icons.filter(v => v === a).length - icons.filter(v => v === b).length,
    )
    .pop();
  return HeaderIcon ? <HeaderIcon /> : <IcoUserCircle16 />;
};

export default DataCollectedEventIcon;
