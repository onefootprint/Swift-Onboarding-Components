import {
  IcoBuilding16,
  IcoEmail16,
  Icon,
  IcoPhone16,
  IcoUserCircle16,
} from '@onefootprint/icons';
import {
  CollectedKycDataEventData,
  CollectedKycDataOption,
} from '@onefootprint/types';
import React from 'react';

type KycDataCollectedEventIconProps = {
  data: CollectedKycDataEventData;
};

const iconForAttribute: Record<CollectedKycDataOption, Icon> = {
  [CollectedKycDataOption.name]: IcoUserCircle16,
  [CollectedKycDataOption.email]: IcoEmail16,
  [CollectedKycDataOption.phoneNumber]: IcoPhone16,
  [CollectedKycDataOption.ssn4]: IcoUserCircle16,
  [CollectedKycDataOption.ssn9]: IcoUserCircle16,
  [CollectedKycDataOption.dob]: IcoUserCircle16,
  [CollectedKycDataOption.fullAddress]: IcoBuilding16,
  [CollectedKycDataOption.partialAddress]: IcoBuilding16,
};

const KycDataCollectedEventIcon = ({
  data,
}: KycDataCollectedEventIconProps) => {
  const icons = data.attributes.map(attribute => iconForAttribute[attribute]);
  const HeaderIcon = icons
    .sort(
      (a: Icon, b: Icon) =>
        icons.filter(v => v === a).length - icons.filter(v => v === b).length,
    )
    .pop();
  return HeaderIcon ? <HeaderIcon /> : <IcoUserCircle16 />;
};

export default KycDataCollectedEventIcon;
