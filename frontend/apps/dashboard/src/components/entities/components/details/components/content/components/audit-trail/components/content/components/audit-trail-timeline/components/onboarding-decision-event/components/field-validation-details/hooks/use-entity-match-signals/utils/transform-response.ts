import { GetEntityMatchSignalsResponse, MatchLevel } from '@onefootprint/types';

export type SignalShortInfoType = {
  matchLevel: MatchLevel;
  description: string;
};

export type TransformedMatchSignalDataType = {
  attribute: string;
  matchLevel: MatchLevel;
  signals: SignalShortInfoType[];
};

const transformResponse = (data: GetEntityMatchSignalsResponse) => {
  const dataArray = Object.entries(data);
  const transformedData: TransformedMatchSignalDataType[] = [];

  dataArray.forEach(([attribute, signalsAndLevel]) => {
    if (signalsAndLevel) {
      const { matchLevel, signals } = signalsAndLevel;

      const signalInfo: SignalShortInfoType[] = [];
      signals.forEach(signal => {
        const { description, matchLevel: signalMatchLevel } = signal;
        signalInfo.push({ matchLevel: signalMatchLevel, description });
      });
      transformedData.push({
        attribute,
        matchLevel,
        signals: signalInfo,
      });
    }
  });

  return transformedData;
};

export default transformResponse;
