import { ec2, Region, route53,  } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Output } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi"

export async function createWildcardCertificate(hostname: string, region: Region): Promise<pulumi.Output<string>> {
    const provider = new aws.Provider(`provider-cert=${region}`, { region });
    const hostedZone = await aws.route53.getZone({ name: hostname });

    const cert = new aws.acm.Certificate(`cert-${region}`, {
        domainName: `*.${hostname}`,        
        validationMethod: "DNS",
    }, { provider });

    const records = cert.domainValidationOptions.apply(async ops => {
        return ops.map(vop => {
            return {
                name: vop.resourceRecordName,
                record: vop.resourceRecordValue,
                type: vop.resourceRecordType,
            }
        }).map((record, index) => {
            return new aws.route53.Record(`cert-validation-record-${region.toString()}-${index}`, {
                allowOverwrite: true,
                name: record.name,
                records: [record.record],
                ttl: 60,
                type: record.type,
                zoneId: hostedZone.zoneId,
            }, { provider })
        })
    });

    const certValidation = new aws.acm.CertificateValidation(`cert-validation-result-${region.toString()}`, {
        certificateArn: cert.arn,
        validationRecordFqdns: records.apply(async recs => { return recs.map(record => record.fqdn) }),
    }, { provider });

    return certValidation.certificateArn;
}