import { ec2, Region, route53, } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Output } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi"
import * as random from "@pulumi/random";
import { Secrets } from "./secrets";
import { Config } from "./config";
import { constants } from "buffer";

export abstract class Monitor {

    /// a datadog APM agent
    static otelCollector(secrets: Secrets, constants: Config, region: Region): awsx.ecs.Container {

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
