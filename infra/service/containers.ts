import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi"
import { StaticSecrets } from "../secrets";
import { Config } from "../config";
import { EnclaveKeyDescriptor } from "../enclave_key";
import { Region } from "@pulumi/aws";
import { DbOutput } from "../db";

export abstract class ServiceContainers {

    static async apiMain(appPort: number, constants: Config, secretsStore: StaticSecrets, enclaveKeyDescriptor: EnclaveKeyDescriptor, region: Region, parent: pulumi.Resource, database: DbOutput): Promise<pulumi.Output<string>> {
        const name = "fpc";

        // depends on otel
        const otelCollector = ServiceContainers.createOtelCollector(secretsStore, constants);

        const current = await aws.getCallerIdentity({});
        const image = `${current.accountId}.dkr.ecr.us-east-1.amazonaws.com/api:${constants.containers.apiVersion}`;

        const containerDef = pulumi.all([
            otelCollector,
            enclaveKeyDescriptor.rootKeyId,
            enclaveKeyDescriptor.enclaveKmsCredentials.access_key_id,
            secretsStore.enclaveUserSecretKey.arn,
            database.databaseUrlSecretParam.arn
        ]).apply(([otelCollector, rootKeyId, enclaveAccessKeyId, enclaveUserArn, databaseUrlArn]) => {
            const def = [{
                name,
                image,
                essential: true,
                secrets: [                    
                    {
                        name: "ENCLAVE_AWS_SECRET_ACCESS_KEY",
                        valueFrom: enclaveUserArn
                    },
                    {
                        name: "DATABASE_URL",
                        valueFrom: databaseUrlArn
                    }
                ],
                environment: [
                    {
                        name: "AWS_REGION",
                        value: `${region}`
                    },     
                    {
                        name: "AWS_ROOT_KEY_ID",
                        value: rootKeyId
                    },
                    {
                        name: "ENCLAVE_AWS_ACCESS_KEY_ID",
                        value: enclaveAccessKeyId
                    },
                    {
                        name: "RUST_LOG",
                        value: "INFO"
                    },
                    {
                        name: "PORT",
                        value: `${appPort}`
                    },
                    {
                        name: "OTEL_ENDPOINT",
                        value: "http://otelcollect:4317"
                    },
                    {
                        name: "OTEL_RESOURCE_ATTRIBUTES",
                        value: `service.name=fpc-api,service.version=1.0,deployment.environment=${pulumi.getStack()}`
                    }
                ],
                links: ["otelcollect:otelcollect"],
                dependsOn: [{ containerName: otelCollector.name, condition: "START" }],
                portMappings: [{
                    containerPort: appPort,
                    hostPort: 0,
                    protocol: "tcp"
                }],
                "logConfiguration": {
                    "logDriver": "awslogs",
                    "options": {
                        "awslogs-group": `/ecs/${name}_logs`,
                        "awslogs-region": `${region}`,
                        "awslogs-create-group": "true",
                        "awslogs-stream-prefix": "ecs",
                    }
                }
            }, otelCollector];

            return JSON.stringify(def);
        });

        return containerDef;
    }

    /**
     * OpenTelemetry Collector agent
     */
    static createOtelCollector(secrets: StaticSecrets, constants: Config): pulumi.Output<aws.ecs.ContainerDefinition> {
        const out = pulumi.all([secrets.otelConfig.arn, secrets.elasticApiKey.arn]).apply(([config, apiKey]) => [
            {
                name: "AOT_CONFIG_CONTENT",
                valueFrom: config
            },
            {
                name: "ELASTIC_APM_API_KEY",
                valueFrom: apiKey
            }
        ]).apply(secrets => {
            let def: aws.ecs.ContainerDefinition = {
                name: "otelcollect",
                image: "amazon/aws-otel-collector:latest",
                essential: true,
                secrets,
                portMappings: [{
                    containerPort: 4317,
                    hostPort: 0,
                    protocol: "tcp"
                }],
                environment: [
                    {
                        name: "ELASTIC_APM_SERVER_ENDPOINT",
                        value: constants.elastic.apmEndpoint
                    },
                ]
            };

            return def;
        });

        return out;
    }


}
