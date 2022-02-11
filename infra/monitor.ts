import { ec2, Region, route53, } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Output } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi"
import * as random from "@pulumi/random";
import { Secrets } from "./secrets";
import { Constants } from "./constants";

export abstract class DataDogMonitor {

    // unused for now...
    static setupFirehoseStreaming(region: Region, secrets: Secrets) {
        const provider = new aws.Provider(`provider-kinesis-${region}`, { region });

        const stream = new aws.kinesis.Stream(`dd-log-stream-${region}`, {
            streamModeDetails: { streamMode: "ON_DEMAND" },
        }, { provider });

        const role = new aws.iam.Role(`stream-role-${region}`, {
            assumeRolePolicy: {
                Version: "2008-10-17",
                Statement: [{
                    "Action": "sts:AssumeRole",
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "firehose.amazonaws.com"
                    }
                }]
            },
        });

        const rpa = new aws.iam.RolePolicyAttachment(`task-exec-${region}-policy`, {
            role: role.name,
            policyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
        });

        const delivery = new aws.kinesis.FirehoseDeliveryStream("dd-log-stream", {
            destination: "httpEndpoint",
            httpEndpointConfiguration: {
                accessKey: secrets.datadogApiKey.value,
                url: "https://aws-kinesis-http-intake.logs.datadoghq.com/v1/input"
            },
            kinesisSourceConfiguration: {
                kinesisStreamArn: stream.arn,
                roleArn: role.arn
            }
        });
    }

    /// configures a container to log through firelens
    static logConfiguration(service: string, secrets: Secrets): pulumi.Input<aws.ecs.LogConfiguration> {
        return {
            logDriver: "awsfirelens",
            //@ts-ignore
            "secretOptions": [
                {
                    "name": "apikey",
                    "valueFrom": secrets.datadogApiKey.arn
                }
            ],
            options: {
                "Name": "datadog",
                "dd_service": service,
                "dd_source": `${service}:ecs`,
                "dd_tags": "project:fluentbit",
                "provider": "ecs"
            }
        }
    }

    /// a container that forwards logs via fluent bit to the firelens configuration
    static logrouter(): awsx.ecs.Container {
        return {
            image: "amazon/aws-for-fluent-bit:latest",
            essential: true,
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
    static apmAgent(secrets: Secrets): awsx.ecs.Container {
        return {
            image: "public.ecr.aws/datadog/agent:latest",
            essential: true,
            portMappings: [
                {
                    hostPort: 8126,
                    protocol: "tcp",
                    containerPort: 8126
                }
            ],
            secrets: secrets.datadogApiKey.arn.apply(arn => {
                return [
                    {
                        name: "DD_API_KEY",
                        valueFrom: arn
                    }
                ]

            }),
            environment: [
                {
                    name: "DD_APM_ENABLED",
                    value: "true"
                },
                {
                    name: "ECS_FARGATE",
                    value: "true"
                },
                {
                    name: "DD_APM_NON_LOCAL_TRAFFIC",
                    value: "true"
                }
            ]

        }
    }


}
