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
  dataKindToDisplayName,
  LivenessCheckInfo,
  Vendor,
  vendorToDisplayName,
  VerificationInfo,
  VerificationInfoStatus,
} from 'src/types';
import { UserDataAttribute } from 'types';
import { Tag, Typography } from 'ui';

const iconForDataKind = {
  [UserDataAttribute.firstName]: IcoUser16,
  [UserDataAttribute.lastName]: IcoUser16,
  [UserDataAttribute.email]: IcoUser16,
  [UserDataAttribute.phone]: IcoPhone16,
  [UserDataAttribute.ssn9]: IcoUser16,
  [UserDataAttribute.ssn4]: IcoUser16,
  [UserDataAttribute.dob]: IcoUser16,
  [UserDataAttribute.addressLine1]: IcoBuilding16,
  [UserDataAttribute.addressLine2]: IcoBuilding16,
  [UserDataAttribute.city]: IcoBuilding16,
  [UserDataAttribute.state]: IcoBuilding16,
  [UserDataAttribute.zip]: IcoBuilding16,
  [UserDataAttribute.country]: IcoBuilding16,
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
    .pop();
  if (!HeaderIcon) {
    return {
      headerComponent: null,
      iconComponent: null,
    };
  }

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
