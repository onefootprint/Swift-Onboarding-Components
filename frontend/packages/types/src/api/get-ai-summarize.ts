export type GetAiSummarizeRequest = {
  entityId: string;
};

export type GetAiSummarizeResponse = {
  highLevelSummary: string;
  detailedSummary: string;
  riskSignalSummary: string;
  conclusion: string;
};
