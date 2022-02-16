import { ec2, Region, route53, } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Output } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi"
import * as random from "@pulumi/random";
import { Secrets } from "./secrets";
import { Constants } from "./constants";
import { constants } from "buffer";

export abstract class Monitor {

    /// configures a container to log through firelens
    static logConfiguration(service: string, secrets: Secrets, constants: Constants): pulumi.Input<aws.ecs.LogConfiguration> {
        return {
            logDriver: "awsfirelens",
            //@ts-ignore
            "secretOptions": [
                {
                    "valueFrom": secrets.elasticApiKey.arn,
                    "name": "Cloud_Auth"
                }
            ],
            options: {
                "Name": "es",
                "Port": "9243",
                "Tag_Key tags": "tags",
                "Include_Tag_Key": "true",
                "Cloud_ID": constants.elastic.cloudId,
                "Index": "elastic_firelens",
                "tls": "On",
                "tls.verify": "Off"
            }
        }
    }

    /// a container that forwards logs via fluent bit to the firelens configuration
    static logrouter(region: Region): awsx.ecs.Container {
        return {
            image: "amazon/aws-for-fluent-bit:latest",
            essential: true,
            logConfiguration: {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-create-group": "true",
                    "awslogs-group": "firelens-container",
                    "awslogs-region": region,
                    "awslogs-stream-prefix": "firelens"
                }
            },
            firelensConfiguration: {
                type: "fluentbit",
                options: {
                    "config-file-type": "file",
                    "config-file-value": "/fluent-bit/configs/parse-json.conf",
                    "enable-ecs-log-metadata": "true"
                }
            }
        }
    }

    /// a datadog APM agent
    static otelCollector(secrets: Secrets, constants: Constants, region: Region): awsx.ecs.Container {

        const secretsEnv = pulumi.all([secrets.otelConfig.arn, secrets.elasticApiKey.arn]).apply(([config, apiKey]) => [
            {
                name: "AOT_CONFIG_CONTENT",
                valueFrom: config
            },
            {
                name: "ELASTIC_APM_API_KEY",
                valueFrom: apiKey
            }
        ]);

        return {
            image: "amazon/aws-otel-collector:latest",
            essential: true,
            secrets: secretsEnv,
            environment: [
                {
                    name: "ELASTIC_APM_SERVER_ENDPOINT",
                    value: constants.elastic.apmEndpoint
                },
            ]

        }
    }


}
