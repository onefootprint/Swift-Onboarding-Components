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
  const config = new pulumi.Config();
  const honeycombSecrets = config.getSecretObject<HoneycombSecrets>('honeycomb');
  if (!honeycombSecrets) {
    throw 'Missing Honeycomb API key from secrets config';
  }
  const apiKey = honeycombSecrets.apiKey;

  const alerts = generateAlerts(g);
  if (new Set(alerts.map(a => a.name)).size !== alerts.length) {
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
          target: 'Incident.io',
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
      query,
      ...trigger
    } = alert;
    const description = `${partialDescription || ''}\nRunbook: ${runbookUrl}`;
    const nameHyphen = name.replace(/ /g, '-');
    const commonName = `alert-${stackMeta.shortStackName}-${nameHyphen}`;

    // Note: our alerts are all evaluated every 180s. So, each query is instructed to look back
    // 240s in case there's any delay evaluating the alert. This means an alert may double fire
    // for two consecutive evaluations even if the underlying alertable action only occured once.
    // Also take care of the thresholds set in the alerts - these are for the 240s window.

    // Create a slack trigger
    if (slackThreshold && slackRecipient) {
      new TriggerResource(`${commonName}-slack`, {
        apiKey,
        datasetName: datasetName,
        trigger: {
          alert_type: 'on_true',
          evaluation_schedule_type: 'frequency',
          frequency: 180, // Evaluate every three minutes. Be careful changing this
          name: `[WARNING] ${name}`,
          recipients: [slackRecipient],
          threshold: slackThreshold,
          description,
          query: {
            time_range: 240, // Look back for four minutes of data. Be careful changing this
            ...query,
          },
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
          frequency: 180, // Evalute every three minutes. Be careful changing this
          name: `[CRITICAL] ${name}`,
          recipients,
          threshold: pageThreshold,
          description,
          query: {
            time_range: 240, // Look back for four minutes of data. Be careful changing this
            ...query,
          },
          ...trigger,
        },
      });
    }
  }
}
