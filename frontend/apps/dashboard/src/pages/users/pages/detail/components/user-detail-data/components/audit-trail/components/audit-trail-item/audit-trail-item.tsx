import {
  IcoBuilding16,
  IcoCheck16,
  IcoFileText16,
  IcoFootprint16,
  IcoLaptop16,
  Icon,
  IcoPhone16,
  IcoUser16,
} from '@onefootprint/icons';
import {
  AuditTrail,
  AuditTrailEvent,
  LivenessCheckInfo,
  SignalAttribute,
  signalAttributeToDisplayName,
  Vendor,
  vendorToDisplayName,
  VerificationInfo,
  VerificationInfoStatus,
  verificationInfoStatusToDisplayName,
} from '@onefootprint/types';
import React from 'react';
import { TimelineItem } from 'src/components/timeline/timeline';
import { Tag, Typography } from 'ui';

const iconForAttribute: Record<SignalAttribute, Icon> = {
  [SignalAttribute.name]: IcoUser16,
  [SignalAttribute.email]: IcoUser16,
  [SignalAttribute.phoneNumber]: IcoPhone16,
  [SignalAttribute.ssn]: IcoUser16,
  [SignalAttribute.dob]: IcoUser16,
  [SignalAttribute.address]: IcoBuilding16,
  [SignalAttribute.streetAddress]: IcoBuilding16,
  [SignalAttribute.city]: IcoBuilding16,
  [SignalAttribute.state]: IcoBuilding16,
  [SignalAttribute.zip]: IcoBuilding16,
  [SignalAttribute.country]: IcoBuilding16,

  [SignalAttribute.identity]: IcoUser16,
  [SignalAttribute.ipAddress]: IcoLaptop16,
  [SignalAttribute.document]: IcoFileText16,
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
  const icons = data.attributes.map(attribute => iconForAttribute[attribute]);
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
  const text = verificationInfoStatusToDisplayName[data.status];
  const color =
    data.status === VerificationInfoStatus.Verified ? 'neutral' : 'error';
  const headerComponent = (
    <Typography variant="body-3">
      <>
        {data.attributes.map((userAttribute, i: number) => (
          <React.Fragment key={userAttribute}>
            <Tag>{signalAttributeToDisplayName[userAttribute]}</Tag>
            {i !== data.attributes.length - 1 ? ', ' : ''}
          </React.Fragment>
        ))}
        <Typography variant="label-3" as="span" color={color}>
          {` ${text} `}
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
