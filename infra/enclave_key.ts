import * as pulumi from "@pulumi/pulumi"
import * as aws from "@pulumi/aws";
import { Region } from "@pulumi/aws";
import { Config } from "./config";

export interface EnclaveKeyDescriptor {
    rootKeyId: pulumi.Output<string>;
    enclaveParentCredentials: EnclaveKmsCredentials;
    enclaveKmsCredentials: EnclaveKmsCredentials;
}

export interface EnclaveKmsCredentials {
    access_key_id: pulumi.Output<string>;
    access_secret_key: pulumi.Output<string>;
}

export async function Initialize(config: Config, replicaRegions: Region[]): Promise<EnclaveKeyDescriptor> {

    const current = await aws.getCallerIdentity({});
    // todo: change parent to be role!
    const parentUser = new aws.iam.User(`enclave_parent`);
    const enclaveUser = new aws.iam.User(`enclave`);

    const keyPolicy = pulumi.all([parentUser.arn, enclaveUser.arn]).apply(([parentArn, enclaveArn]) => {
        const kp = JSON.stringify({
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
                {
                    "Effect": "Allow",
                    "Principal": {
                        "AWS": enclaveArn
                    },
                    "Action": "kms:Decrypt",
                    "Resource": "*",
                    "Condition": {
                        "StringEqualsIgnoreCase": {
                            "kms:RecipientAttestation:PCR8": config.enclaveCertPCR8
                        }
                    }
                },
                {
                    "Effect": "Allow",
                    "Principal": {
                        "AWS": parentArn
                    },
                    "Action": [
                        "kms:GenerateDataKeyPairWithoutPlaintext",
                        "kms:DescribeKey"
                    ],
                    "Resource": "*",
                }
            ]
        });
        return kp;
    });


    const rootKey = new aws.kms.Key(`enclave_master_root_key`, {
        multiRegion: true,
        customerMasterKeySpec: "SYMMETRIC_DEFAULT",
        keyUsage: "ENCRYPT_DECRYPT",
        policy: keyPolicy
    });

    const replicas = replicaRegions.map(region => {
        const provider = new aws.Provider(`kms-provider-${region}`, { region });
        return new aws.kms.ReplicaKey(`enclave_root_key_replica-${region}`, {
            description: "replica region key",
            policy: JSON.stringify(keyPolicy),
            primaryKeyArn: rootKey.arn,
        }, { provider });
    });

    const enclaveUserKey = new aws.iam.AccessKey(`enclave_user_access_key`, {
        user: enclaveUser.name
    });

    const enclaveParentKey = new aws.iam.AccessKey(`enclave_parent_access_key`, {
        user: parentUser.name
    });

    return {
        rootKeyId: rootKey.id,
        enclaveParentCredentials: {
            access_key_id: enclaveParentKey.id,
            access_secret_key: pulumi.secret(enclaveParentKey.secret),
        },
        enclaveKmsCredentials: {
            access_key_id: enclaveUserKey.id,
            access_secret_key: pulumi.secret(enclaveUserKey.secret),
        }
    }
}
