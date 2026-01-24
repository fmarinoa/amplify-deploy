# AWS Amplify Deploy Action

[Español](README.es.md) | English

Composite GitHub Action to deploy static artifacts (.zip) directly to AWS Amplify using AWS CLI, without the need to manage an intermediate S3 bucket.

## Prerequisites

This action requires AWS credentials to be configured in the environment before execution. It is recommended to use `aws-actions/configure-aws-credentials`.

## Usage

```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v4

  # 1. Configure AWS Credentials
  - name: Configure AWS Credentials
    uses: aws-actions/configure-aws-credentials@v4
    with:
      aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
      aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      aws-region: us-east-2

  # 2. Create the artifact (Important: enter the directory before zipping)
  - name: Create Artifact
    run: cd public && zip -r ../dist.zip .

  # 3. Deploy
  - name: Deploy to Amplify
    uses: fmarinoa/amplify-deploy@v1
    with:
      app-id: ${{ secrets.AMPLIFY_APP_ID }}
      branch: 'main'
      zip-path: './dist.zip'
```

## Inputs

| Input    |                        Description                    | Required | Default |
| -------- | :---------------------------------------------------: | :------: | :-----: |
| app-id   | The Amplify App ID (visible in the AWS console).      |   Yes    |    -    |
| zip-path | Relative or absolute path to the .zip file to deploy. |   Yes    |    -    |
| branch   | Name of the Amplify branch where it will be deployed. |    No    |  main   |

## Minimum IAM Policy

The IAM user used requires the following permissions. If you use Permissions Boundaries, make sure the boundary allows these actions and resources.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "amplify:CreateDeployment",
        "amplify:StartDeployment",
        "amplify:GetApp",
        "amplify:GetBranch"
      ],
      "Resource": ["arn:aws:amplify:REGION:ACCOUNT_ID:apps/APP_ID/*"]
    }
  ]
}
```

## ZIP Notes

To avoid the application being served in a subdirectory (e.g., /public/index.html), make sure to compress the contents of the build directory, not the directory itself.

Incorrect: `zip -r deploy.zip ./public/`

Correct: `cd public && zip -r ../deploy.zip .`

## Author

[fmarinoa](https://github.com/fmarinoa)
