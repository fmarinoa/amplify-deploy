import { appendFile, readFile } from 'node:fs/promises';
import { AmplifyClient, CreateDeploymentCommand, StartDeploymentCommand } from '@aws-sdk/client-amplify';

const input = (name) => process.env[`INPUT_${name.toUpperCase()}`]?.trim();

async function run() {
  const appId = input('app-id');
  const branchName = input('branch') || 'main';
  const zipPath = input('zip-path');
  if (!appId || !zipPath) throw new Error('Inputs app-id and zip-path are required');

  const client = new AmplifyClient({});
  console.log(`Starting deployment for App: '${appId}' on Branch: '${branchName}'`);

  const { zipUploadUrl, jobId } = await client.send(new CreateDeploymentCommand({ appId, branchName }));
  if (!zipUploadUrl || !jobId) throw new Error('CreateDeployment did not return zipUploadUrl/jobId');

  console.log('Uploading artifact...');
  const res = await fetch(zipUploadUrl, {
    method: 'PUT',
    body: await readFile(zipPath),
    headers: { 'Content-Type': 'application/zip' },
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status} ${await res.text()}`);

  console.log(`Activating Job ID: ${jobId}`);
  await client.send(new StartDeploymentCommand({ appId, branchName, jobId }));

  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `job-id=${jobId}\n`);
  console.log(`Deployment started successfully for Job ID: ${jobId}`);
}

run().catch((err) => {
  console.log(`::error::${err.message}`);
  process.exitCode = 1;
});
