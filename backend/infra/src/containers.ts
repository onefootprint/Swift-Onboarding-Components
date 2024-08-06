import { NitroServiceOutput } from './nitro_service';
import { HmacSigningKeyDescriptor } from './hmac_key';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { StaticSecrets } from './secrets';
import { Config } from './config';
import { EnclaveKeyDescriptor } from './enclave_key';
import { Region } from '@pulumi/aws';
import { DatabaseOutput } from './db';
import * as s3 from './s3';
import * as assets from './asset_cdn';
import * as sg from './sg';

import { GetStackMetadata, StackEnvironment } from './stack_metadata';
import { FPC_SERVICE_PORT } from './sg';

const OTEL_PORT = 4317;
const DD_OTEL_PORT = 4327;

// The path at which metrics are served.
const METRICS_ENDPOINT_PATH = 'metrics';

export type ContainersOutput = {
  // Stringified container definitions.
  // https://www.pulumi.com/registry/packages/aws/api-docs/ecs/taskdefinition/#containerdefinitions_nodejs
  definitions: pulumi.Output<string>;
  metricsEndpointPath: string;
};

export type Knobs = {
  dbStatementTimeoutSec: number;
};

export abstract class ServiceContainers {
  static async monolithMain(
    constants: Config,
    secretsStore: StaticSecrets,
    enclaveKeyDescriptor: EnclaveKeyDescriptor,
    signingKeyDescriptor: HmacSigningKeyDescriptor,
    region: Region,
    database: DatabaseOutput,
    s3Buckets: s3.ServiceS3Buckets,
    assetsCdn: assets.AssetCdn,
    nitroService: NitroServiceOutput,
    otelExtraAttributes: Map<string, string>,
    datadogTags: Map<string, string>,
    logGroupComponent: string,
    containerArgs: string[],
    knobs: Knobs,
  ): Promise<ContainersOutput> {
    const otelCollectorContainerName = 'otelcollector';
    const datadogAgentContainerName = 'datadog-agent';
    const fluentBitContainerName = 'fluentbit';
    const serverContainerName = 'fpc';

    // Note: The appPort may not be useful for cron tasks unless there are
    // longer-lived crons that need metrics or a debug web interface.
    const appPort = sg.FPC_SERVICE_PORT;

    const traceOtelCollector = ServiceContainers.createTraceOtelCollector(
      otelCollectorContainerName,
      secretsStore,
      constants,
      region,
      appPort,
      logGroupComponent,
      datadogTags,
    );

    const datadogAgent = ServiceContainers.createDatadogAgent(
      datadogAgentContainerName,
      secretsStore,
      datadogTags,
    );

    const fluentBit = ServiceContainers.createFluentBit(
      fluentBitContainerName,
      region,
      logGroupComponent,
    );

    const monolith = await ServiceContainers.createMonolith(
      serverContainerName,
      otelCollectorContainerName,
      datadogAgentContainerName,
      fluentBitContainerName,
      appPort,
      constants,
      secretsStore,
      enclaveKeyDescriptor,
      signingKeyDescriptor,
      region,
      database,
      s3Buckets,
      assetsCdn,
      nitroService,
      otelExtraAttributes,
      datadogTags,
      containerArgs,
      knobs,
    );

    const definitions = pulumi
      .all([traceOtelCollector, datadogAgent, fluentBit, monolith])
      .apply(([traceOtelCollector, datadogAgent, fluentBit, monolith]) => {
        const def = [monolith, datadogAgent, fluentBit, traceOtelCollector];
        return JSON.stringify(def);
      });

    return {
      definitions,
      metricsEndpointPath: METRICS_ENDPOINT_PATH,
    };
  }

  /**
   * Our main container definition used for the API server and crons.
   */
  static async createMonolith(
    name: string,
    traceOtelCollectorContainerName: string,
    datadogAgentContainerName: string,
    fluentBitContainerName: string,
    appPort: number,
    constants: Config,
    secretsStore: StaticSecrets,
    enclaveKeyDescriptor: EnclaveKeyDescriptor,
    signingKeyDescriptor: HmacSigningKeyDescriptor,
    region: Region,
    database: DatabaseOutput,
    s3Buckets: s3.ServiceS3Buckets,
    assetsCdn: assets.AssetCdn,
    nitroService: NitroServiceOutput,
    otelExtraAttributes: Map<string, string>,
    datadogTags: Map<string, string>,
    containerArgs: string[],
    knobs: Knobs,
  ): Promise<pulumi.Output<aws.ecs.ContainerDefinition>> {
    let serviceEnvironment: string;

    const metadata = GetStackMetadata();

    switch (metadata.environment) {
      case StackEnvironment.DevEphemeral: {
        serviceEnvironment = 'preview';
        break;
      }
      case StackEnvironment.Dev: {
        serviceEnvironment = 'development';
        break;
      }
      case StackEnvironment.Prod: {
        serviceEnvironment = 'production';
        break;
      }
      default:
        serviceEnvironment = metadata.shortStackName;
        break;
    }

    const current = await aws.getCallerIdentity({});

    // NB: "api" named image is used for all monolith flavors (API server, cron, etc.).
    const image = `${current.accountId}.dkr.ecr.us-east-1.amazonaws.com/api:${constants.containers.apiVersion}`;
    return pulumi
      .all([
        enclaveKeyDescriptor.rootKeyId,
        enclaveKeyDescriptor.enclaveKmsCredentials.access_key_id,
        secretsStore.enclaveUserSecretKey.arn,
        secretsStore.enclaveSealedEncIkek.arn,
        secretsStore.enclaveSealedHmacIkek.arn,
        database.databaseUrlSecretParam.arn,
        database.databaseUrlRoSecretParam.arn,
        secretsStore.cookieSessionKey.arn,
        signingKeyDescriptor.rootKeyId,
        secretsStore.workosSecretKey.arn,
        secretsStore.twilioApiKey.arn,
        secretsStore.twilioApiKeySecret.arn,
        secretsStore.twilioApiKeyBackup.arn,
        secretsStore.twilioApiKeySecretBackup.arn,
        secretsStore.sendgridApiKey.arn,
        secretsStore.idologyUsername.arn,
        secretsStore.idologyPassword.arn,
        secretsStore.fractionalIdologyUsername.arn,
        secretsStore.fractionalIdologyPassword.arn,
        secretsStore.enclaveProxySecret.arn,
        secretsStore.socureSandboxApiKey.arn,
        secretsStore.socureProductionApiKey.arn,
        secretsStore.launchDarklySdkKey.arn,
        secretsStore.svixAuthToken.arn,
        secretsStore.stripeApiKey.arn,
        secretsStore.fpcProtectedCustodianKeyParameter.arn,
        secretsStore.fingerprintSdkKey.arn,
        secretsStore.incodeApiKey.arn,
        secretsStore.incodeSelfieFlowId.arn,
        secretsStore.incodeDocumentFlowId.arn,
        secretsStore.incodeBaseUrl.arn,
        secretsStore.incodeDemoApiKey.arn,
        secretsStore.incodeDemoSelfieFlowId.arn,
        secretsStore.incodeDemoDocumentFlowId.arn,
        secretsStore.incodeDemoBaseUrl.arn,
        secretsStore.middeskApiKey.arn,
        secretsStore.middeskWebhookSecret.arn,
        secretsStore.middeskBaseUrl.arn,
        secretsStore.experianAuthUsername.arn,
        secretsStore.experianAuthPassword.arn,
        secretsStore.experianAuthClientId.arn,
        secretsStore.experianAuthClientSecret.arn,
        secretsStore.experianCrossCoreUsername.arn,
        secretsStore.experianCrossCorePassword.arn,
        secretsStore.experianCrossCoreSubscriberCode.arn,
        secretsStore.stytchProject.arn,
        secretsStore.stytchSecret.arn,
        secretsStore.appleDeviceCheckPrivateKey.arn,
        secretsStore.googlePlayIntegrityDecryptionKey.arn,
        secretsStore.lexisUserId.arn,
        secretsStore.lexisPassword.arn,
        secretsStore.neuroIdApiKey.arn,
        secretsStore.neuroIdApiKeyTest.arn,
        secretsStore.openaiApiKey.arn,
        secretsStore.datadogApiKey.arn,
        secretsStore.sambaSafetyApiKey.arn,
        secretsStore.sambaSafetyBaseUrl.arn,
        secretsStore.sambaSafetyAuthUsername.arn,
        secretsStore.sambaSafetyAuthPassword.arn,
      ])
      .apply(
        ([
          rootKeyId,
          enclaveAccessKeyId,
          enclaveUserArn,
          sealedEncIkekHexArn,
          sealedHmacIkekHexArn,
          databaseUrlArn,
          databaseRoUrlArn,
          cookieSessionKeyArn,
          signingKeyId,
          workosSecretKey,
          twilioApiKey,
          twilioApiKeySecret,
          twilioApiKeyBackup,
          twilioApiKeySecretBackup,
          sendgridApiKey,
          idologyUsername,
          idologyPassword,
          fractionalIdologyUsername,
          fractionalIdologyPassword,
          enclaveProxySecret,
          socureSandboxApiKey,
          socureProductionApiKey,
          launchDarklySdkKey,
          svixAuthToken,
          stripeApiKeyArn,
          fpcProtectedArn,
          fingerprintSdkKey,
          incodeApiKey,
          incodeSelfieFlowId,
          incodeDocumentFlowId,
          incodeBaseUrl,
          incodeDemoApiKey,
          incodeDemoSelfieFlowId,
          incodeDemoDocumentFlowId,
          incodeDemoBaseUrl,
          middeskApiKey,
          middeskWebhookSecret,
          middeskBaseUrl,
          experianAuthUsername,
          experianAuthPassword,
          experianAuthClientId,
          experianAuthClientSecret,
          experianCrossCoreUsername,
          experianCrossCorePassword,
          experianCrossCoreSubscriberCode,
          stytchProject,
          stytchSecret,
          appleDcPrivateKey,
          googleIntegrityDecryptionKey,
          lexisUserId,
          lexisPassword,
          neuroIdApiKey,
          neuroIdApiKeyTest,
          openaiApiKey,
          datadogApiKeyArn,
          sambaSafetyApiKey,
          sambaSafetyBaseUrl,
          sambaSafetyAuthUsername,
          sambaSafetyAuthPassword,
        ]) => {
          let def: aws.ecs.ContainerDefinition = {
            name,
            image,
            essential: true,
            secrets: [
              {
                name: 'ENCLAVE_AWS_SECRET_ACCESS_KEY',
                valueFrom: enclaveUserArn,
              },
              {
                name: 'ENCLAVE_SEALED_ENC_IKEK_HEX',
                valueFrom: sealedEncIkekHexArn,
              },
              {
                name: 'ENCLAVE_SEALED_HMAC_IKEK_HEX',
                valueFrom: sealedHmacIkekHexArn,
              },
              {
                name: 'DATABASE_URL',
                valueFrom: databaseUrlArn,
              },
              {
                name: 'DATABASE_RO_URL',
                valueFrom: databaseRoUrlArn,
              },
              {
                name: 'COOKIE_SESSION_KEY',
                valueFrom: cookieSessionKeyArn,
              },
              {
                name: 'WORKOS_API_KEY',
                valueFrom: workosSecretKey,
              },
              {
                name: 'TWILIO_API_KEY',
                valueFrom: twilioApiKey,
              },
              {
                name: 'TWILIO_API_KEY_SECRET',
                valueFrom: twilioApiKeySecret,
              },
              {
                name: 'TWILIO_API_KEY_BACKUP',
                valueFrom: twilioApiKeyBackup,
              },
              {
                name: 'TWILIO_API_KEY_SECRET_BACKUP',
                valueFrom: twilioApiKeySecretBackup,
              },
              {
                name: 'SENDGRID_API_KEY',
                valueFrom: sendgridApiKey,
              },
              {
                name: 'IDOLOGY_USERNAME',
                valueFrom: idologyUsername,
              },
              {
                name: 'IDOLOGY_PASSWORD',
                valueFrom: idologyPassword,
              },
              {
                name: 'FRACTIONAL_IDOLOGY_USERNAME',
                valueFrom: fractionalIdologyUsername,
              },
              {
                name: 'FRACTIONAL_IDOLOGY_PASSWORD',
                valueFrom: fractionalIdologyPassword,
              },
              {
                name: 'ENCLAVE_PROXY_SECRET',
                valueFrom: enclaveProxySecret,
              },
              {
                name: 'SOCURE_SANDBOX_API_KEY',
                valueFrom: socureSandboxApiKey,
              },
              {
                name: 'SOCURE_PRODUCTION_API_KEY',
                valueFrom: socureProductionApiKey,
              },
              {
                name: 'LAUNCH_DARKLY_SDK_KEY',
                valueFrom: launchDarklySdkKey,
              },
              {
                name: 'SVIX_AUTH_TOKEN',
                valueFrom: svixAuthToken,
              },
              {
                name: 'STRIPE_API_KEY',
                valueFrom: stripeApiKeyArn,
              },
              {
                name: 'PROTECTED_CUSTODIAN_KEY',
                valueFrom: fpcProtectedArn,
              },
              {
                name: 'FINGERPRINTJS_SDK_KEY',
                valueFrom: fingerprintSdkKey,
              },
              {
                name: 'INCODE_API_KEY',
                valueFrom: incodeApiKey,
              },
              {
                name: 'INCODE_SELFIE_FLOW_ID',
                valueFrom: incodeSelfieFlowId,
              },
              {
                name: 'INCODE_DOCUMENT_FLOW_ID',
                valueFrom: incodeDocumentFlowId,
              },
              {
                name: 'INCODE_BASE_URL',
                valueFrom: incodeBaseUrl,
              },
              {
                name: 'INCODE_DEMO_API_KEY',
                valueFrom: incodeDemoApiKey,
              },
              {
                name: 'INCODE_DEMO_SELFIE_FLOW_ID',
                valueFrom: incodeDemoSelfieFlowId,
              },
              {
                name: 'INCODE_DEMO_DOCUMENT_FLOW_ID',
                valueFrom: incodeDemoDocumentFlowId,
              },
              {
                name: 'INCODE_DEMO_BASE_URL',
                valueFrom: incodeDemoBaseUrl,
              },
              {
                name: 'MIDDESK_API_KEY',
                valueFrom: middeskApiKey,
              },
              {
                name: 'MIDDESK_WEBHOOK_SECRET',
                valueFrom: middeskWebhookSecret,
              },
              {
                name: 'MIDDESK_BASE_URL',
                valueFrom: middeskBaseUrl,
              },
              {
                name: 'EXPERIAN_AUTH_USERNAME',
                valueFrom: experianAuthUsername,
              },
              {
                name: 'EXPERIAN_AUTH_PASSWORD',
                valueFrom: experianAuthPassword,
              },
              {
                name: 'EXPERIAN_AUTH_CLIENT_ID',
                valueFrom: experianAuthClientId,
              },
              {
                name: 'EXPERIAN_AUTH_CLIENT_SECRET',
                valueFrom: experianAuthClientSecret,
              },
              {
                name: 'EXPERIAN_CROSS_CORE_USERNAME',
                valueFrom: experianCrossCoreUsername,
              },
              {
                name: 'EXPERIAN_CROSS_CORE_PASSWORD',
                valueFrom: experianCrossCorePassword,
              },
              {
                name: 'EXPERIAN_PRECISEID_SUBSCRIBER_CODE',
                valueFrom: experianCrossCoreSubscriberCode,
              },
              {
                name: 'STYTCH_PROJECT',
                valueFrom: stytchProject,
              },
              {
                name: 'STYTCH_SECRET',
                valueFrom: stytchSecret,
              },
              {
                name: 'APPLE_DEVICE_CHECK_PRIVATE_KEY',
                valueFrom: appleDcPrivateKey,
              },
              {
                name: 'GOOGLE_PLAY_INTEGRITY_DECRYPTION_KEY',
                valueFrom: googleIntegrityDecryptionKey,
              },
              {
                name: 'LEXIS_USER_ID',
                valueFrom: lexisUserId,
              },
              {
                name: 'LEXIS_PASSWORD',
                valueFrom: lexisPassword,
              },
              {
                name: 'NEUROID_API_KEY',
                valueFrom: neuroIdApiKey,
              },
              {
                name: 'NEUROID_API_KEY_TEST',
                valueFrom: neuroIdApiKeyTest,
              },
              {
                name: 'OPENAI_API_KEY',
                valueFrom: openaiApiKey,
              },
              {
                name: 'SAMBA_API_KEY',
                valueFrom: sambaSafetyApiKey,
              },
              {
                name: 'SAMBA_BASE_URL',
                valueFrom: sambaSafetyBaseUrl,
              },
              {
                name: 'SAMBA_AUTH_USERNAME',
                valueFrom: sambaSafetyAuthUsername,
              },
              {
                name: 'SAMBA_AUTH_PASSWORD',
                valueFrom: sambaSafetyAuthPassword,
              },
            ],
            environment: [
              {
                name: 'AWS_REGION',
                value: `${region}`,
              },
              {
                name: 'AWS_ROOT_KEY_ID',
                value: rootKeyId,
              },
              {
                name: 'ENCLAVE_AWS_ACCESS_KEY_ID',
                value: enclaveAccessKeyId,
              },
              {
                name: 'AWS_HMAC_SIGNING_ROOT_KEY_ID',
                value: signingKeyId,
              },
              {
                name: 'RUST_LOG',
                value: 'INFO,webauthn_rs_core::attestation=off,compact_jwt::jws=off',
              },
              {
                name: 'PORT',
                value: `${appPort}`,
              },
              {
                name: 'OTEL_ENDPOINT',
                value: `http://localhost:${OTEL_PORT}`,
              },
              {
                name: 'RELYING_PARTY_ID',
                value: constants.rpId,
              },
              {
                name: 'COOKIE_DOMAIN',
                value: constants.rpId,
              },
              {
                name: 'OTEL_RESOURCE_ATTRIBUTES',
                value: [
                  // Using fpc-api as the service name for crons and workers
                  // too so they are grouped under the same Honeycomb dataset.
                  //
                  // During the trial period, the Datadog service name is
                  // overwritten by the otel.yml config.
                  `service.name=fpc-api`,
                  `service.version=${constants.containers.apiVersion}`,
                  `deployment.environment=${pulumi.getStack()}`,
                  ...Array.from(otelExtraAttributes.entries()).map(
                    ([k, v]) => `${k}=${v}`,
                  ),
                ].join(','),
              },
              {
                name: 'WORKOS_CLIENT_ID',
                value: constants.workos.clientId,
              },
              {
                name: 'WORKOS_DEFAULT_ORG',
                value: constants.workos.defaultOrg,
              },
              {
                name: 'SERVICE_ENVIRONMENT',
                value: serviceEnvironment,
              },
              {
                name: 'TWILIO_ACCOUNT_SID',
                value: constants.twilio.accountSid,
              },
              {
                name: 'TWILIO_PHONE_NUMBER',
                value: constants.twilio.phoneNumber,
              },
              {
                name: 'TWILIO_WHATSAPP_SENDER_SID',
                value: constants.twilio.whatsappSenderId,
              },
              {
                name: 'TWILIO_WHATSAPP_OTP_TEMPLATE_ID',
                value: constants.twilio.whatsappOtpTemplateId,
              },
              {
                name: 'TWILIO_ACCOUNT_SID_BACKUP',
                value: constants.twilioBackup?.accountSid || '',
              },
              {
                name: 'TWILIO_PHONE_NUMBER_BACKUP',
                value: constants.twilioBackup?.phoneNumber || '',
              },
              {
                name: 'TWILIO_WHATSAPP_SENDER_SID_BACKUP',
                value: constants.twilioBackup?.whatsappSenderId,
              },
              {
                name: 'TWILIO_WHATSAPP_OTP_TEMPLATE_ID_BACKUP',
                value: constants.twilioBackup?.whatsappOtpTemplateId,
              },
              {
                name: 'SENDGRID_FROM_EMAIL',
                value: constants.sendgrid.fromEmail,
              },
              {
                name: 'DOCUMENT_S3_BUCKET',
                value: s3Buckets.documentImages.bucketName,
              },
              {
                name: 'ASSETS_CDN_S3_BUCKET',
                value: s3Buckets.assetsBucket.bucketName,
              },
              {
                name: 'ASSETS_CDN_ORIGIN',
                value: assetsCdn.origin,
              },
              {
                name: 'METRICS_ENDPOINT_PATH',
                value: `${METRICS_ENDPOINT_PATH}`,
              },
              {
                name: 'ENCLAVE_PROXY_ENDPOINT',
                value: nitroService.serviceEndpoint,
              },
              {
                name: 'APPLE_DEVICE_CHECK_KEY_ID',
                value: constants.apple.keyId,
              },
              {
                name: 'GOOGLE_PLAY_INTEGRITY_VERIFICATION_KEY',
                value: constants.google.playIntegrityVerificationKey,
              },
              {
                name: 'DATABASE_STATEMENT_TIMEOUT_SEC',
                value: `${knobs.dbStatementTimeoutSec}`,
              },
            ],
            // TODO: I've suggested some more tolerant values
            // but still disabling this for now!
            //
            // healthCheck: {
            //   command: [
            //     'CMD-SHELL',
            //     `curl -f http://localhost:${appPort}/health || exit 1`,
            //   ],
            //   interval: 300,
            //   retries: 10,
            //   startPeriod: 30,
            //   timeout: 30,
            // },
            dependsOn: [
              {
                containerName: traceOtelCollectorContainerName,
                condition: 'HEALTHY',
              },
              {
                containerName: datadogAgentContainerName,
                condition: 'START',
              },
              {
                containerName: fluentBitContainerName,
                condition: 'START',
              },
            ],
            portMappings: [
              {
                containerPort: appPort,
                hostPort: appPort,
                protocol: 'tcp',
              },
            ],
            stopTimeout: 60, // How many seconds to wait for graceful shutdown.
            command: containerArgs,
            logConfiguration: {
              logDriver: 'awsfirelens',
              options: {
                Name: 'datadog',
                dd_service: datadogTags.get('service') || 'unknown',
                dd_source: 'rust',
                dd_tags: [
                  `env:${metadata.shortStackName}`,
                  ...Array.from(datadogTags.entries()).map(
                    ([k, v]) => `${k}:${v}`,
                  ),
                ].join(','),
                TLS: 'on',
                provider: 'ecs',
              },
              secretOptions: [
                {
                  name: 'apiKey',
                  valueFrom: datadogApiKeyArn,
                },
              ],
            },
          };
          return def;
        },
      );
  }

  /**
   * OpenTelemetryCollector Agent for traces & prometheus
   */
  static createTraceOtelCollector(
    name: string,
    secrets: StaticSecrets,
    constants: Config,
    region: Region,
    serverContainerPort: number,
    logGroupComponent: string,
    datadogTags: Map<string, string>,
  ): pulumi.Output<aws.ecs.ContainerDefinition> {
    const metadata = GetStackMetadata();
    const out = pulumi
      .all([secrets.traceOtelConfig.arn, secrets.honeycombApiKey.arn])
      .apply(([config, honeycombApiKey]) => [
        {
          name: 'AOT_CONFIG_CONTENT',
          valueFrom: config,
        },
        {
          name: 'HONEYCOMB_API_KEY',
          valueFrom: honeycombApiKey,
        },
      ])
      .apply(secrets => {
        let def: aws.ecs.ContainerDefinition = {
          name,
          image: 'amazon/aws-otel-collector:latest',
          essential: true,
          secrets,
          portMappings: [
            {
              containerPort: OTEL_PORT,
              hostPort: OTEL_PORT,
              protocol: 'tcp',
            },
          ],
          environment: [
            {
              name: 'API_SERVER_TARGET',
              value: `localhost:${serverContainerPort}`,
            },
            {
              name: 'API_SERVER_METRICS_ENDPOINT_PATH',
              value: `${METRICS_ENDPOINT_PATH}`,
            },
            {
              name: 'DD_OTEL_PORT',
              value: `${DD_OTEL_PORT}`,
            },
            {
              name: 'DD_SERVICE',
              value: datadogTags.get('service') || 'unknown',
            },
          ],
          healthCheck: {
            command: ['CMD', '/healthcheck'],
            interval: 10,
            retries: 5,
            startPeriod: 30,
            timeout: 10,
          },
          logConfiguration: {
            logDriver: 'awslogs',
            options: {
              'awslogs-group': `/ecs/otelcollect_logs/${
                metadata.shortStackName
              }${logGroupComponent ? '-' + logGroupComponent : ''}`,
              'awslogs-region': `${region}`,
              'awslogs-create-group': 'true',
              'awslogs-stream-prefix': 'ecs',
            },
          },
        };

        return def;
      });

    return out;
  }

  /**
   * Datadog Agent
   */
  static createDatadogAgent(
    name: string,
    secrets: StaticSecrets,
    datadogTags: Map<string, string>,
  ): pulumi.Output<aws.ecs.ContainerDefinition> {
    const metadata = GetStackMetadata();
    const out = pulumi
      .all([secrets.datadogApiKey.arn])
      .apply(([datadogApiKeyArn]) => {
        let def: aws.ecs.ContainerDefinition = {
          name,
          image:
            'public.ecr.aws/datadog/agent:7@sha256:4064da01d0db2e30c5331e3cedf7a43478ab6b215efe1885cc6f50a05a467263',
          essential: true,
          secrets: [
            {
              name: 'DD_API_KEY',
              valueFrom: datadogApiKeyArn,
            },
          ],
          portMappings: [
            {
              // DogStatsD
              containerPort: 8125,
              hostPort: 8125,
              protocol: 'tcp',
            },
            {
              // APM Trace Agent
              containerPort: 8126,
              hostPort: 8126,
              protocol: 'tcp',
            },
            {
              // OTLP gRPC endpoint
              containerPort: DD_OTEL_PORT,
              hostPort: DD_OTEL_PORT,
              protocol: 'tcp',
            },
          ],
          environment: [
            {
              name: 'ECS_FARGATE',
              value: 'true',
            },
            {
              name: 'DD_APM_ENABLED',
              value: 'true',
            },
            {
              name: 'DD_OTLP_CONFIG_RECEIVER_PROTOCOLS_GRPC_ENDPOINT',
              value: `0.0.0.0:${DD_OTEL_PORT}`,
            },
            {
              name: 'DD_TAGS',
              value: [
                `env:${metadata.shortStackName}`,
                ...Array.from(datadogTags.entries()).map(
                  ([k, v]) => `${k}:${v}`,
                ),
              ].join(' '),
            },
          ],
          logConfiguration: {
            logDriver: 'awsfirelens',
            options: {
              Name: 'datadog',
              dd_service: 'datadog-agent',
              dd_source: 'datadog-agent',
              dd_tags: `env:${metadata.shortStackName}`,
              TLS: 'on',
              provider: 'ecs',
            },
            secretOptions: [
              {
                name: 'apiKey',
                valueFrom: datadogApiKeyArn,
              },
            ],
          },
        };

        return def;
      });

    return out;
  }

  /**
   * Fluent Bit (Forward logs from ECS -> Datadog Logs)
   */
  static createFluentBit(
    name: string,
    region: Region,
    logGroupComponent: string,
  ): aws.ecs.ContainerDefinition {
    const metadata = GetStackMetadata();

    let def: aws.ecs.ContainerDefinition = {
      name,
      image:
        'public.ecr.aws/aws-observability/aws-for-fluent-bit:stable@sha256:3bff549ff35b18a2c21e455e409618a3dc146b2e1f4809522b35e23a0ae0f360',
      essential: true,
      firelensConfiguration: {
        type: 'fluentbit',
        options: {
          'enable-ecs-log-metadata': 'true',
          'config-file-type': 'file',
          'config-file-value': '/fluent-bit/configs/parse-json.conf',
        },
      },
      logConfiguration: {
        // Forward Fluent Bit's own logs to CloudWatch.
        logDriver: 'awslogs',
        options: {
          'awslogs-group': `/ecs/${name}-${metadata.shortStackName}${
            logGroupComponent ? '-' + logGroupComponent : ''
          }-logs`,
          'awslogs-region': `${region}`,
          'awslogs-create-group': 'true',
          'awslogs-stream-prefix': 'ecs',
        },
      },
    };

    return def;
  }
}
