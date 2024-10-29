// The access key is created manually in the console
resource "aws_iam_user" "fp_vault_data_read_only" {
  name = "fp_vault_data_read_only"
}

resource "aws_iam_role" "fp_vault_data_read_only" {
  name = "fp-vault-data-read-only"

  assume_role_policy = data.aws_iam_policy_document.fp_vault_data_read_only_assume_role_policy.json
}

data "aws_iam_policy_document" "fp_vault_data_read_only_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "AWS"
      identifiers = [aws_iam_user.fp_vault_data_read_only.arn]
    }
  }
}

data "aws_iam_policy_document" "fp_vault_data_read_only_policy" {
  statement {
    sid = "AllowReadOnly"

    actions = [
      "s3:List*",
      "s3:Get*",
    ]

    resources = [
      aws_s3_bucket.fp_vault_data.arn,
      "${aws_s3_bucket.fp_vault_data.arn}/*",
    ]
  }
}

resource "aws_iam_policy" "fp_vault_data_read_only_policy" {
  name        = "fp-vault-data-read-only"
  policy      = data.aws_iam_policy_document.fp_vault_data_read_only_policy.json
}

resource "aws_iam_role_policy_attachment" "fp_vault_data_read_only" {
  role       = aws_iam_role.fp_vault_data_read_only.name
  policy_arn = aws_iam_policy.fp_vault_data_read_only_policy.arn
}
