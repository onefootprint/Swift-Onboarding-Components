import * as pulumi from "@pulumi/pulumi"
import * as random from "@pulumi/random";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import { Output } from "@pulumi/pulumi";
import * as fs from 'fs';

export interface Secrets {
    cloudfrontSecret: pulumi.Output<string>;
    secretsPolicyArn: pulumi.Output<string>;
    elasticApiKey: aws.ssm.Parameter;
    otelConfig: aws.ssm.Parameter;
}

interface SecretConstants {
    elastic: ElasticSecrets
}

interface ElasticSecrets {
    apiKey: string
}

export async function LoadSecrets(config: pulumi.Config): Promise<Secrets> {
    const cloudfrontSecret = new random.RandomString("cf-alb-pass", { length: 44 }).result;

    const secretsPolicy = new aws.iam.Policy("secrets_parameter_read_access", {
        policy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [{
                Action: [
                    "ssm:GetParameters",
                    "ssm:GetParameter"
                ],
                Effect: "Allow",
                Resource: "arn:aws:ssm:*:*:parameter/static_secrets/*",
            }],
        }),
    });

    const secretConstants = config.requireSecretObject<SecretConstants>("constants");

    return {
        secretsPolicyArn: secretsPolicy.arn,
        cloudfrontSecret: pulumi.secret(cloudfrontSecret),
        elasticApiKey: createSecretParameter("elasticApiKey", secretConstants.elastic.apiKey),
        otelConfig: new aws.ssm.Parameter(`ssm-param-otelconfig`, {
            type: "String",
            value: fs.readFileSync('./otel/config.yml', 'utf8'),
            name: `/static_secrets/otelconfig`,
        })
    }
}

function GetValue<T>(output: Output<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        output.apply(value => {
            resolve(value);
        });
    });
}

/// create a secret param
function createSecretParameter(name: string, secretVal: pulumi.Output<string>): aws.ssm.Parameter {
    const secret = new aws.ssm.Parameter(`ssm-param-${name}`, {
        type: "SecureString",
        value: secretVal,
        name: `/static_secrets/${name}`,
    });

    return secret
}