import { HmacSigningKeyDescriptor } from './hmac_key';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { StaticSecrets } from './secrets';
import { Config } from './config';
import { EnclaveKeyDescriptor } from './enclave_key';
import { Region } from '@pulumi/aws';
import { DbOutput } from './db';
import * as s3 from './s3';

export abstract class ServiceContainers {
  static async apiMain(
    appPort: number,
    constants: Config,
    secretsStore: StaticSecrets,
    enclaveKeyDescriptor: EnclaveKeyDescriptor,
    signingKeyDescriptor: HmacSigningKeyDescriptor,
    region: Region,
    parent: pulumi.Resource,
    database: DbOutput,
    s3Buckets: s3.S3Buckets,
  ): Promise<pulumi.Output<string>> {
    const traceOtelCollecterContainerName = 'otelcollect-trace';
    const promOtelCollecterContainerName = 'otelcollect-prom';
    const serverContainerName = 'fpc';

    // We strangely have two otel collector sidecars for each server process.
    // Traces are push-based (the API server tells the otel collector about traces as they happen)
    // while metrics are pull-based (the otel collector scrapes the /metrics endpoint on the API
    // server). AWS ECS won't allow us to create a cyclical dependency of networking `links`
    // containers sadly
    const traceOtelCollector = ServiceContainers.createTraceOtelCollector(
      traceOtelCollecterContainerName,
      serverContainerName,
      appPort,
      secretsStore,
      constants,
      region,
    );

    const promOtelCollector = ServiceContainers.createPrometheusOtelCollector(
      promOtelCollecterContainerName,
      serverContainerName,
      appPort,
      secretsStore,
      constants,
      region,
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
    );

    const containerDef = pulumi
      .all([traceOtelCollector, promOtelCollector, hearbeats, apiServer])
      .apply(
        ([traceOtelCollector, promOtelCollector, hearbeats, apiServer]) => {
          const def = [
            apiServer,
            traceOtelCollector,
            promOtelCollector,
            hearbeats,
          ];
          return JSON.stringify(def);
        },
      );
    return containerDef;
  }

  /**
   * API server
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
    database: DbOutput,
    s3Buckets: s3.S3Buckets,
  ): Promise<pulumi.Output<aws.ecs.ContainerDefinition>> {
    let serviceEnvironment: string;
    if (pulumi.getStack().startsWith('dev-')) {
      serviceEnvironment = 'preview';
    } else if (pulumi.getStack() === 'dev') {
      serviceEnvironment = 'development';
    } else if (pulumi.getStack() === 'prod') {
      serviceEnvironment = 'production';
    } else {
      serviceEnvironment = pulumi.getStack();
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
                value: `http://${traceOtelCollectorContainerName}:4317`,
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
                name: s3Buckets.documentImages.bucketName,
                value: s3Buckets.documentImages.envVarName,
              },
            ],
            links: [
              `${traceOtelCollectorContainerName}:${traceOtelCollectorContainerName}`,
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
                hostPort: 0,
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
   * OpenTelemetry Collector agent for traces
   */
  static createTraceOtelCollector(
    name: string,
    serverContainerName: string,
    serverContainerPort: number,
    secrets: StaticSecrets,
    constants: Config,
    region: Region,
  ): pulumi.Output<aws.ecs.ContainerDefinition> {
    const out = pulumi
      .all([secrets.traceOtelConfig.arn, secrets.elasticApmAgentKey.arn])
      .apply(([config, apiKey]) => [
        {
          name: 'AOT_CONFIG_CONTENT',
          valueFrom: config,
        },
        {
          name: 'ELASTIC_APM_API_KEY',
          valueFrom: apiKey,
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
              containerPort: 4317,
              hostPort: 0,
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
              value: `${serverContainerName}:${serverContainerPort}`,
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
   * OpenTelemetry Collector agent for prometheus
   */
  static createPrometheusOtelCollector(
    name: string,
    serverContainerName: string,
    serverContainerPort: number,
    secrets: StaticSecrets,
    constants: Config,
    region: Region,
  ): pulumi.Output<aws.ecs.ContainerDefinition> {
    const out = pulumi
      .all([
        secrets.promOtelConfig.arn,
        secrets.grafanaPrometheusPushAuth.arn,
        secrets.elasticApmAgentKey.arn,
      ])
      .apply(([config, grafanaPrometheusPushAuth, elasticApiKey]) => [
        {
          name: 'AOT_CONFIG_CONTENT',
          valueFrom: config,
        },
        {
          name: 'GRAFANA_PROMETHEUS_PUSH_AUTH',
          valueFrom: grafanaPrometheusPushAuth,
        },
        {
          name: 'ELASTIC_APM_API_KEY',
          valueFrom: elasticApiKey,
        },
      ])
      .apply(secrets => {
        let def: aws.ecs.ContainerDefinition = {
          name,
          image: 'amazon/aws-otel-collector:latest',
          essential: true,
          secrets,
          links: [`${serverContainerName}:${serverContainerName}`],
          dependsOn: [
            { containerName: serverContainerName, condition: 'START' },
          ],
          environment: [
            {
              name: 'ELASTIC_APM_SERVER_ENDPOINT',
              value: constants.elastic.apmEndpoint,
            },
            {
              name: 'API_SERVER_TARGET',
              value: `${serverContainerName}:${serverContainerPort}`,
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
   * Heartbeat agent
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
          links: [`${appName}:${appName}`],
          dependsOn: [{ containerName: appName, condition: 'START' }],
          linuxParameters: {
            capabilities: {
              add: ['NET_RAW'],
            },
          },
          environment: [
            {
              name: 'FPC_MONITOR_URL',
              value: `http://${appName}:${appPort}/status`,
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
