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
import { GetStackMetadata, StackEnvironment } from './stack_metadata';

const OTEL_PORT = 4317;

export abstract class ServiceContainers {
  static async apiMain(
    appPort: number,
    constants: Config,
    secretsStore: StaticSecrets,
    enclaveKeyDescriptor: EnclaveKeyDescriptor,
    signingKeyDescriptor: HmacSigningKeyDescriptor,
    region: Region,
    parent: pulumi.Resource,
    database: DatabaseOutput,
    s3Buckets: s3.ServiceS3Buckets,
    metricsEndpointPath: string,
    nitroService: NitroServiceOutput,
  ): Promise<pulumi.Output<string>> {
    const traceOtelCollecterContainerName = 'otelcollect-trace';
    const serverContainerName = 'fpc';

    const traceOtelCollector = ServiceContainers.createTraceOtelCollector(
      traceOtelCollecterContainerName,
      secretsStore,
      constants,
      region,
      appPort,
      metricsEndpointPath,
    );

    const hearbeats = ServiceContainers.createHeartbeatContainer(
      serverContainerName,
      appPort,
      secretsStore,
      constants,
    );

    const apiServer = await ServiceContainers.createApiServer(
      serverContainerName,
      traceOtelCollecterContainerName,
      appPort,
      constants,
      secretsStore,
      enclaveKeyDescriptor,
      signingKeyDescriptor,
      region,
      database,
      s3Buckets,
      metricsEndpointPath,
      nitroService,
    );

    const containerDef = pulumi
      .all([traceOtelCollector, hearbeats, apiServer])
      .apply(([traceOtelCollector, hearbeats, apiServer]) => {
        const def = [apiServer, traceOtelCollector, hearbeats];
        return JSON.stringify(def);
      });
    return containerDef;
  }

  /**
   * Our man API server contianer
   */
  static async createApiServer(
    name: string,
    traceOtelCollectorContainerName: string,
    appPort: number,
    constants: Config,
    secretsStore: StaticSecrets,
    enclaveKeyDescriptor: EnclaveKeyDescriptor,
    signingKeyDescriptor: HmacSigningKeyDescriptor,
    region: Region,
    database: DatabaseOutput,
    s3Buckets: s3.ServiceS3Buckets,
    metricsEndpointPath: string,
    nitroService: NitroServiceOutput,
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

    const image = `${current.accountId}.dkr.ecr.us-east-1.amazonaws.com/api:${constants.containers.apiVersion}`;
    return pulumi
      .all([
        enclaveKeyDescriptor.rootKeyId,
        enclaveKeyDescriptor.enclaveKmsCredentials.access_key_id,
        secretsStore.enclaveUserSecretKey.arn,
        secretsStore.enclaveSealedIkek.arn,
        database.databaseUrlSecretParam.arn,
        secretsStore.cookieSessionKey.arn,
        signingKeyDescriptor.rootKeyId,
        secretsStore.workosSecretKey.arn,
        secretsStore.twilioApiKey.arn,
        secretsStore.twilioApiKeySecret.arn,
        secretsStore.sendgridApiKey.arn,
        secretsStore.idologyUsername.arn,
        secretsStore.idologyPassword.arn,
        secretsStore.enclaveProxySecret.arn,
        secretsStore.socureSandboxApiKey.arn,
      ])
      .apply(
        ([
          rootKeyId,
          enclaveAccessKeyId,
          enclaveUserArn,
          sealedIkekHexArn,
          databaseUrlArn,
          cookieSessionKeyArn,
          signingKeyId,
          workosSecretKey,
          twilioApiKey,
          twilioApiKeySecret,
          sendgridApiKey,
          idologyUsername,
          idologyPassword,
          enclaveProxySecret,
          socureSandboxApiKey,
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
                name: 'ENCLAVE_SEALED_IKEK_HEX',
                valueFrom: sealedIkekHexArn,
              },
              {
                name: 'DATABASE_URL',
                valueFrom: databaseUrlArn,
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
                name: 'ENCLAVE_PROXY_SECRET',
                valueFrom: enclaveProxySecret,
              },
              {
                name: 'SOCURE_SANDBOX_API_KEY',
                valueFrom: socureSandboxApiKey,
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
                value: 'INFO',
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
                value: `service.name=fpc-api,service.version=1.0,deployment.environment=${pulumi.getStack()}`,
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
                name: 'SENTRY_URL',
                value: constants.sentryUrl,
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
                name: 'SENDGRID_FROM_EMAIL',
                value: constants.sendgrid.fromEmail,
              },
              {
                name: 'INTEGRATION_TEST_PHONE_NUMBER',
                value: constants.twilio.integrationTestPhoneNumber,
              },
              {
                name: 'DOCUMENT_S3_BUCKET',
                value: s3Buckets.documentImages.bucketName,
              },
              {
                name: 'METRICS_ENDPOINT_PATH',
                value: `${metricsEndpointPath}`,
              },
              {
                name: 'ENCLAVE_PROXY_ENDPOINT',
                value: nitroService.serviceEndpoint,
              },
            ],
            dependsOn: [
              {
                containerName: traceOtelCollectorContainerName,
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
            logConfiguration: {
              logDriver: 'awslogs',
              options: {
                'awslogs-group': `/ecs/${name}_logs`,
                'awslogs-region': `${region}`,
                'awslogs-create-group': 'true',
                'awslogs-stream-prefix': 'ecs',
              },
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
    metricsEndpointPath: string,
  ): pulumi.Output<aws.ecs.ContainerDefinition> {
    const out = pulumi
      .all([
        secrets.traceOtelConfig.arn,
        secrets.elasticApmAgentKey.arn,
        secrets.grafanaPrometheusPushAuth.arn,
      ])
      .apply(([config, apiKey, grafanaPrometheusPushAuth]) => [
        {
          name: 'AOT_CONFIG_CONTENT',
          valueFrom: config,
        },
        {
          name: 'ELASTIC_APM_API_KEY',
          valueFrom: apiKey,
        },
        {
          name: 'GRAFANA_PROMETHEUS_PUSH_AUTH',
          valueFrom: grafanaPrometheusPushAuth,
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
              name: 'ELASTIC_APM_SERVER_ENDPOINT',
              value: constants.elastic.apmEndpoint,
            },
            {
              name: 'API_SERVER_TARGET',
              value: `localhost:${serverContainerPort}`,
            },
            {
              name: 'API_SERVER_METRICS_ENDPOINT_PATH',
              value: `${metricsEndpointPath}`,
            },
          ],
          logConfiguration: {
            logDriver: 'awslogs',
            options: {
              'awslogs-group': `/ecs/otelcollect_logs`,
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
   * A Heartbeat agent to ping /status
   */
  static createHeartbeatContainer(
    appName: string,
    appPort: number,
    secrets: StaticSecrets,
    constants: Config,
  ): pulumi.Output<aws.ecs.ContainerDefinition> {
    const serviceEnvironment = pulumi.getStack();

    const out = pulumi
      .all([secrets.elasticApiKey.arn])
      .apply(([apiKey]) => [
        {
          name: 'ELASTIC_APM_API_KEY',
          valueFrom: apiKey,
        },
      ])
      .apply(secrets => {
        let def: aws.ecs.ContainerDefinition = {
          name: 'heartbeat',
          image:
            'ghcr.io/onefootprint/heartbeat@sha256:56773827f9fb79264e46b95d128f448c0a4e49b9692ae3dd5bb408812e0efe82',
          essential: true,
          secrets,
          dependsOn: [{ containerName: appName, condition: 'START' }],
          environment: [
            {
              name: 'FPC_MONITOR_URL',
              value: `http://localhost:${appPort}/status`,
            },
            {
              name: 'FPC_ENV',
              value: serviceEnvironment,
            },
            {
              name: 'ELASTIC_APM_ID',
              value: constants.elastic.id,
            },
            {
              name: 'ELASTIC_CLOUD_ID',
              value: `heartbeat:${constants.elastic.heartbeatCloudId}`,
            },
          ],
        };

        return def;
      });

    return out;
  }
}
