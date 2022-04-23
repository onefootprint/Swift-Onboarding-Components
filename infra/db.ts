import * as aws from "@pulumi/aws";
import { Region } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi"
import { Config } from "./config";
import * as random from "@pulumi/random";
import { StaticSecrets } from "./secrets";
import * as vpcUtil from './vpc';

export type DbConfig = {
    protectDeletion: boolean;
}

export type DbOutput = {
    databaseUrl: pulumi.Output<string>;
    databaseUrlSecretParam: aws.ssm.Parameter;
    db: aws.rds.Cluster;
}

/** TODO: 
    - private network for jump-box
    - check `applyImmediately`
*/ 
export async function CreateDB(vpcProvider: vpcUtil.VpcRegion, clusterName: string, constants: Config, secretsStore: StaticSecrets, dbConfig: DbConfig): Promise<DbOutput> {
    const user = "postgres";

    const auroraVpc = vpcProvider.vpc;

    const dbSubnetGroup = new aws.rds.SubnetGroup(`subnet-group-${clusterName}`, {
        subnetIds: auroraVpc.publicSubnetIds
    });

    const auroraVpcSecurityGroup = new awsx.ec2.SecurityGroup(`${clusterName}-aurora-sg`, {
        vpc: auroraVpc,
        ingress: [{ protocol: "-1", fromPort: 5432, toPort: 5432, cidrBlocks: [auroraVpc.vpc.cidrBlock] }],
        egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
    });
    
    const db = new aws.rds.Cluster(`aurora-${clusterName}`, {
        clusterIdentifier: `db-${clusterName}`,
        dbSubnetGroupName: dbSubnetGroup.name,
        databaseName: "footprint_db",
        storageEncrypted: true,
        engineVersion: "10.14",
        engine: "aurora-postgresql",
        engineMode: "serverless",
        masterPassword: secretsStore.dbPassword,
        masterUsername: user,
        applyImmediately: true,
        scalingConfiguration: {
            autoPause: false,
            minCapacity: 2,
        },
        vpcSecurityGroupIds: [auroraVpcSecurityGroup.id],
        skipFinalSnapshot: !dbConfig.protectDeletion,
        deletionProtection: dbConfig.protectDeletion,
    });

    const databaseUrl = pulumi.all([db.endpoint, secretsStore.dbPassword]).apply(([host, password]) => {
        return `postgresql://${user}:${password}@${host}`
    });

    const databaseUrlSecretParam = new aws.ssm.Parameter(`ssm-param-database-url-${clusterName}`, {
        type: "SecureString",
        value: databaseUrl,
        name: `/static_secrets/db-url-${clusterName}`,
    });

    await createDbJumpBox(clusterName, constants, databaseUrl, auroraVpcSecurityGroup, auroraVpc);
    
    return {
        databaseUrl,
        db,
        databaseUrlSecretParam
    };
}

export type DbJump = {
    ip: pulumi.Output<string>;
    dns: pulumi.Output<string>;
}
/**
 * Aurora Serverless is not accessible so we need a jump box
 */
async function createDbJumpBox(
    clusterName: string, 
    constants: Config, 
    dbUrl: pulumi.Output<string>, 
    securityGroup: awsx.ec2.SecurityGroup,
    vpc: awsx.ec2.Vpc
) {
    const size = "t2.micro";

    const jumpSg = new awsx.ec2.SecurityGroup(`jump-${clusterName}-sg`, {
        vpc,
        egress: [{ protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }],
    });

    const keypair = new aws.ec2.KeyPair(`jump-key-${clusterName}-sg`, {
        publicKey: constants.jumpBoxSSHPublicKey,
        keyNamePrefix: `jump-key-${clusterName}-sg`
    });
    
    const dbSecretName = `/db-jump/db-url-${clusterName}`;
    const dbSecret = new aws.ssm.Parameter(`ssm-param-jump-url-${clusterName}`, {
        type: "SecureString",
        value: dbUrl,
        name: dbSecretName,
        overwrite: true
    });
    
    const instanceRole = new aws.iam.Role(`jump-role-${clusterName}`, {
        assumeRolePolicy: {
            Version: "2012-10-17",
            Statement: [{
                Sid: "",
                Effect: "Allow",
                Principal: {
                    Service: "ec2.amazonaws.com",
                },
                Action: "sts:AssumeRole",
            }],
        },
        inlinePolicies: [
            {
                name: "get_db_url",
                policy: JSON.stringify({
                    Version: "2012-10-17",
                    Statement: [{
                        Action: [
                            "ssm:GetParameter"
                        ],
                        Effect: "Allow",
                        Resource: `arn:aws:ssm:*:*:parameter${dbSecretName}`,
                    }],
                }),
            }
        ]
    });

    const iamInstanceProfile = new aws.iam.InstanceProfile(`jump_profile-${clusterName}`, {
        role: instanceRole.name
    });

    let config = new pulumi.Config();
    let tailscaleAuthKey = config.get('tailscaleKey');

    let jumpHostname = `jump-${clusterName}`;

    const userData = `
#!/bin/bash

sudo yum update -y
sudo yum install postgresql jq yum-utils -y

# setup tailscale
sudo yum-config-manager --add-repo https://pkgs.tailscale.com/stable/centos/7/tailscale.repo
sudo yum install tailscale -y
sudo systemctl enable --now tailscaled
sudo tailscale up --authkey "${tailscaleAuthKey}" --advertise-exit-node --hostname "${jumpHostname}" --advertise-routes=10.0.0.0/24,10.0.1.0/24 --accept-dns=false

# setup db connect script
cat <<'EOF' > connect_db.sh
#!/bin/sh
export DB_SECRET_NAME="${dbSecretName}"
psql $(aws --region us-east-1 ssm get-parameter --name "${dbSecretName}" --with-decryption | jq -r ".Parameter.Value")
EOF

chmod +x connect_db.sh`;
    
    const jumpbox = new aws.ec2.Instance(`jump-${clusterName}`, {
        instanceType: size,   
        subnetId: (await vpc.publicSubnetIds)[0],
        vpcSecurityGroupIds: [ securityGroup.id, jumpSg.id ],
        ami: "ami-0f9fc25dd2506cf6d",
        userData: Buffer.from(userData).toString('base64'),
        keyName: keypair.keyName,
        associatePublicIpAddress: true,
        iamInstanceProfile,
    });
}