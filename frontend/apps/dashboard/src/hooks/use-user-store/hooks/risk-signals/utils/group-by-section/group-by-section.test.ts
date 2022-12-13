import { SignalAttribute } from '@onefootprint/types';

import groupBySection from './group-by-section';
import createRiskSignal from './group-by-section.test.config';

describe('groupBySection', () => {
  it('should group correctly', () => {
    const onlyBasic = groupBySection([
      createRiskSignal([SignalAttribute.email]),
      createRiskSignal([SignalAttribute.phoneNumber]),
    ]);
    expect(onlyBasic.basic).toHaveLength(2);
    expect(onlyBasic.identity).toHaveLength(0);
    expect(onlyBasic.address).toHaveLength(0);

    const onlyIdentity = groupBySection([
      createRiskSignal([SignalAttribute.ssn]),
      createRiskSignal([SignalAttribute.dob]),
    ]);
    expect(onlyIdentity.basic).toHaveLength(0);
    expect(onlyIdentity.identity).toHaveLength(2);
    expect(onlyIdentity.address).toHaveLength(0);

    const onlyAddress = groupBySection([
      createRiskSignal([SignalAttribute.country]),
      createRiskSignal([SignalAttribute.city]),
      createRiskSignal([SignalAttribute.state]),
    ]);
    expect(onlyAddress.basic).toHaveLength(0);
    expect(onlyAddress.identity).toHaveLength(0);
    expect(onlyAddress.address).toHaveLength(3);

    const basicAndIdentity = groupBySection([
      createRiskSignal([SignalAttribute.name]),
      createRiskSignal([SignalAttribute.dob]),
    ]);
    expect(basicAndIdentity.basic).toHaveLength(1);
    expect(basicAndIdentity.identity).toHaveLength(1);
    expect(basicAndIdentity.address).toHaveLength(0);

    const basicAndIdentity2 = groupBySection([
      createRiskSignal([SignalAttribute.name, SignalAttribute.email]),
      createRiskSignal([SignalAttribute.dob]),
    ]);
    expect(basicAndIdentity2.basic).toHaveLength(2);
    expect(basicAndIdentity2.identity).toHaveLength(1);
    expect(basicAndIdentity2.address).toHaveLength(0);

    const oneOfEach = groupBySection([
      createRiskSignal([SignalAttribute.email]),
      createRiskSignal([SignalAttribute.dob]),
      createRiskSignal([SignalAttribute.city]),
    ]);
    expect(oneOfEach.basic).toHaveLength(1);
    expect(oneOfEach.identity).toHaveLength(1);
    expect(oneOfEach.address).toHaveLength(1);

    const basicAndAddress = groupBySection([
      createRiskSignal([SignalAttribute.streetAddress, SignalAttribute.name]),
    ]);
    expect(basicAndAddress.basic).toHaveLength(1);
    expect(basicAndAddress.identity).toHaveLength(0);
    expect(basicAndAddress.address).toHaveLength(1);
  });
});
