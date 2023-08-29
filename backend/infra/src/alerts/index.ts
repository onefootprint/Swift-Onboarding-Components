import * as pulumi from '@pulumi/pulumi';
import { Recipient } from './trigger';
import { TriggerResource } from './provider';
import { generateAlerts } from './alerts';
import { StackEnvironment, StackMetadata } from '../stack_metadata';
import { GlobalState } from '../main';

const recipientSlackChannel: Partial<Record<StackEnvironment, string>> = {
  [StackEnvironment.Dev]: '#honeycomb-backend-dev',
  [StackEnvironment.Prod]: '#alerts-backend',
};

type HoneycombSecrets = {
  apiKey: string;
};

export function ConfigureAlerts(g: GlobalState, stackMeta: StackMetadata) {
  let config = new pulumi.Config();
  let honeycombSecrets = config.getSecretObject<HoneycombSecrets>('honeycomb');
  if (!honeycombSecrets) {
    throw 'Missing Honeycomb API key from secrets config';
  }
  const apiKey = honeycombSecrets.apiKey;

  const alerts = generateAlerts(g);
  if (new Set(alerts.map(a => a.name)).size != alerts.length) {
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
          target: 'BetterStack',
        }
      : undefined;

  console.log(pagerRecipient);

  for (const alert of alerts) {
    const {
      datasetName,
      slackThreshold,
      pageThreshold,
      name,
      description: partialDescription,
      runbookUrl,
      ...trigger
    } = alert;
    const description = `${partialDescription || ''}\nRunbook: ${runbookUrl}`;
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
          description,
          ...trigger,
        },
      });
    }
    // Create a pager trigger
    if (pageThreshold && pagerRecipient) {
      const recipients = [pagerRecipient];
      if (slackRecipient) {
        recipients.push(slackRecipient);
      }
      new TriggerResource(`${commonName}-pager`, {
        apiKey,
        datasetName: datasetName,
        trigger: {
          alert_type: 'on_change',
          evaluation_schedule_type: 'frequency',
          frequency: 60, // Evaluate once per minute
          name: `[CRITICAL] ${name}`,
          recipients,
          threshold: pageThreshold,
          description,
          ...trigger,
        },
      });
    }
  }
}
