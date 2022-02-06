import { ec2, Region, route53, } from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import { Output } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi"

export type CertConfig = {
    hostedZoneId: string,
    domain: string,
    region: Region
}

export async function CreateCertificate(config: CertConfig): Promise<pulumi.Output<string>> {
    const nameSuffix = `${config.domain}-cert-${config.region}`;
    const provider = new aws.Provider(`provider-${nameSuffix}`, { region: config.region });

    const cert = new aws.acm.Certificate(`cert-${nameSuffix}`, {
        domainName: config.domain,
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
            return new aws.route53.Record(`cert-validation-record-${nameSuffix}-${index}`, {
                allowOverwrite: true,
                name: record.name,
                records: [record.record],
                ttl: 60,
                type: record.type,
                zoneId: config.hostedZoneId,
            }, { provider })
        })
    });

    const certValidation = new aws.acm.CertificateValidation(`cert-validation-result-${nameSuffix}`, {
        certificateArn: cert.arn,
        validationRecordFqdns: records.apply(async recs => { return recs.map(record => record.fqdn) }),
    }, { provider });

    return certValidation.certificateArn;
}