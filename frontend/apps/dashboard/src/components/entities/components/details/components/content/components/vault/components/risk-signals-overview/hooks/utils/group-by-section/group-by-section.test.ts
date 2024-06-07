import { RiskSignalAttribute } from '@onefootprint/types';

import groupBySection from './group-by-section';
import createRiskSignal from './group-by-section.test.config';

describe('groupBySection', () => {
  it('should group correctly', () => {
    const onlyBasic = groupBySection([
      createRiskSignal([RiskSignalAttribute.email]),
      createRiskSignal([RiskSignalAttribute.phoneNumber]),
    ]);
    expect(onlyBasic.basic).toHaveLength(2);
    expect(onlyBasic.identity).toHaveLength(0);
    expect(onlyBasic.address).toHaveLength(0);

    const onlyIdentity = groupBySection([
      createRiskSignal([RiskSignalAttribute.ssn]),
      createRiskSignal([RiskSignalAttribute.dob]),
    ]);
    expect(onlyIdentity.basic).toHaveLength(0);
    expect(onlyIdentity.identity).toHaveLength(2);
    expect(onlyIdentity.address).toHaveLength(0);

    const onlyAddress = groupBySection([
      createRiskSignal([RiskSignalAttribute.country]),
      createRiskSignal([RiskSignalAttribute.city]),
      createRiskSignal([RiskSignalAttribute.state]),
    ]);
    expect(onlyAddress.basic).toHaveLength(0);
    expect(onlyAddress.identity).toHaveLength(0);
    expect(onlyAddress.address).toHaveLength(3);

    const basicAndIdentity = groupBySection([
      createRiskSignal([RiskSignalAttribute.name]),
      createRiskSignal([RiskSignalAttribute.dob]),
    ]);
    expect(basicAndIdentity.basic).toHaveLength(1);
    expect(basicAndIdentity.identity).toHaveLength(1);
    expect(basicAndIdentity.address).toHaveLength(0);

    const basicAndIdentity2 = groupBySection([
      createRiskSignal([RiskSignalAttribute.name, RiskSignalAttribute.email]),
      createRiskSignal([RiskSignalAttribute.dob]),
    ]);
    expect(basicAndIdentity2.basic).toHaveLength(1);
    expect(basicAndIdentity2.identity).toHaveLength(1);
    expect(basicAndIdentity2.address).toHaveLength(0);

    const oneOfEach = groupBySection([
      createRiskSignal([RiskSignalAttribute.email]),
      createRiskSignal([RiskSignalAttribute.dob]),
      createRiskSignal([RiskSignalAttribute.city]),
    ]);
    expect(oneOfEach.basic).toHaveLength(1);
    expect(oneOfEach.identity).toHaveLength(1);
    expect(oneOfEach.address).toHaveLength(1);

    const basicAndAddress = groupBySection([
      createRiskSignal([RiskSignalAttribute.streetAddress, RiskSignalAttribute.name]),
    ]);
    expect(basicAndAddress.basic).toHaveLength(1);
    expect(basicAndAddress.identity).toHaveLength(0);
    expect(basicAndAddress.address).toHaveLength(1);
  });
});
