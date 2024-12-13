resource "aws_s3_bucket" "fp_vault_data_cloudtrail" {
  bucket = "testing-footprint-vault-data-cloudtrail"
}

resource "aws_s3_bucket_public_access_block" "fp_vault_data_cloudtrail_public_access_block" {
  bucket = aws_s3_bucket.fp_vault_data_cloudtrail.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

locals {
  fp_vault_data_cloudtrail_name = "footprint-vault-data-cloudtrail"
}

data "aws_iam_policy_document" "fp_vault_data_cloudtrail" {
  statement {
    sid    = "AWSCloudTrailAclCheck"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }

    actions   = ["s3:GetBucketAcl"]
    resources = [aws_s3_bucket.fp_vault_data_cloudtrail.arn]
    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values   = ["arn:${data.aws_partition.current.partition}:cloudtrail:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:trail/${local.fp_vault_data_cloudtrail_name}"]
    }
  }

  statement {
    sid    = "AWSCloudTrailWrite"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }

    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.fp_vault_data_cloudtrail.arn}/AWSLogs/${data.aws_caller_identity.current.account_id}/*"]

    condition {
      test     = "StringEquals"
      variable = "s3:x-amz-acl"
      values   = ["bucket-owner-full-control"]
    }
    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values   = ["arn:${data.aws_partition.current.partition}:cloudtrail:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:trail/${local.fp_vault_data_cloudtrail_name}"]
    }
  }
}

resource "aws_s3_bucket_policy" "fp_vault_data_cloudtrail" {
  bucket = aws_s3_bucket.fp_vault_data_cloudtrail.id
  policy = data.aws_iam_policy_document.fp_vault_data_cloudtrail.json
}

// nosemgrep: terraform.aws.security.aws-cloudtrail-encrypted-with-cmk.aws-cloudtrail-encrypted-with-cmk
resource "aws_cloudtrail" "fp_vault_data_cloudtrail" {
  name           = local.fp_vault_data_cloudtrail_name
  s3_bucket_name = aws_s3_bucket.fp_vault_data_cloudtrail.id

  include_global_service_events = false

  depends_on = [aws_s3_bucket_policy.fp_vault_data_cloudtrail]

  event_selector {
    read_write_type           = "All"
    include_management_events = true

    data_resource {
      type = "AWS::S3::Object"

      values = ["${aws_s3_bucket.fp_vault_data.arn}/"]
    }
  }
}
