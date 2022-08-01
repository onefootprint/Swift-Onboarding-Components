import type { Icon } from 'icons';
import IcoBuilding16 from 'icons/ico/ico-building-16';
import IcoCheck16 from 'icons/ico/ico-check-16';
import IcoFootprint16 from 'icons/ico/ico-footprint-16';
import IcoPhone16 from 'icons/ico/ico-phone-16';
import IcoUser16 from 'icons/ico/ico-user-16';
import React from 'react';
import { TimelineItem } from 'src/components/timeline/timeline';
import {
  AuditTrail,
  AuditTrailEvent,
  DataKind,
  dataKindToDisplayName,
  LivenessCheckInfo,
  Vendor,
  vendorToDisplayName,
  VerificationInfo,
} from 'src/types';
import { Tag, Typography } from 'ui';

const iconForDataKind = {
  [DataKind.firstName]: IcoUser16,
  [DataKind.lastName]: IcoUser16,
  [DataKind.email]: IcoUser16,
  [DataKind.phoneNumber]: IcoPhone16,
  [DataKind.ssn]: IcoUser16,
  [DataKind.lastFourSsn]: IcoUser16,
  [DataKind.dob]: IcoUser16,
  [DataKind.streetAddress]: IcoBuilding16,
  [DataKind.streetAddress2]: IcoBuilding16,
  [DataKind.city]: IcoBuilding16,
  [DataKind.state]: IcoBuilding16,
  [DataKind.zip]: IcoBuilding16,
  [DataKind.country]: IcoBuilding16,
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
    return {
      iconComponent: <IcoFootprint16 />,
      headerComponent: (
        <Typography variant="label-3" color="success">
          Verified by Footprint
        </Typography>
      ),
    };
  }
  // Show the icon that represents the most fields
  const icons = data.dataKinds.map(dataKind => iconForDataKind[dataKind]);
  const HeaderIcon = icons
    .sort(
      (a: Icon, b: Icon) =>
        icons.filter(v => v === a).length - icons.filter(v => v === b).length,
    )
    .pop()!;
  const iconComponent = <HeaderIcon />;
  const headerComponent = (
    <Typography variant="body-3">
      <>
        {data.dataKinds.map((dataKind, i: number) => (
          <React.Fragment key={dataKind}>
            <Tag>{dataKindToDisplayName[dataKind]}</Tag>
            {i !== data.dataKinds.length - 1 ? ', ' : ''}
          </React.Fragment>
        ))}{' '}
        verified by{' '}
        <Typography variant="label-3" as="span">
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
