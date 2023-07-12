import {
  IcoBuilding16,
  IcoCake16,
  IcoEmail16,
  IcoFileText16,
  IcoFileText216,
  IcoPhone16,
  IcoUser16,
} from '@onefootprint/icons';
import { MatchSignalAttribute } from '@onefootprint/types/src/data/match-signal-attribute';
import React from 'react';

type ValidationTimelineItemIconProps = {
  attribute: string;
};

const ValidationTimelineItemIcon = ({
  attribute,
}: ValidationTimelineItemIconProps) => {
  if (attribute === MatchSignalAttribute.name) {
    return <IcoUser16 />;
  }
  if (attribute === MatchSignalAttribute.email) {
    return <IcoEmail16 />;
  }
  if (attribute === MatchSignalAttribute.phone) {
    return <IcoPhone16 />;
  }
  if (attribute === MatchSignalAttribute.address) {
    return <IcoBuilding16 />;
  }
  if (attribute === MatchSignalAttribute.dob) {
    return <IcoCake16 />;
  }
  if (attribute === MatchSignalAttribute.ssn) {
    return <IcoFileText216 />;
  }
  if (attribute === MatchSignalAttribute.document) {
    return <IcoFileText16 />;
  }
  return null;
};

export default ValidationTimelineItemIcon;
