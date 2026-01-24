echo "Starting deployment for App: '$INPUT_APP_ID' on Branch: '$INPUT_BRANCH'"

DEPLOYMENT=$(aws amplify create-deployment \
    --app-id "$INPUT_APP_ID" \
    --branch-name "$INPUT_BRANCH" \
    --query '{zipUploadUrl:zipUploadUrl,jobId:jobId}' \
    --output json)

UPLOAD_URL=$(echo "$DEPLOYMENT" | jq -r '.zipUploadUrl')
JOB_ID=$(echo "$DEPLOYMENT" | jq -r '.jobId')

if [ -z "$UPLOAD_URL" ] || [ "$UPLOAD_URL" = "null" ]; then
    echo "Error: Failed to extract a valid zipUploadUrl from deployment response." >&2
    echo "Deployment response was: $DEPLOYMENT" >&2
    exit 1
fi

if [ -z "$JOB_ID" ] || [ "$JOB_ID" = "null" ]; then
    echo "Error: Failed to extract a valid jobId from deployment response." >&2
    echo "Deployment response was: $DEPLOYMENT" >&2
    exit 1
fi

echo "Uploading artifact..."
curl -X PUT "$UPLOAD_URL" \
    --data-binary @"$INPUT_ZIP_PATH" \
    -H "Content-Type: application/zip" \
    --silent \
    --show-error

echo "Activating Job ID: $JOB_ID"
aws amplify start-deployment \
    --app-id "$INPUT_APP_ID" \
    --branch-name "$INPUT_BRANCH" \
    --job-id "$JOB_ID"

echo "Deployment started successfully for Job ID: $JOB_ID"
