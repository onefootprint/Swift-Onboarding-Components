import * as pulumi from "@pulumi/pulumi"
import * as aws from "@pulumi/aws";
import { Region } from "@pulumi/aws";
import { Config } from "./config";

export interface HmacSigningKeyDescriptor {
    rootKeyId: pulumi.Output<string>;
    rootKeyArn: pulumi.Output<string>;
}

export async function Initialize(config: Config, replicaRegions: Region[]): Promise<HmacSigningKeyDescriptor> {
    const current = await aws.getCallerIdentity({});

    const keyPolicy = JSON.stringify({
        Version: "2012-10-17",
        Statement: [
            {
                "Sid": "Enable IAM User Permissions",
                "Effect": "Allow",
                "Principal": {
                    "AWS": `arn:aws:iam::${current.accountId}:root`
                },
                "Action": "kms:*",
                "Resource": "*"
            },
        ]
    });

    const rootKey = new aws.kms.Key(`hmac_signing_master_root_key`, {
        multiRegion: true,
        customerMasterKeySpec: "SYMMETRIC_DEFAULT", // TODO: change to HMAC_512
        keyUsage: "ENCRYPT_DECRYPT", // TODO: change to GENERATE_VERIFY
        policy: keyPolicy
    });

    const replicas = replicaRegions.map(region => {
        const provider = new aws.Provider(`kms-hmac-provider-${region}`, { region });
        return new aws.kms.ReplicaKey(`hmac_signing_root_key_replica-${region}`, {
            description: "replica region key",
            policy: JSON.stringify(keyPolicy),
            primaryKeyArn: rootKey.arn,
        }, { provider });
    });

    return {
        rootKeyId: rootKey.id,
        rootKeyArn: rootKey.arn
    }
}
