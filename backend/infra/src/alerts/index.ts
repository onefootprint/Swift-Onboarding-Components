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

  const slackRecipientChannel = recipientSlackChannel[stackMeta.environment];
  const slackRecipient: Recipient | undefined = slackRecipientChannel
    ? {
        type: 'slack',
        target: slackRecipientChannel,
      }
    : undefined;

  const pagerRecipient: Recipient | undefined =
    stackMeta.environment === StackEnvironment.Prod
      ? {
          type: 'webhook',
          target: 'OpsGenie',
        }
      : undefined;

  console.log(pagerRecipient);

  for (const alert of Alerts) {
    const { datasetName, slackThreshold, pageThreshold, name, ...trigger } =
      alert;
    const nameHyphen = name.replace(/ /g, '-');
    const commonName = `alert-${stackMeta.shortStackName}-${nameHyphen}`;
    // Create a slack trigger
    if (slackThreshold && slackRecipient) {
      new TriggerResource(`${commonName}-slack`, {
        apiKey,
        datasetName: datasetName,
        trigger: {
          alert_type: 'on_change',
          evaluation_schedule_type: 'frequency',
          frequency: 60, // Evaluate once per minute
          name: `[WARNING] ${name}`,
          recipients: [slackRecipient],
          threshold: slackThreshold,
          ...trigger,
        },
      });
    }
    // Create a pager trigger
    if (pageThreshold && pagerRecipient) {
      new TriggerResource(`${commonName}-pager`, {
        apiKey,
        datasetName: datasetName,
        trigger: {
          alert_type: 'on_change',
          evaluation_schedule_type: 'frequency',
          frequency: 60, // Evaluate once per minute
          name: `[CRITICAL] ${name}`,
          recipients: [pagerRecipient],
          threshold: pageThreshold,
          ...trigger,
        },
      });
    }
  }
}
