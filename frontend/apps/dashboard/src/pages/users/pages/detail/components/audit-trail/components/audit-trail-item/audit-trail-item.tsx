import type { Icon } from 'icons';
import {
  IcoBuilding16,
  IcoCheck16,
  IcoFootprint16,
  IcoPhone16,
  IcoUser16,
} from 'icons';
import React from 'react';
import { TimelineItem } from 'src/components/timeline/timeline';
import {
  AuditTrail,
  AuditTrailEvent,
  DataKinds,
  dataKindToDisplayName,
  LivenessCheckInfo,
  Vendor,
  vendorToDisplayName,
  VerificationInfo,
  VerificationInfoStatus,
} from 'src/types';
import { Tag, Typography } from 'ui';

const iconForDataKind = {
  [DataKinds.firstName]: IcoUser16,
  [DataKinds.lastName]: IcoUser16,
  [DataKinds.email]: IcoUser16,
  [DataKinds.phoneNumber]: IcoPhone16,
  [DataKinds.ssn9]: IcoUser16,
  [DataKinds.ssn4]: IcoUser16,
  [DataKinds.dob]: IcoUser16,
  [DataKinds.addressLine1]: IcoBuilding16,
  [DataKinds.addressLine2]: IcoBuilding16,
  [DataKinds.city]: IcoBuilding16,
  [DataKinds.state]: IcoBuilding16,
  [DataKinds.zip]: IcoBuilding16,
  [DataKinds.country]: IcoBuilding16,
};

const detailsForLivenessEvent = (data: LivenessCheckInfo) => ({
  headerComponent: (
    <Typography variant="label-3">Liveness checks succeeded</Typography>
  ),
  iconComponent: <IcoCheck16 />,
  bodyComponent: (
    <>
      <Typography variant="body-3" color="secondary">
        • Attested by {data.attestations.join(' & ')}
      </Typography>
      <Typography variant="body-3" color="secondary">
        • {data.device}
        {data.os && `, ${data.os}`}
      </Typography>
      {data.ipAddress && (
        <Typography variant="body-3" color="secondary">
          • {data.ipAddress} (IP address)
        </Typography>
      )}
      {data.location && (
        <Typography variant="body-3" color="secondary">
          • {data.location}
        </Typography>
      )}
    </>
  ),
});

const detailsForVerificationEvent = (data: VerificationInfo) => {
  if (data.vendor === Vendor.footprint) {
    const color =
      data.status === VerificationInfoStatus.Verified ? 'success' : 'error';
    const text =
      data.status === VerificationInfoStatus.Verified
        ? 'Verified by Footprint'
        : 'Could not be verified by Footprint';
    return {
      iconComponent: <IcoFootprint16 />,
      headerComponent: (
        <Typography variant="label-3" color={color}>
          {text}
        </Typography>
      ),
    };
  }
  // Show the icon that represents the most fields
  const icons = data.dataAttributes.map(dataKind => iconForDataKind[dataKind]);
  const HeaderIcon = icons
    .sort(
      (a: Icon, b: Icon) =>
        icons.filter(v => v === a).length - icons.filter(v => v === b).length,
    )
    .pop()!;
  const iconComponent = <HeaderIcon />;
  const text =
    data.status === VerificationInfoStatus.Verified
      ? ' verified by '
      : ' marked as fraudulent by ';
  const color =
    data.status === VerificationInfoStatus.Verified ? 'neutral' : 'error';
  const headerComponent = (
    <Typography variant="body-3">
      <>
        {data.dataAttributes.map((dataKind, i: number) => (
          <React.Fragment key={dataKind}>
            <Tag>{dataKindToDisplayName[dataKind]}</Tag>
            {i !== data.dataAttributes.length - 1 ? ', ' : ''}
          </React.Fragment>
        ))}
        <Typography variant="label-3" as="span" color={color}>
          {text}
        </Typography>
        <Typography variant="label-3" as="span" color={color}>
          {vendorToDisplayName[data.vendor]}
        </Typography>
      </>
    </Typography>
  );
  return {
    headerComponent,
    iconComponent,
  };
};

const detailsForEvent = (event: AuditTrailEvent) => {
  if (event.kind === 'liveness_check') {
    return detailsForLivenessEvent(event.data as LivenessCheckInfo);
  }
  if (event.kind === 'verification') {
    return detailsForVerificationEvent(event.data as VerificationInfo);
  }
  return {};
};

const auditTrailItem = (item: AuditTrail) =>
  ({
    timestamp: item.timestamp,
    ...detailsForEvent(item.event),
  } as TimelineItem);

export default auditTrailItem;
