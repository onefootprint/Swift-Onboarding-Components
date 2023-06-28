import * as pulumi from '@pulumi/pulumi';
import { Recipient } from './trigger';
import { TriggerResource } from './provider';
import { Alerts } from './alerts';
import { StackEnvironment, StackMetadata } from '../stack_metadata';

const recipientSlackChannel: Partial<Record<StackEnvironment, string>> = {
  [StackEnvironment.Dev]: '#honeycomb-backend-dev',
  [StackEnvironment.Prod]: '#honeycomb-backend',
};

type HoneycombSecrets = {
  apiKey: string;
};

export function ConfigureAlerts(stackMeta: StackMetadata) {
  let config = new pulumi.Config();
  let honeycombSecrets = config.getSecretObject<HoneycombSecrets>('honeycomb');
  if (!honeycombSecrets) {
    throw 'Missing Honeycomb API key from secrets config';
  }
  const apiKey = honeycombSecrets.apiKey;

  if (new Set(Alerts.map(a => a.name)).size != Alerts.length) {
    throw 'Alerts must have unique `name`s';
  }

  const recipientChannel = recipientSlackChannel[stackMeta.environment];
  if (!recipientChannel) {
    // We don't need to set alerts up for ephemeral environments
    return;
  }

  const recipients: Recipient[] = [
    {
      type: 'slack',
      target: recipientChannel,
    },
  ];

  for (const alert of Alerts) {
    const { datasetName, ...trigger } = alert;
    const nameHyphen = alert.name.replace(/ /g, '-');
    const name = `alert-${stackMeta.shortStackName}-${nameHyphen}`;
    new TriggerResource(name, {
      apiKey,
      datasetName: datasetName,
      trigger: {
        alert_type: 'on_change',
        evaluation_schedule_type: 'frequency',
        frequency: 60, // Evaluate once per minute
        recipients,
        ...trigger,
      },
    });
  }
}
