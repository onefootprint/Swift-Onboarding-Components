import { StackMetadata } from './stack_metadata';
import * as pulumi from '@pulumi/pulumi';
import * as random from '@pulumi/random';
import * as awsx from '@pulumi/awsx';
import * as aws from '@pulumi/aws';
import { Output } from '@pulumi/pulumi';
import * as fs from 'fs';
import { EnclaveKeyDescriptor } from './enclave_key';
import { ApplicationSubComponentTypeConfigurationSubComponentType } from '@pulumi/aws-native/applicationinsights';

export interface StaticSecrets {
  cloudfrontSecret: pulumi.Output<string>;
  enclaveProxySecret: aws.ssm.Parameter;
  enclaveProxySecretName: string;
  secretsPolicyArn: pulumi.Output<string>;
  elasticApiKey: aws.ssm.Parameter;
  elasticApmAgentKey: aws.ssm.Parameter;
  traceOtelConfig: aws.ssm.Parameter;
  enclaveUserSecretKey: aws.ssm.Parameter;
  enclaveSealedEncIkek: aws.ssm.Parameter;
  enclaveSealedHmacIkek: aws.ssm.Parameter;
  dbPassword: pulumi.Output<string>;
  jbDbPassword: pulumi.Output<string>;
  cookieSessionKey: aws.ssm.Parameter;
  workosSecretKey: aws.ssm.Parameter;
  twilioApiKey: aws.ssm.Parameter;
  twilioApiKeySecret: aws.ssm.Parameter;
  sendgridApiKey: aws.ssm.Parameter;
  idologyUsername: aws.ssm.Parameter;
  idologyPassword: aws.ssm.Parameter;
  fractionalIdologyUsername: aws.ssm.Parameter;
  fractionalIdologyPassword: aws.ssm.Parameter;
  grafanaPrometheusPushAuth: aws.ssm.Parameter;
  honeycombApiKey: aws.ssm.Parameter;
  airplaneApiToken: pulumi.Output<string>;
  socureSandboxApiKey: aws.ssm.Parameter;
  socureProductionApiKey: aws.ssm.Parameter;
  launchDarklySdkKey: aws.ssm.Parameter;
  svixAuthToken: aws.ssm.Parameter;
  stripeApiKey: aws.ssm.Parameter;
  fpcProtectedCustodianKey: pulumi.Output<string>;
  fpcProtectedCustodianKeyParameter: aws.ssm.Parameter;
  fingerprintSdkKey: aws.ssm.Parameter;
  incodeApiKey: aws.ssm.Parameter;
  incodeSelfieFlowId: aws.ssm.Parameter;
  incodeDocumentFlowId: aws.ssm.Parameter;
  incodeBaseUrl: aws.ssm.Parameter;
  middeskApiKey: aws.ssm.Parameter;
  middeskWebhookSecret: aws.ssm.Parameter;
  middeskBaseUrl: aws.ssm.Parameter;
  experianAuthUsername: aws.ssm.Parameter;
  experianAuthPassword: aws.ssm.Parameter;
  experianAuthClientId: aws.ssm.Parameter;
  experianAuthClientSecret: aws.ssm.Parameter;
  experianCrossCoreUsername: aws.ssm.Parameter;
  experianCrossCorePassword: aws.ssm.Parameter;
  experianCrossCoreSubscriberCode: aws.ssm.Parameter;
}

interface SecretConstants {
  elastic: ElasticSecrets;
  workos: Workos;
  twilio: Twilio;
  sendgrid: Sendgrid;
  idology: IDology;
  grafana: Grafana;
  honeycomb: Honeycomb;
  airplane: Airplane;
  socure: Socure;
  launchDarkly: LaunchDarkly;
  svix: Svix;
  stripe: Stripe;
  fingerprint: Fingerprint;
  incode: Incode;
  middesk: Middesk;
  experian: Experian;
}

interface ElasticSecrets {
  apiKey: string;
  apmAgentKey: string;
}

interface Workos {
  secretKey: string;
}

interface Twilio {
  apiKey: string;
  apiKeySecret: string;
}

interface Sendgrid {
  apiKey: string;
}

interface IDology {
  username: string;
  password: string;
  fractionalUsername: string;
  fractionalPassword: string;
}

interface Socure {
  sandboxApiKey: string;
  productionApiKey: string;
}

interface Grafana {
  prometheusPushAuth: string;
}

interface Honeycomb {
  apiKey: string;
}

interface Airplane {
  apiToken: string;
}

interface LaunchDarkly {
  launchDarklySdkKey: string;
}

interface Svix {
  authToken: string;
}

interface Stripe {
  apiKey: string;
}

interface Incode {
  incodeApiKey: string;
  incodeSelfieFlowId: string;
  incodeDocumentFlowId: string;
  incodeBaseUrl: string;
}

interface Fingerprint {
  fingerprintSdkKey: string;
}

interface Middesk {
  apiKey: string;
  webhookSecret: string;
  baseUrl: string;
}

interface Experian {
  authUsername: string;
  authPassword: string;
  authClientId: string;
  authClientSecret: string;
  crossCoreUsername: string;
  crossCorePassword: string;
  crossCoreSubscriberCode: string;
}

export async function LoadSecrets(
  config: pulumi.Config,
  enclaveKeyDescriptor: EnclaveKeyDescriptor,
  stackMetadata: StackMetadata,
): Promise<StaticSecrets> {
  const cloudfrontSecret = new random.RandomString('cf-alb-pass', {
    length: 44,
  }).result;

  const nitroProxySecret = new random.RandomString('enclave-proxy-secret', {
    length: 44,
    special: false,
  }).result;

  const stack = stackMetadata.shortStackName;

  const sessionKey = new random.RandomId('api-session-key', {
    byteLength: 64,
  });

  const secretsPolicy = new aws.iam.Policy('secrets_parameter_read_access', {
    policy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Action: ['ssm:GetParameters', 'ssm:GetParameter'],
          Effect: 'Allow',
          Resource: 'arn:aws:ssm:*:*:parameter/static_secrets/*',
        },
      ],
    }),
  });

  const auroraDbPassword = new random.RandomPassword('db_password_020223', {
    length: 44,
    special: false,
  });

  const jumpboxAuroraDbPassword = new random.RandomPassword('db__jb_password', {
    length: 44,
    special: false,
  });

  const fpcProtectedCustodianKey = new random.RandomPassword(
    'fpc_protected_custodian_key_021723',
    {
      length: 44,
      special: false,
    },
  );

  const secretConstants =
    config.requireSecretObject<SecretConstants>('constants');

  const enclaveProxySecretName = `enclaveProxySecret-${stack}`;

  return {
    secretsPolicyArn: secretsPolicy.arn,
    cloudfrontSecret: pulumi.secret(cloudfrontSecret),
    enclaveProxySecretName: enclaveProxySecretName,
    enclaveProxySecret: createSecretParameter(
      enclaveProxySecretName,
      pulumi.secret(nitroProxySecret),
    ),
    elasticApiKey: createSecretParameter(
      `elasticApiKey-${stack}`,
      secretConstants.elastic.apiKey,
    ),
    elasticApmAgentKey: createSecretParameter(
      `elasticApmAgentKey-${stack}`,
      secretConstants.elastic.apmAgentKey,
    ),
    enclaveUserSecretKey: new aws.ssm.Parameter(`ssm-param-enclave-user-key`, {
      type: 'SecureString',
      value: pulumi.secret(
        enclaveKeyDescriptor.enclaveKmsCredentials.access_secret_key,
      ),
      name: `/static_secrets/enclave-user-${stack}`,
    }),
    traceOtelConfig: new aws.ssm.Parameter(`ssm-param-trace-otelconfig`, {
      type: 'SecureString',
      value: fs.readFileSync('./config/otel.yml', 'utf8'),
      name: `/static_secrets/trace-otelconfig-${stack}`,
    }),
    dbPassword: pulumi.secret(auroraDbPassword.result),
    jbDbPassword: pulumi.secret(jumpboxAuroraDbPassword.result),
    cookieSessionKey: new aws.ssm.Parameter(
      `ssm-param-api-cookie-session-key`,
      {
        type: 'SecureString',
        value: pulumi.secret(sessionKey.hex),
        name: `/static_secrets/api-session-key-${stack}`,
      },
    ),
    workosSecretKey: createSecretParameter(
      `workosSecretKey-${stack}`,
      secretConstants.workos.secretKey,
    ),
    twilioApiKey: createSecretParameter(
      `twilioApiKey-${stack}`,
      secretConstants.twilio.apiKey,
    ),
    twilioApiKeySecret: createSecretParameter(
      `twilioApiSecretKey-${stack}`,
      secretConstants.twilio.apiKeySecret,
    ),
    sendgridApiKey: createSecretParameter(
      `sendgridApiKey-${stack}`,
      secretConstants.sendgrid.apiKey,
    ),
    idologyUsername: createSecretParameter(
      `idologyUsername-${stack}`,
      secretConstants.idology.username,
    ),
    idologyPassword: createSecretParameter(
      `idologyPassword-${stack}`,
      secretConstants.idology.password,
    ),
    fractionalIdologyUsername: createSecretParameter(
      `fractionalIdologyUsername-${stack}`,
      secretConstants.idology.fractionalUsername,
    ),
    fractionalIdologyPassword: createSecretParameter(
      `fractionalIdologyPassword-${stack}`,
      secretConstants.idology.fractionalPassword,
    ),
    enclaveSealedEncIkek: createSecretParameter(
      `enclaveSealedIkek-${stack}`,
      enclaveKeyDescriptor.sealedEncIkek,
    ),
    enclaveSealedHmacIkek: createSecretParameter(
      `enclaveSealedHmacIkek-${stack}`,
      enclaveKeyDescriptor.sealedHmacIkek,
    ),
    grafanaPrometheusPushAuth: createSecretParameter(
      `grafanaPrometheusPushAuth-${stack}`,
      secretConstants.grafana.prometheusPushAuth,
    ),
    honeycombApiKey: createSecretParameter(
      `honeycombApiKey-${stack}`,
      secretConstants.honeycomb.apiKey,
    ),
    airplaneApiToken: pulumi.secret(secretConstants.airplane.apiToken),
    socureSandboxApiKey: createSecretParameter(
      `socureSandboxApiKey-${stack}`,
      secretConstants.socure.sandboxApiKey,
    ),
    socureProductionApiKey: createSecretParameter(
      `socureProductionApiKey-${stack}`,
      secretConstants.socure.productionApiKey,
    ),
    launchDarklySdkKey: createSecretParameter(
      `launchDarklySdkKey-${stack}`,
      secretConstants.launchDarkly.launchDarklySdkKey,
    ),
    svixAuthToken: createSecretParameter(
      `svixAuthToken-${stack}`,
      secretConstants.svix.authToken,
    ),
    stripeApiKey: createSecretParameter(
      `stripeApiKey-${stack}`,
      secretConstants.stripe.apiKey,
    ),
    fpcProtectedCustodianKey: pulumi.secret(fpcProtectedCustodianKey.result),
    fpcProtectedCustodianKeyParameter: createSecretParameter(
      `fpcPrivateProectedToken-${stack}`,
      fpcProtectedCustodianKey.result,
    ),
    fingerprintSdkKey: createSecretParameter(
      `fingerprintSdkKey-${stack}`,
      secretConstants.fingerprint.fingerprintSdkKey,
    ),
    incodeApiKey: createSecretParameter(
      `incodeApiKey-${stack}`,
      secretConstants.incode.incodeApiKey,
    ),
    incodeSelfieFlowId: createSecretParameter(
      `incodeSelfieFlowId-${stack}`,
      secretConstants.incode.incodeSelfieFlowId,
    ),
    incodeDocumentFlowId: createSecretParameter(
      `incodeDocumentFlowId-${stack}`,
      secretConstants.incode.incodeDocumentFlowId,
    ),
    incodeBaseUrl: createSecretParameter(
      `incodeBaseUrl-${stack}`,
      secretConstants.incode.incodeBaseUrl,
    ),
    middeskApiKey: createSecretParameter(
      `middeskApiKey-${stack}`,
      secretConstants.middesk.apiKey,
    ),
    middeskWebhookSecret: createSecretParameter(
      `middeskWebhookSecret-${stack}`,
      secretConstants.middesk.webhookSecret,
    ),
    middeskBaseUrl: createSecretParameter(
      `middeskBaseUrl-${stack}`,
      secretConstants.middesk.baseUrl,
    ),
    experianAuthUsername: createSecretParameter(
      `experianAuthUsername-${stack}`,
      secretConstants.experian.authUsername,
    ),
    experianAuthPassword: createSecretParameter(
      `experianAuthPassword-${stack}`,
      secretConstants.experian.authPassword,
    ),
    experianAuthClientId: createSecretParameter(
      `experianAuthClientId-${stack}`,
      secretConstants.experian.authClientId,
    ),
    experianAuthClientSecret: createSecretParameter(
      `experianAuthClientSecret-${stack}`,
      secretConstants.experian.authClientSecret,
    ),
    experianCrossCoreUsername: createSecretParameter(
      `experianCrossCoreUsername-${stack}`,
      secretConstants.experian.crossCoreUsername,
    ),
    experianCrossCorePassword: createSecretParameter(
      `experianCrossCorePassword-${stack}`,
      secretConstants.experian.crossCorePassword,
    ),
    experianCrossCoreSubscriberCode: createSecretParameter(
      `experianCrossCoreSubscriberCode-${stack}`,
      secretConstants.experian.crossCoreSubscriberCode,
    ),
  };
}
/// create a secret param
function createSecretParameter(
  name: string,
  secretVal: pulumi.Output<string>,
): aws.ssm.Parameter {
  const secret = new aws.ssm.Parameter(`ssm-param-${name}`, {
    type: 'SecureString',
    value: secretVal,
    name: `/static_secrets/${name}`,
    overwrite: true,
    description: name,
  });

  return secret;
}
