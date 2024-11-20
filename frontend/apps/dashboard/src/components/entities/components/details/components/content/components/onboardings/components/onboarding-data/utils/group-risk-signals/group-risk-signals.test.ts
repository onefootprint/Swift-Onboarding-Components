import groupRiskSignals from '../group-risk-signals';
import { riskSignalsFixture, sameSeverityRiskSignalsFixture } from './group-risk-signals.test.config';

describe('groupRiskSignals', () => {
  it('should group risk signals by their group', () => {
    const groupedSignals = groupRiskSignals(riskSignalsFixture);

    expect(Object.keys(groupedSignals)).toContain('aml');
    expect(Object.keys(groupedSignals)).toContain('web_device');
    expect(Object.keys(groupedSignals)).toContain('kyc');
    expect(groupedSignals.aml).toHaveLength(2);
    expect(groupedSignals.web_device).toHaveLength(1);
    expect(groupedSignals.kyc).toHaveLength(2);
  });

  it('should sort signals within each group by severity (high to low)', () => {
    const groupedSignals = groupRiskSignals(riskSignalsFixture);

    expect(groupedSignals.aml[0].severity).toBe('medium');
    expect(groupedSignals.aml[1].severity).toBe('low');
    expect(groupedSignals.web_device[0].severity).toBe('high');
    expect(groupedSignals.kyc[0].severity).toBe('high');
    expect(groupedSignals.kyc[1].severity).toBe('info');
  });

  it('should handle signals with all same severity', () => {
    const groupedSignals = groupRiskSignals(sameSeverityRiskSignalsFixture);

    expect(groupedSignals.behavior).toHaveLength(3);
    expect(groupedSignals.behavior[0].severity).toBe('low');
    expect(groupedSignals.behavior[1].severity).toBe('low');
    expect(groupedSignals.behavior[2].severity).toBe('low');
  });
});
