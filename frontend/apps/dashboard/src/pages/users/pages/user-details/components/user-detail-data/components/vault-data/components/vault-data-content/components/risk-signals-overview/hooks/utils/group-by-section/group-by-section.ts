import { RiskSignal, SignalAttribute } from '@onefootprint/types';

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
    riskSignal.scopes.forEach(signalAttribute => {
      if (isBasic(signalAttribute)) {
        sections.basic.push(riskSignal);
      }
      if (isIdentity(signalAttribute)) {
        sections.identity.push(riskSignal);
      }
      if (isAddress(signalAttribute)) {
        sections.address.push(riskSignal);
      }
      if (isDocument(signalAttribute)) {
        sections.document.push(riskSignal);
      }
    });
  });
  return sections;
};

const isBasic = (signalAttribute: SignalAttribute) => {
  if (
    signalAttribute === SignalAttribute.name ||
    signalAttribute === SignalAttribute.email ||
    signalAttribute === SignalAttribute.phoneNumber
  ) {
    return true;
  }
  return false;
};

const isIdentity = (signalAttribute: SignalAttribute) => {
  if (
    signalAttribute === SignalAttribute.ssn ||
    signalAttribute === SignalAttribute.dob
  ) {
    return true;
  }
  return false;
};

const isAddress = (signalAttribute: SignalAttribute) => {
  if (
    signalAttribute === SignalAttribute.address ||
    signalAttribute === SignalAttribute.city ||
    signalAttribute === SignalAttribute.country ||
    signalAttribute === SignalAttribute.state ||
    signalAttribute === SignalAttribute.streetAddress ||
    signalAttribute === SignalAttribute.zip
  ) {
    return true;
  }
  return false;
};

const isDocument = (signalAttribute: SignalAttribute) =>
  signalAttribute === SignalAttribute.document;

export default groupBySection;
