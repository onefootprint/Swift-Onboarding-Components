export type UserInsights = {
  description: string;
  name: string;
  scope: 'device' | 'workflow' | 'behavior';
  value: string;
  unit: UserInsightsUnit;
};

export enum UserInsightsUnit {
  TimeInMs = 'duration_ms',
  Number = 'number',
  String = 'string',
  Boolean = 'boolean',
}
