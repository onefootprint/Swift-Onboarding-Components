import type { RiskSignal } from '@onefootprint/types';
import { RiskSignalAttribute } from '@onefootprint/types';

const groupBySection = (risksSignals: RiskSignal[]) => {
  const sections: {
    basic: RiskSignal[];
    identity: RiskSignal[];
    address: RiskSignal[];
    document: RiskSignal[];
  } = {
    basic: [],
    identity: [],
    address: [],
    document: [],
  };
  risksSignals.forEach(riskSignal => {
    if (riskSignal.scopes.some(signalAttribute => isBasic(signalAttribute))) {
      sections.basic.push(riskSignal);
    }
    if (riskSignal.scopes.some(signalAttribute => isIdentity(signalAttribute))) {
      sections.identity.push(riskSignal);
    }
    if (riskSignal.scopes.some(signalAttribute => isAddress(signalAttribute))) {
      sections.address.push(riskSignal);
    }
    if (riskSignal.scopes.some(signalAttribute => isDocument(signalAttribute))) {
      sections.document.push(riskSignal);
    }
  });
  return sections;
};

const isBasic = (signalAttribute: RiskSignalAttribute) => {
  if (
    signalAttribute === RiskSignalAttribute.name ||
    signalAttribute === RiskSignalAttribute.email ||
    signalAttribute === RiskSignalAttribute.phoneNumber
  ) {
    return true;
  }
  return false;
};

const isIdentity = (signalAttribute: RiskSignalAttribute) => {
  if (signalAttribute === RiskSignalAttribute.ssn || signalAttribute === RiskSignalAttribute.dob) {
    return true;
  }
  return false;
};

const isAddress = (signalAttribute: RiskSignalAttribute) => {
  if (
    signalAttribute === RiskSignalAttribute.address ||
    signalAttribute === RiskSignalAttribute.city ||
    signalAttribute === RiskSignalAttribute.country ||
    signalAttribute === RiskSignalAttribute.state ||
    signalAttribute === RiskSignalAttribute.streetAddress ||
    signalAttribute === RiskSignalAttribute.zip
  ) {
    return true;
  }
  return false;
};

const isDocument = (signalAttribute: RiskSignalAttribute) =>
  signalAttribute === RiskSignalAttribute.document || signalAttribute === RiskSignalAttribute.selfie;

export default groupBySection;
