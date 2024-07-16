import { StackEnvironment, StackMetadata } from './stack_metadata';
import { CoreSecurityGroups } from './sg';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import * as pulumi from '@pulumi/pulumi';
import { Config } from './config';
import { StaticSecrets } from './secrets';
import { FootprintVpc, Vpc } from './vpc';
import { EngineType } from '@pulumi/aws/rds';
import { Database } from './config';
import * as inputs from '@pulumi/aws/types';
import * as tailscale from '@pulumi/tailscale';

// Parameters set on both the cluster and instance PG
const DEFAULT_PG_PARAMETERS = [
  // Kill queries that have a deadlock detected after 1s
  {
    name: 'deadlock_timeout',
    value: '1000', // 1s
  },
  // Kill connections that have a transaction open and haven't sent any queries for 1m
  {
    name: 'idle_in_transaction_session_timeout',
    value: '60000', // 1m
  },
  // Set an unreasonably high cap on the number of connections (the default is more unreasonably high)
  {
    name: 'max_connections',
    value: '500',
    applyMethod: 'pending-reboot',
  },
  // Don't allow any singular query to run for more than 10m. Long-running query workloads will need to override this.
  {
    name: 'statement_timeout',
    value: '600000', // 10m
  },
  // Tune query planning
  {
    name: 'random_page_cost',
    value: '1.1',
  },
  {
    name: 'log_connections',
    value: '1',
  },
  {
    name: 'log_disconnections',
    value: '1',
  },
  {
    name: 'log_lock_waits',
    value: '1',
  },
  {
    name: 'log_statement',
    value: 'ddl',
  },
  {
    name: 'log_temp_files',
    value: '0',
  },
];

const DEFAULT_PG_CLUSTER_PARAMETERS = [
  {
    name: 'log_autovacuum_min_duration',
    value: '1000',
  },
  {
    name: 'rds.logical_replication',
    value: 'logical',
  }
];

export type DatabaseOutput = {
  databaseUrl: pulumi.Output<string>;
  readOnlyDatabaseUrl: pulumi.Output<string>;
  databaseUrlSecretParam: aws.ssm.Parameter;
  databaseUrlSecretName: string;
  db: aws.rds.Cluster | undefined;
  instances: aws.rds.ClusterInstance[];
};

export async function CreateDB(
  vpc: FootprintVpc,
  provider: aws.Provider,
  clusterIdentifier: string,
  secretsStore: StaticSecrets,
  dbConfig: Database,
  coreSecurityGroups: CoreSecurityGroups,
  stackMetadata: StackMetadata,
): Promise<DatabaseOutput> {
  const user = 'footprint';
  const roUser = 'footprint_ro';
  // We'll use a different user to log into interactive sessions from the jumpbox - this lets us
  // set more reasonable defaults for interactive sessions and allows us to track which queries
  // came from an interactive session
  const jbUser = 'footprint_jb';
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
          sourceSecurityGroupId: coreSecurityGroups.jumpboxReadOnly.id,
          description:
            'Allows inbound DB connections from the jumpbox (readonly)',
        },       
        {
          protocol: '-1',
          fromPort: 5432,
          toPort: 5432,
          sourceSecurityGroupId: coreSecurityGroups.airplane.id,
          description: 'Allows inbound DB connections from the airplane-agent',
        },
        {
          protocol: '-1',
          fromPort: 5432,
          toPort: 5432,
          sourceSecurityGroupId: coreSecurityGroups.cron.id,
          description: 'Allows inbound DB connections from cron jobs',
        },
        {
          protocol: '-1',
          fromPort: 5432,
          toPort: 5432,
          sourceSecurityGroupId: coreSecurityGroups.worker.id,
          description: 'Allows inbound DB connections from worker jobs',
        },
      ],
    },
  );

  const subnet = new aws.rds.SubnetGroup(`${clusterIdentifier}-subnet-group`, {
    subnetIds: vpc.privateSubnetIds,
  });

  const clusterParameterGroupName = `fpc-pg-cluster-${clusterIdentifier}`;
  new aws.rds.ClusterParameterGroup(clusterParameterGroupName, {
    name: clusterParameterGroupName,
    family: 'aurora-postgresql14',
    parameters: DEFAULT_PG_PARAMETERS.concat(DEFAULT_PG_CLUSTER_PARAMETERS),
  });

  const instanceParameterGroupName = `fpc-pg-instance-${clusterIdentifier}`;
  new aws.rds.ParameterGroup(instanceParameterGroupName, {
    name: instanceParameterGroupName,
    family: 'aurora-postgresql14',
    parameters: DEFAULT_PG_PARAMETERS,
  });

  const newClusterParameterGroupName = `fpc-pg-cluster-${clusterIdentifier}-16`;
  new aws.rds.ClusterParameterGroup(newClusterParameterGroupName, {
    name: newClusterParameterGroupName,
    family: 'aurora-postgresql16',
    parameters: DEFAULT_PG_PARAMETERS.concat(DEFAULT_PG_CLUSTER_PARAMETERS),
  });

  const newInstanceParameterGroupName = `fpc-pg-instance-${clusterIdentifier}-16`;
  new aws.rds.ParameterGroup(newInstanceParameterGroupName, {
    name: newInstanceParameterGroupName,
    family: 'aurora-postgresql16',
    parameters: DEFAULT_PG_PARAMETERS,
  });

  const db = new aws.rds.Cluster(`aurora-v2-${clusterIdentifier}`, {
    clusterIdentifier: `${clusterIdentifier}`,
    databaseName,
    storageEncrypted: true,
    dbSubnetGroupName: subnet.name,
    engineVersion: '14.5',
    allowMajorVersionUpgrade: false,
    engine: EngineType.AuroraPostgresql,
    engineMode: 'provisioned',
    masterPassword: secretsStore.dbWritePassword,
    masterUsername: user,
    applyImmediately: true,
    snapshotIdentifier: await getSnapshotIdIfNeeded(clusterIdentifier),
    vpcSecurityGroupIds: [databaseSecurityGroup.id],
    skipFinalSnapshot: !dbConfig.deletionProtection,
    deletionProtection: dbConfig.deletionProtection,
    restoreToPointInTime: await getRestorePointIfNeeded(),
    dbClusterParameterGroupName: clusterParameterGroupName,
    dbInstanceParameterGroupName: instanceParameterGroupName,
    serverlessv2ScalingConfiguration: {
      maxCapacity: dbConfig.maxAcus,
      minCapacity: dbConfig.minAcus,
    },
    backupRetentionPeriod: 7,
  });

  const enhancedMonitoringRoleName = `${clusterIdentifier}-rds-monitoring-role`;
  const enhancedMonitoringRole = new aws.iam.Role(enhancedMonitoringRoleName, {
    name: enhancedMonitoringRoleName,
    assumeRolePolicy: {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: '',
          Effect: 'Allow',
          Principal: {
            Service: 'monitoring.rds.amazonaws.com',
          },
          Action: 'sts:AssumeRole',
        },
      ],
    },
  });
  new aws.iam.RolePolicyAttachment(
    `${enhancedMonitoringRoleName}-policy-attachment`,
    {
      role: enhancedMonitoringRole.name,
      policyArn:
        'arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole',
    },
  );

  const _dbInstance = new aws.rds.ClusterInstance(`${clusterIdentifier}-1`, {
    clusterIdentifier: db.id,
    instanceClass: 'db.serverless',
    engine: EngineType.AuroraPostgresql,
    engineVersion: db.engineVersion,
    dbParameterGroupName: instanceParameterGroupName,
    autoMinorVersionUpgrade: false,
    performanceInsightsEnabled: true,
    monitoringInterval: 60,
    monitoringRoleArn: enhancedMonitoringRole.arn,
  });

  const _dbInstance2 = new aws.rds.ClusterInstance(`${clusterIdentifier}-2`, {
    clusterIdentifier: db.id,
    instanceClass: 'db.serverless',
    engine: EngineType.AuroraPostgresql,
    engineVersion: db.engineVersion,
    dbParameterGroupName: instanceParameterGroupName,
    autoMinorVersionUpgrade: false,
    performanceInsightsEnabled: true,
    monitoringInterval: 60,
    monitoringRoleArn: enhancedMonitoringRole.arn,
  });

  const {
    rw: rwDatabaseUrl,
    ro: readOnlyDatabaseUrl,
    jbRw: jbRwDatabaseUrl,
  } = pulumi
    .all([
      db.endpoint,
      db.readerEndpoint,
      secretsStore.dbWritePassword,
      secretsStore.dbReadOnlyPassword,
      secretsStore.jbDbWritePassword,
    ])
    .apply(([host, roHost, rwPassword, roPassword, jbRwPassword]) => {
      const rw = `postgresql://${user}:${rwPassword}@${host}`;
      const ro = `postgresql://${roUser}:${roPassword}@${roHost}/${databaseName}`;
      const jbRw = `postgresql://${jbUser}:${jbRwPassword}@${host}/${databaseName}`;
      return { rw, ro, jbRw };
    });

  const dbSecretName = `/db/url-${clusterIdentifier}`;
  const databaseUrlSecretParam = new aws.ssm.Parameter(
    `ssm-param-database-conn-${clusterIdentifier}`,
    {
      type: 'SecureString',
      value: rwDatabaseUrl,
      name: dbSecretName,
    },
  );

  const dbJbSecretName = `/db/url-jb-${clusterIdentifier}`;
  new aws.ssm.Parameter(
    `ssm-param-database-conn-jumpbox-${clusterIdentifier}`,
    {
      type: 'SecureString',
      value: jbRwDatabaseUrl,
      name: dbJbSecretName,
    },
  );

  const dbReadOnlySecretName = `/db/url-ro-${clusterIdentifier}`;
  new aws.ssm.Parameter(
    `ssm-param-database-conn-readonly-${clusterIdentifier}`,
    {
      type: 'SecureString',
      value: readOnlyDatabaseUrl,
      name: dbReadOnlySecretName,
    },
  );

  // Since the jumpbox DB user requires manual setup that we've only done in dev and prod, just use
  // the normal DB user in ephemeral environments
  let jumpboxRwSecretName;
  if (stackMetadata.environment === StackEnvironment.DevEphemeral) {
    jumpboxRwSecretName = dbSecretName;
  } else {
    jumpboxRwSecretName = dbJbSecretName;
  }

  const jump = await createDbJumpBox(
    clusterIdentifier,
    jumpboxRwSecretName,
    dbReadOnlySecretName,
    coreSecurityGroups.jumpbox,
    vpc,
    provider,
    stackMetadata,
  );

  const jumpRo = await createReadOnlyDbJumpBox(
    clusterIdentifier,
    dbReadOnlySecretName,
    coreSecurityGroups.jumpboxReadOnly,
    vpc,
    provider,
    stackMetadata,
  );

  return {
    databaseUrl: rwDatabaseUrl,
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
  dbReadWriteUrlSecretName: string,
  dbReadOnlyUrlSecretName: string,
  securityGroup: awsx.ec2.SecurityGroup,
  vpc: FootprintVpc,
  provider: aws.Provider,
  stack: StackMetadata,
): Promise<aws.ec2.Instance> {
  const size = 't2.micro';

  // generate a tailscale key accessing the jumpbox
  let tag = '';
  if (stack.environment === StackEnvironment.DevEphemeral) {
    tag = `tag:jumpbox-dev`;
  } else {
    tag = `tag:jumpbox-${stack.shortStackName}`;
  }

  const tailscaleAuthKey = new tailscale.TailnetKey(
    `jump-tskey-${stack.shortStackName}`,
    {
      ephemeral: true,
      preauthorized: true,
      reusable: true,
      tags: [tag],
    },
  );

  // store the TS-key in SSM
  const tsKeySecretName = `/db/ts-key-${clusterId}`;
  new aws.ssm.Parameter(`ssm-param-ts-key-jumpbox-${clusterId}`, {
    type: 'SecureString',
    value: tailscaleAuthKey.key,
    name: tsKeySecretName,
  });

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
        name: 'jumpbox_policies',
        policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Action: ['ssm:GetParameter'],
              Effect: 'Allow',
              Resource: `arn:aws:ssm:*:*:parameter${dbReadWriteUrlSecretName}`,
            },
            {
              Action: ['ssm:GetParameter'],
              Effect: 'Allow',
              Resource: `arn:aws:ssm:*:*:parameter${dbReadOnlyUrlSecretName}`,
            },
            {
              Action: ['ssm:GetParameter'],
              Effect: 'Allow',
              Resource: `arn:aws:ssm:*:*:parameter${tsKeySecretName}`,
            },
          ],
        }),
      },
      {
        name: 'cloudwatch_logging',
        policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Action: [
                'logs:CreateLogGroup',
                'logs:PutLogEvents',
                'logs:DescribeLogStreams',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
              ],
              Effect: 'Allow',
              Resource: '*',
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

  let jumpHostname = `jumpbox-write-${stack.shortStackName}`;

  const userData = pulumi.interpolate`
#!/bin/bash

sudo yum update -y
sudo yum install amazon-linux-extras -y
sudo amazon-linux-extras enable postgresql14 -y
sudo yum install postgresql jq yum-utils -y

### AWS LOGS ###

# install log agent on ec2 instance
sudo yum install -y awslogs
sudo mkdir -p /var/lib/awslogs/state/

# Define our log conf files
# see https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AgentReference.html
cat <<'EOF' > /etc/awslogs/awslogs.conf
[general]
state_file=/var/lib/awslogs/state/agent-state

[/var/log/awslogs]
log_group_name=/ec2/${jumpHostname}-logs
log_stream_name={instance_id}
time_zone=UTC
file=/var/log/awslogs*
initial_position=start_of_file

[/var/log/boot]
log_group_name=/ec2/${jumpHostname}-boot
log_stream_name={instance_id}
time_zone=UTC
file=/var/log/boot*
initial_position=start_of_file

[/var/log/cloud-init]
log_group_name=/ec2/${jumpHostname}-cloud-init
log_stream_name={instance_id}
time_zone=UTC
file=/var/log/cloud-init*.log
initial_position=start_of_file
EOF

# start logging daemon
sudo systemctl start awslogsd

### END AWS LOGS ###

### BEGIN SETUP TAILSCALE ###
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p /etc/sysctl.conf

sudo yum-config-manager --add-repo https://pkgs.tailscale.com/stable/centos/7/tailscale.repo
sudo yum install tailscale nc -y
sudo systemctl enable --now tailscaled

cat <<'EOF' > tailscale_connect.sh
#!/bin/sh
export TS_KEY="$(aws --region us-east-1 ssm get-parameter --name '${tsKeySecretName}' --with-decryption | jq -r '.Parameter.Value')"
sudo tailscale up --authkey "$TS_KEY" --ssh --advertise-exit-node --hostname "${jumpHostname}" --advertise-routes=${vpc.cidrBlock} --accept-routes
EOF

chmod +x tailscale_connect.sh

cat <<'EOF' > tailscale_connect.service
[Unit]
Description=tailscale_connect

[Service]
User=root
WorkingDirectory=/
ExecStart="/tailscale_connect.sh"
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo cp tailscale_connect.service /etc/systemd/system/tailscale_connect.service
sudo systemctl start tailscale_connect.service && sudo systemctl enable tailscale_connect.service

### END SETUP TAILSCALE ###

### BEGIN setup db access helper ###
cat <<'EOF' > db_proxy.sh
#!/bin/sh
export DATABASE_URL="$(aws --region us-east-1 ssm get-parameter --name "${dbReadOnlyUrlSecretName}" --with-decryption | jq -r ".Parameter.Value")"
export DATABASE_HOST="$(echo $DATABASE_URL | cut -d "@" -f2)"
echo "database=$DATABASE_HOST"
echo "password=$(echo $DATABASE_URL | cut -d "@" -f1 | cut -d ":" -f3)"
ncat -l 0.0.0.0 5432 --sh-exec "ncat $DATABASE_HOST 5432"
EOF

chmod +x db_proxy.sh

# setup db connect script
cat <<'EOF' > connect_db.sh
#!/bin/sh
if [[ $* == *--write* ]]
then
  printf "\nWARNING: accessing Read/Write node\n"
  psql $(aws --region us-east-1 ssm get-parameter --name "${dbReadWriteUrlSecretName}" --with-decryption | jq -r ".Parameter.Value")
else
  printf "\nWARNING: accessing READ ONLY node\n"
  psql $(aws --region us-east-1 ssm get-parameter --name "${dbReadOnlyUrlSecretName}" --with-decryption | jq -r ".Parameter.Value")
fi
EOF

chmod +x connect_db.sh`;

  const ebsKmsKey = await aws.kms.getKey({ keyId: 'alias/aws/ebs' });

  const userDataBase64 = userData.apply(ud => {
    return Buffer.from(ud).toString('base64');
  });

  const jumpbox = new aws.ec2.Instance(
    `jumpbox-write-${clusterId}`,
    {
      instanceType: size,
      subnetId: vpc.privateSubnetIds[0],
      vpcSecurityGroupIds: [securityGroup.id],
      ami: 'ami-0f9fc25dd2506cf6d',
      userData: userDataBase64,
      iamInstanceProfile,
      associatePublicIpAddress: false,
      tags: {
        name: jumpHostname,
      },
      rootBlockDevice: {
        deleteOnTermination: true,
        encrypted: true,
        volumeSize: 100,
        kmsKeyId: ebsKmsKey.arn,
      },
    },
    { provider },
  );

  return jumpbox;
}

/**
 *  Create Read-only DB Jump box
 */
async function createReadOnlyDbJumpBox(
  clusterId: string,
  dbReadOnlyUrlSecretName: string,
  securityGroup: awsx.ec2.SecurityGroup,
  vpc: FootprintVpc,
  provider: aws.Provider,
  stack: StackMetadata,
): Promise<aws.ec2.Instance> {
  const size = 't2.micro';

  // generate a tailscale key accessing the jumpbox
  let tag = '';
  if (stack.environment === StackEnvironment.DevEphemeral) {
    tag = `tag:jumpbox-dev`;
  } else {
    tag = `tag:jumpbox-${stack.shortStackName}`;
  }

  const tailscaleAuthKey = new tailscale.TailnetKey(
    `jump-tskey-ro-${stack.shortStackName}`,
    {
      ephemeral: true,
      preauthorized: true,
      reusable: true,
      tags: [tag],
    },
  );

  // store the TS-key in SSM
  const tsKeySecretName = `/db/ts-ro-key-${clusterId}`;
  new aws.ssm.Parameter(`ssm-param-ts-key-ro-jumpbox-${clusterId}`, {
    type: 'SecureString',
    value: tailscaleAuthKey.key,
    name: tsKeySecretName,
  });

  const instanceRole = new aws.iam.Role(`jump-role-ro-${clusterId}`, {
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
        name: 'jumpbox_policies_ro',
        policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Action: ['ssm:GetParameter'],
              Effect: 'Allow',
              Resource: `arn:aws:ssm:*:*:parameter${dbReadOnlyUrlSecretName}`,
            },
            {
              Action: ['ssm:GetParameter'],
              Effect: 'Allow',
              Resource: `arn:aws:ssm:*:*:parameter${tsKeySecretName}`,
            },
          ],
        }),
      },
      {
        name: 'cloudwatch_logging',
        policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Action: [
                'logs:CreateLogGroup',
                'logs:PutLogEvents',
                'logs:DescribeLogStreams',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
              ],
              Effect: 'Allow',
              Resource: '*',
            },
          ],
        }),
      },
    ],
  });

  const iamInstanceProfile = new aws.iam.InstanceProfile(
    `jump_ro_profile-${clusterId}`,
    {
      role: instanceRole.name,
    },
  );

  let jumpHostname = `jumpbox-read-${stack.shortStackName}`;

  const userData = pulumi.interpolate`
#!/bin/bash

sudo yum update -y
sudo yum install amazon-linux-extras -y
sudo amazon-linux-extras enable postgresql14 -y
sudo yum install postgresql jq yum-utils -y

### AWS LOGS ###

# install log agent on ec2 instance
sudo yum install -y awslogs
sudo mkdir -p /var/lib/awslogs/state/

# Define our log conf files
# see https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AgentReference.html
cat <<'EOF' > /etc/awslogs/awslogs.conf
[general]
state_file=/var/lib/awslogs/state/agent-state

[/var/log/awslogs]
log_group_name=/ec2/${jumpHostname}-logs
log_stream_name={instance_id}
time_zone=UTC
file=/var/log/awslogs*
initial_position=start_of_file

[/var/log/boot]
log_group_name=/ec2/${jumpHostname}-boot
log_stream_name={instance_id}
time_zone=UTC
file=/var/log/boot*
initial_position=start_of_file

[/var/log/cloud-init]
log_group_name=/ec2/${jumpHostname}-cloud-init
log_stream_name={instance_id}
time_zone=UTC
file=/var/log/cloud-init*.log
initial_position=start_of_file
EOF

# start logging daemon
sudo systemctl start awslogsd

### END AWS LOGS ###

### BEGIN SETUP TAILSCALE ###
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p /etc/sysctl.conf

sudo yum-config-manager --add-repo https://pkgs.tailscale.com/stable/centos/7/tailscale.repo
sudo yum install tailscale nc -y
sudo systemctl enable --now tailscaled

cat <<'EOF' > tailscale_connect.sh
#!/bin/sh
export TS_KEY="$(aws --region us-east-1 ssm get-parameter --name '${tsKeySecretName}' --with-decryption | jq -r '.Parameter.Value')"
sudo tailscale up --authkey "$TS_KEY" --ssh --hostname "${jumpHostname}"
EOF

chmod +x tailscale_connect.sh

cat <<'EOF' > tailscale_connect.service
[Unit]
Description=tailscale_connect

[Service]
User=root
WorkingDirectory=/
ExecStart="/tailscale_connect.sh"
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo cp tailscale_connect.service /etc/systemd/system/tailscale_connect.service
sudo systemctl start tailscale_connect.service && sudo systemctl enable tailscale_connect.service

### END SETUP TAILSCALE ###

### BEGIN setup db access helper ###
# setup db connect script
cat <<'EOF' > connect_db.sh
#!/bin/sh
psql $(aws --region us-east-1 ssm get-parameter --name "${dbReadOnlyUrlSecretName}" --with-decryption | jq -r ".Parameter.Value")
EOF

chmod +x connect_db.sh`;

  const ebsKmsKey = await aws.kms.getKey({ keyId: 'alias/aws/ebs' });

  const userDataBase64 = userData.apply(ud => {
    return Buffer.from(ud).toString('base64');
  });

  const jumpbox = new aws.ec2.Instance(
    `jumpbox-readonly-${clusterId}`,
    {
      instanceType: size,
      subnetId: vpc.publicSubnetIds[0],
      vpcSecurityGroupIds: [securityGroup.id],
      ami: 'ami-0f9fc25dd2506cf6d',
      userData: userDataBase64,
      iamInstanceProfile,
      associatePublicIpAddress: true,
      tags: {
        Name: jumpHostname,
      },
      rootBlockDevice: {
        deleteOnTermination: true,
        encrypted: true,
        volumeSize: 100,
        kmsKeyId: ebsKmsKey.arn,
      },
    },
    { provider },
  );

  return jumpbox;
}
