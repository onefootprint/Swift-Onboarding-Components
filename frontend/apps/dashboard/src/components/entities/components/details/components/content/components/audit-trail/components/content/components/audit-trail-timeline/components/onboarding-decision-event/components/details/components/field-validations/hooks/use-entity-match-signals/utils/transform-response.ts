import type { GetEntityMatchSignalsResponse, MatchLevel } from '@onefootprint/types';

export type SignalShortInfoType = {
  matchLevel: MatchLevel;
  description: string;
  reasonCode: string;
};

export type TransformedMatchSignalDataType = {
  attribute: string;
  matchLevel: MatchLevel;
  signals: SignalShortInfoType[];
};

const filterUniqueSignals = (signals: SignalShortInfoType[]) => {
  const descriptions = new Set<string>();
  return signals.filter(signal => {
    if (descriptions.has(signal.description)) {
      return false;
    }
    descriptions.add(signal.description);
    return true;
  });
};

const transformResponse = (data: GetEntityMatchSignalsResponse) => {
  const dataArray = Object.entries(data);
  const transformedData: TransformedMatchSignalDataType[] = [];

  dataArray.forEach(([attribute, signalsAndLevel]) => {
    if (signalsAndLevel) {
      const { matchLevel, signals } = signalsAndLevel;
      const signalInfo: SignalShortInfoType[] = [];
      signals.forEach(signal => {
        const { description, matchLevel: signalMatchLevel, reasonCode } = signal;
        signalInfo.push({
          matchLevel: signalMatchLevel,
          description,
          reasonCode,
        });
      });
      const dedupedSignals = filterUniqueSignals(signalInfo);
      transformedData.push({
        attribute,
        matchLevel,
        signals: dedupedSignals,
      });
    }
  });

  return transformedData;
};

export default transformResponse;
