import { ec2, Region, route53, } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Output } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi"
import * as random from "@pulumi/random";
import { StaticSecrets } from "./secrets";
import { Config } from "./config";
import { constants } from "buffer";

export abstract class Monitor {

    /// a datadog APM agent
    static otelCollector(secrets: StaticSecrets, constants: Config, region: Region): pulumi.Output<aws.ecs.ContainerDefinition> {
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
