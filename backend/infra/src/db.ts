import { CoreSecurityGroups } from './sg';
import * as aws from '@pulumi/aws';
import { Region } from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import * as pulumi from '@pulumi/pulumi';
import { Config } from './config';
import * as random from '@pulumi/random';
import { StaticSecrets } from './secrets';
import { FootprintVpc, Vpc } from './vpc';
import { EngineType } from '@pulumi/aws/rds';
import * as inputs from '@pulumi/aws/types';

export type DbConfig = {
  protectDeletion: boolean;
};

export type DatabaseOutput = {
  databaseUrl: pulumi.Output<string>;
  readOnlyDatabaseUrl: pulumi.Output<string>;
  databaseUrlSecretParam: aws.ssm.Parameter;
  databaseUrlSecretName: string;
  db: aws.rds.Cluster;
  instances: aws.rds.ClusterInstance[];
};

export async function CreateDB(
  vpc: FootprintVpc,
  provider: aws.Provider,
  clusterIdentifier: string,
  constants: Config,
  secretsStore: StaticSecrets,
  dbConfig: DbConfig,
  coreSecurityGroups: CoreSecurityGroups,
): Promise<DatabaseOutput> {
  const user = 'footprint';
  const databaseName = 'footprint';

  const databaseSecurityGroup = new awsx.ec2.SecurityGroup(
    `${clusterIdentifier}-db-sg2`,
    {
      vpc: vpc.vpc,
      ingress: [
        {
          protocol: '-1',
          fromPort: 5432,
          toPort: 5432,
          sourceSecurityGroupId: coreSecurityGroups.fpcService.id,
          description: 'Allows inbound DB connections from the FPC service',
        },
        {
          protocol: '-1',
          fromPort: 5432,
          toPort: 5432,
          sourceSecurityGroupId: coreSecurityGroups.jumpbox.id,
          description: 'Allows inbound DB connections from the jumpbox',
        },
        {
          protocol: '-1',
          fromPort: 5432,
          toPort: 5432,
          sourceSecurityGroupId: coreSecurityGroups.airplane.id,
          description: 'Allows inbound DB connections from the airplane-agent',
        },
      ],
    },
  );

  const subnet = new aws.rds.SubnetGroup(`${clusterIdentifier}-subnet-group`, {
    subnetIds: vpc.privateSubnetIds,
  });

  const db = new aws.rds.Cluster(`aurora-v2-${clusterIdentifier}`, {
    clusterIdentifier: `${clusterIdentifier}`,
    databaseName,
    storageEncrypted: true,
    dbSubnetGroupName: subnet.name,
    engineVersion: '14.3',
    allowMajorVersionUpgrade: false,
    engine: EngineType.AuroraPostgresql,
    engineMode: 'provisioned',
    masterPassword: secretsStore.dbPassword,
    masterUsername: user,
    applyImmediately: true,
    snapshotIdentifier: await getSnapshotIdIfNeeded(clusterIdentifier),
    vpcSecurityGroupIds: [databaseSecurityGroup.id],
    skipFinalSnapshot: !dbConfig.protectDeletion,
    deletionProtection: dbConfig.protectDeletion,
    restoreToPointInTime: await getRestorePointIfNeeded(),
    serverlessv2ScalingConfiguration: {
      maxCapacity: 16,
      minCapacity: 2,
    },
    backupRetentionPeriod: 7,
  });

  const _dbInstance = new aws.rds.ClusterInstance(`${clusterIdentifier}-1`, {
    clusterIdentifier: db.id,
    instanceClass: 'db.serverless',
    engine: EngineType.AuroraPostgresql,
    engineVersion: db.engineVersion,
    performanceInsightsEnabled: true,
  });

  const _dbInstance2 = new aws.rds.ClusterInstance(`${clusterIdentifier}-2`, {
    clusterIdentifier: db.id,
    instanceClass: 'db.serverless',
    engine: EngineType.AuroraPostgresql,
    engineVersion: db.engineVersion,
    performanceInsightsEnabled: true,
  });

  const { rw: databaseUrl, ro: readOnlyDatabaseUrl } = pulumi
    .all([db.endpoint, db.readerEndpoint, secretsStore.dbPassword])
    .apply(([host, roHost, password]) => {
      const rw = `postgresql://${user}:${password}@${host}`;
      const ro = `postgresql://${user}:${password}@${roHost}`;
      return { rw, ro };
    });

  const dbSecretName = `/db/url-${clusterIdentifier}`;
  const databaseUrlSecretParam = new aws.ssm.Parameter(
    `ssm-param-database-conn-${clusterIdentifier}`,
    {
      type: 'SecureString',
      value: databaseUrl,
      name: dbSecretName,
    },
  );

  const jump = await createDbJumpBox(
    clusterIdentifier,
    dbSecretName,
    coreSecurityGroups.jumpbox,
    vpc,
    provider,
  );

  return {
    databaseUrl,
    readOnlyDatabaseUrl,
    db,
    databaseUrlSecretParam,
    databaseUrlSecretName: dbSecretName,
    instances: [_dbInstance, _dbInstance2],
  };
}

async function getSnapshotIdIfNeeded(
  clusterIdentifier: string,
): Promise<pulumi.Output<string> | undefined> {
  let config = new pulumi.Config();
  let clusterId = config.get('restoreSnapshotFromClusterNamed');
  if (clusterId === undefined) {
    return undefined;
  }

  let parentCluster;
  try {
    parentCluster = await aws.rds.getCluster({
      clusterIdentifier: `${clusterId}`,
    });
  } catch (error) {
    console.log(`error getting DB cluster snapshot: ${error}`);
    return undefined;
  }

  // don't support for PG < 14
  if (parseInt(parentCluster.engineVersion) < 14) {
    return undefined;
  }

  const snapshot = new aws.rds.ClusterSnapshot(`branch-snapshot-${clusterId}`, {
    dbClusterIdentifier: parentCluster.clusterIdentifier,
    dbClusterSnapshotIdentifier: `branch-${clusterId}`,
  });

  return snapshot.id;
}

async function getRestorePointIfNeeded(): Promise<
  inputs.input.rds.ClusterRestoreToPointInTime | undefined
> {
  let config = new pulumi.Config();
  let clusterId = config.get('restoreSnapshotFromClusterNamed');
  if (clusterId === undefined) {
    return undefined;
  }

  let parentCluster;
  try {
    parentCluster = await aws.rds.getCluster({
      clusterIdentifier: clusterId,
    });
  } catch (error) {
    console.log(`error getting DB cluster snapshot: ${error}`);
    return undefined;
  }

  // don't support for PG < 14
  if (parseInt(parentCluster.engineVersion) < 14) {
    return undefined;
  }

  return {
    useLatestRestorableTime: true,
    sourceClusterIdentifier: parentCluster.clusterIdentifier,
  };
}

export type DbJump = {
  ip: pulumi.Output<string>;
  dns: pulumi.Output<string>;
};
/**
 * Aurora Serverless is not accessible so we need a jump box
 */
async function createDbJumpBox(
  clusterId: string,
  dbSecretName: string,
  securityGroup: awsx.ec2.SecurityGroup,
  vpc: FootprintVpc,
  provider: aws.Provider,
): Promise<aws.ec2.Instance> {
  const size = 't2.micro';

  const instanceRole = new aws.iam.Role(`jump-role-${clusterId}`, {
    assumeRolePolicy: {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: '',
          Effect: 'Allow',
          Principal: {
            Service: 'ec2.amazonaws.com',
          },
          Action: 'sts:AssumeRole',
        },
      ],
    },
    inlinePolicies: [
      {
        name: 'get_db_url',
        policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Action: ['ssm:GetParameter'],
              Effect: 'Allow',
              Resource: `arn:aws:ssm:*:*:parameter${dbSecretName}`,
            },
          ],
        }),
      },
    ],
  });

  const iamInstanceProfile = new aws.iam.InstanceProfile(
    `jump_profile-${clusterId}`,
    {
      role: instanceRole.name,
    },
  );

  let config = new pulumi.Config();
  let tailscaleAuthKey = config.get('tailscaleKey');

  let jumpHostname = `jumpbox-${pulumi.getStack()}`;

  const userData = `
#!/bin/bash

sudo yum update -y
sudo yum install amazon-linux-extras -y
sudo amazon-linux-extras enable postgresql14 -y
sudo yum install postgresql jq yum-utils -y

# setup tailscale
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p /etc/sysctl.conf

sudo yum-config-manager --add-repo https://pkgs.tailscale.com/stable/centos/7/tailscale.repo
sudo yum install tailscale nc -y
sudo systemctl enable --now tailscaled
sudo tailscale up --authkey "${tailscaleAuthKey}" --ssh --advertise-exit-node --hostname "${jumpHostname}" --advertise-routes=${vpc.cidrBlock}

# setup db access helper
cat <<'EOF' > db_proxy.sh
#!/bin/sh
export DB_SECRET_NAME="${dbSecretName}"
export DATABASE_URL="$(aws --region us-east-1 ssm get-parameter --name "${dbSecretName}" --with-decryption | jq -r ".Parameter.Value")"
export DATABASE_HOST="$(echo $DATABASE_URL | cut -d "@" -f2)"
echo "database=$DATABASE_HOST"
echo "password=$(echo $DATABASE_URL | cut -d "@" -f1 | cut -d ":" -f3)"
ncat -l 0.0.0.0 5432 --sh-exec "ncat $DATABASE_HOST 5432"
EOF

chmod +x db_proxy.sh

# setup db connect script
cat <<'EOF' > connect_db.sh
#!/bin/sh
export DB_SECRET_NAME="${dbSecretName}"
psql $(aws --region us-east-1 ssm get-parameter --name "${dbSecretName}" --with-decryption | jq -r ".Parameter.Value")
EOF

chmod +x connect_db.sh`;

  const jumpbox = new aws.ec2.Instance(
    `jumpbox-${clusterId}`,
    {
      instanceType: size,
      subnetId: vpc.privateSubnetIds[0],
      vpcSecurityGroupIds: [securityGroup.id],
      ami: 'ami-0f9fc25dd2506cf6d',
      userData: Buffer.from(userData).toString('base64'),
      iamInstanceProfile,
      associatePublicIpAddress: false,
      tags: {
        name: jumpHostname,
      },
    },
    { provider },
  );

  return jumpbox;
}

/**
 *
 */
