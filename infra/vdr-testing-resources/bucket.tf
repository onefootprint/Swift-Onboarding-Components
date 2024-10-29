resource "aws_s3_bucket" "fp_vault_data" {
  bucket = "testing-footprint-vault-data"
}

resource "aws_s3_bucket_public_access_block" "fp_vault_data_pab" {
  bucket = aws_s3_bucket.fp_vault_data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_iam_role" "fp_vault_data_delegate_access" {
  name = "fp-vault-data-management"

  assume_role_policy = data.aws_iam_policy_document.fp_vault_data_management_assume_role_policy.json
}

data "aws_iam_policy_document" "fp_vault_data_management_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "AWS"
      identifiers = ["725896863556", "800859428444"]
    }

    condition {
      test     = "StringEquals"
      variable = "sts:ExternalId"
      values = [
        "a651d1528b28b48af1c35b44acbecc7f", // Prod _private_it_org_2 Sandbox
        "34b65b2181a4a3bb57e740cec972794a", // Dev _private_it_org_2 Sandbox
      ]
    }
  }
}

data "aws_iam_policy_document" "fp_vault_data_management_policy" {
  statement {
    sid = "AllowPutObject"

    actions = [
      "s3:PutObject",
    ]

    resources = [
      "${aws_s3_bucket.fp_vault_data.arn}/*",
    ]
  }

  statement {
    sid = "AllowListBucket"

    actions = [
      "s3:ListBucket",
    ]

    resources = [
      aws_s3_bucket.fp_vault_data.arn,
    ]
  }

  statement {
    sid = "AllowGetBucketLocation"

    actions = [
      "s3:GetBucketLocation",
    ]

    resources = [
      aws_s3_bucket.fp_vault_data.arn,
    ]
  }
}

resource "aws_iam_policy" "fp_vault_data_management" {
  name   = "fp-vault-data-management"
  policy = data.aws_iam_policy_document.fp_vault_data_management_policy.json
}

resource "aws_iam_role_policy_attachment" "fp_vault_data_management_assume_role" {
  role       = aws_iam_role.fp_vault_data_delegate_access.name
  policy_arn = aws_iam_policy.fp_vault_data_management.arn
}
