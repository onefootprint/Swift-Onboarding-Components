import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi"
import { StaticSecrets } from "../secrets";
import { Config } from "../config";
import { EnclaveKeyDescriptor } from "../enclave_key";
import { Region } from "@pulumi/aws";

export abstract class ServiceContainers {

    static apiMain(appPort: number, constants: Config, secretsStore: StaticSecrets, enclaveKeyDescriptor: EnclaveKeyDescriptor, region: Region, parent: pulumi.Resource): pulumi.Output<string> {
        const name = "fpc";

        // depends on otel
        const otelCollector = ServiceContainers.createOtelCollector(secretsStore, constants);

        // build the image
        const image = awsx.ecs.Image.fromDockerBuild(`fpc-image-${region}`, {
            context: "../",
            dockerfile: "../api.dockerfile",
        });

        const imageName = pulumi.output(image.image(`${name}-image-${region}`, parent));

        const containerDef = pulumi.all([
            imageName,
            otelCollector,
            enclaveKeyDescriptor.rootKeyId,
            enclaveKeyDescriptor.enclaveParentCredentials.access_key_id,
            secretsStore.enclaveParentSecretKey.arn,
            enclaveKeyDescriptor.enclaveKmsCredentials.access_key_id,
            secretsStore.enclaveUserSecretKey.arn
        ]).apply(([img, otelCollector, rootKeyId, parentAccessKeyId, enclaveParentArn, enclaveAccessKeyId, enclaveUserArn]) => {
            const def = [{
                name,
                image: img,
                essential: true,
                secrets: [
                    {
                        name: "AWS_SECRET_ACCESS_KEY",
                        valueFrom: enclaveParentArn
                    },
                    {
                        name: "ENCLAVE_AWS_SECRET_ACCESS_KEY",
                        valueFrom: enclaveUserArn
                    }
                ],
                environment: [
                    {
                        name: "AWS_REGION",
                        value: `${region}`
                    },
                    {
                        name: "AWS_ACCESS_KEY_ID",
                        value: parentAccessKeyId
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
                        name: "OTEL_RESOURCE_ATTRIBUTES",
                        value: `service.name=fpc-api,service.version=1.0,deployment.environment=${pulumi.getStack()}`
                    }
                ],
                dependsOn: [{ containerName: otelCollector.name, condition: "START" }],
                portMappings: [{
                    containerPort: appPort,
                    hostPort: appPort,
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
            return {
                name: "otelcollect",
                image: "amazon/aws-otel-collector:latest",
                essential: true,
                secrets,
                environment: [
                    {
                        name: "ELASTIC_APM_SERVER_ENDPOINT",
                        value: constants.elastic.apmEndpoint
                    },
                ]
            }
        });

        return out;
    }


}
