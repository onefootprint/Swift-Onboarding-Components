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
  secretsPolicyArn: pulumi.Output<string>;
  elasticApiKey: aws.ssm.Parameter;
  elasticApmAgentKey: aws.ssm.Parameter;
  traceOtelConfig: aws.ssm.Parameter;
  promOtelConfig: aws.ssm.Parameter;
  enclaveUserSecretKey: aws.ssm.Parameter;
  enclaveSealedIkek: aws.ssm.Parameter;
  dbPassword: pulumi.Output<string>;
  cookieSessionKey: aws.ssm.Parameter;
  workosSecretKey: aws.ssm.Parameter;
  twilioApiKey: aws.ssm.Parameter;
  twilioApiKeySecret: aws.ssm.Parameter;
  sendgridApiKey: aws.ssm.Parameter;
  idologyUsername: aws.ssm.Parameter;
  idologyPassword: aws.ssm.Parameter;
  grafanaPrometheusPushAuth: aws.ssm.Parameter;
}

interface SecretConstants {
  elastic: ElasticSecrets;
  workos: Workos;
  twilio: Twilio;
  sendgrid: Sendgrid;
  idology: IDology;
  grafana: Grafana;
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
}

interface Grafana {
  prometheusPushAuth: string;
}

export async function LoadSecrets(
  config: pulumi.Config,
  enclaveKeyDescriptor: EnclaveKeyDescriptor,
): Promise<StaticSecrets> {
  const cloudfrontSecret = new random.RandomString('cf-alb-pass', {
    length: 44,
  }).result;
  const stack = pulumi.getStack();

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

  const auroraDbPassword = new random.RandomPassword('db_password', {
    length: 44,
    special: false,
  });

  const secretConstants =
    config.requireSecretObject<SecretConstants>('constants');

  return {
    secretsPolicyArn: secretsPolicy.arn,
    cloudfrontSecret: pulumi.secret(cloudfrontSecret),
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
      value: fs.readFileSync('./monitoring/otel.yml', 'utf8'),
      name: `/static_secrets/trace-otelconfig-${stack}`,
    }),
    promOtelConfig: new aws.ssm.Parameter(`ssm-param-prom-otelconfig`, {
      type: 'SecureString',
      value: fs.readFileSync('./monitoring/prom-otel.yml', 'utf8'),
      name: `/static_secrets/prom-otelconfig-${stack}`,
    }),
    dbPassword: pulumi.secret(auroraDbPassword.result),
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
    enclaveSealedIkek: createSecretParameter(
      `enclaveSealedIkek-${stack}`,
      enclaveKeyDescriptor.sealedIkek.hexValue,
    ),
    grafanaPrometheusPushAuth: createSecretParameter(
      `grafanaPrometheusPushAuth-${stack}`,
      secretConstants.grafana.prometheusPushAuth,
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
  });

  return secret;
}
