import * as pulumi from "@pulumi/pulumi"
import * as random from "@pulumi/random";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import { Output } from "@pulumi/pulumi";

export interface Secrets {
    cloudfrontSecret: pulumi.Output<string>;
    elasticAuthSecret: aws.ssm.Parameter;
    secretsPolicyArn: pulumi.Output<string>;
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

    return {
        secretsPolicyArn: secretsPolicy.arn,
        cloudfrontSecret: pulumi.secret(cloudfrontSecret),
        elasticAuthSecret: createParameter("elasticAuthSecret", config),
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
function createParameter(name: string, config: pulumi.Config): aws.ssm.Parameter {
    const secret = new aws.ssm.Parameter(`ssm-param-${name}`, {
        type: "SecureString",
        value: config.requireSecret(name),
        name: `/static_secrets/${name}`,
    });

    return secret
}