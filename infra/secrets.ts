import * as pulumi from "@pulumi/pulumi"
import * as random from "@pulumi/random";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import { Output } from "@pulumi/pulumi";
import * as fs from 'fs';
import { EnclaveKeyDescriptor } from "./enclave_key";

export interface StaticSecrets {
    cloudfrontSecret: pulumi.Output<string>;
    secretsPolicyArn: pulumi.Output<string>;
    elasticApiKey: aws.ssm.Parameter;
    otelConfig: aws.ssm.Parameter;
    enclaveParentSecretKey: aws.ssm.Parameter;
    enclaveUserSecretKey: aws.ssm.Parameter;
}

interface SecretConstants {
    elastic: ElasticSecrets
}

interface ElasticSecrets {
    apiKey: string
}
export async function LoadSecrets(config: pulumi.Config, enclaveKeyDescriptor: EnclaveKeyDescriptor): Promise<StaticSecrets> {
    const cloudfrontSecret = new random.RandomString("cf-alb-pass", { length: 44 }).result;
    const stack = pulumi.getStack();

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
        elasticApiKey: createSecretParameter(`elasticApiKey-${stack}`, secretConstants.elastic.apiKey),
        enclaveParentSecretKey: new aws.ssm.Parameter(`ssm-param-enclave-parent-key`, {
            type: "String",
            value: pulumi.secret(enclaveKeyDescriptor.enclaveParentCredentials.access_secret_key),
            name: `/static_secrets/enclave-parent-${stack}`,
        }),
        enclaveUserSecretKey: new aws.ssm.Parameter(`ssm-param-enclave-user-key`, {
            type: "String",
            value: pulumi.secret(enclaveKeyDescriptor.enclaveKmsCredentials.access_secret_key),
            name: `/static_secrets/enclave-user-${stack}`,
        }),
        otelConfig: new aws.ssm.Parameter(`ssm-param-otelconfig`, {
            type: "String",
            value: fs.readFileSync('./otel/config.yml', 'utf8'),
            name: `/static_secrets/otelconfig-${stack}`,
        })
    }
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