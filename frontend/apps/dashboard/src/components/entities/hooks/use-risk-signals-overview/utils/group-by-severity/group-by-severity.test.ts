import { RiskSignalSeverity } from '@onefootprint/types';

import groupBySeverity from './group-by-severity';
import createRiskSignal from './group-by-severity.test.config';

describe('groupBySeverity', () => {
  it('should group correctly', () => {
    const onlyLow = groupBySeverity([
      createRiskSignal(RiskSignalSeverity.Low),
      createRiskSignal(RiskSignalSeverity.Low),
      createRiskSignal(RiskSignalSeverity.Low),
    ]);
    expect(onlyLow.low).toHaveLength(3);
    expect(onlyLow.medium).toHaveLength(0);
    expect(onlyLow.high).toHaveLength(0);

    const onlyMedium = groupBySeverity([createRiskSignal(RiskSignalSeverity.Medium)]);
    expect(onlyMedium.low).toHaveLength(0);
    expect(onlyMedium.medium).toHaveLength(1);
    expect(onlyMedium.high).toHaveLength(0);

    const onlyHigh = groupBySeverity([
      createRiskSignal(RiskSignalSeverity.High),
      createRiskSignal(RiskSignalSeverity.High),
    ]);
    expect(onlyHigh.low).toHaveLength(0);
    expect(onlyHigh.medium).toHaveLength(0);
    expect(onlyHigh.high).toHaveLength(2);

    const lowAndMedium = groupBySeverity([
      createRiskSignal(RiskSignalSeverity.Low),
      createRiskSignal(RiskSignalSeverity.Medium),
    ]);
    expect(lowAndMedium.low).toHaveLength(1);
    expect(lowAndMedium.medium).toHaveLength(1);
    expect(lowAndMedium.high).toHaveLength(0);

    const lowAndHigh = groupBySeverity([
      createRiskSignal(RiskSignalSeverity.Low),
      createRiskSignal(RiskSignalSeverity.High),
      createRiskSignal(RiskSignalSeverity.High),
    ]);
    expect(lowAndHigh.low).toHaveLength(1);
    expect(lowAndHigh.medium).toHaveLength(0);
    expect(lowAndHigh.high).toHaveLength(2);

    const oneOfEach = groupBySeverity([
      createRiskSignal(RiskSignalSeverity.Low),
      createRiskSignal(RiskSignalSeverity.Medium),
      createRiskSignal(RiskSignalSeverity.High),
    ]);
    expect(oneOfEach.low).toHaveLength(1);
    expect(oneOfEach.medium).toHaveLength(1);
    expect(oneOfEach.high).toHaveLength(1);
  });
});
