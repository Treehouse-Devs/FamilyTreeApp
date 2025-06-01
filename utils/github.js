import { Octokit } from '@octokit/rest';

const token = process.env['GITHUB_TOKEN'];
if (!token) throw new Error('GITHUB_TOKEN is not set');
const octokit = new Octokit({ auth: token });

export async function getChangedFiles() {
  const { owner, repo } = getRepoInfo();
  const prNumber = getPrNumber();
  const response = await octokit.pulls.listFiles({ owner, repo, pull_number: prNumber });
  return response.data.map(f => ({
    filename: f.filename,
    patch: f.patch || ''
  }));
}

export async function postReviewComment(body) {
  const { owner, repo } = getRepoInfo();
  const prNumber = getPrNumber();
  await octokit.issues.createComment({ owner, repo, issue_number: prNumber, body });
}

function getRepoInfo() {
  const repoPath = process.env['GITHUB_REPOSITORY'];
  if (!repoPath) throw new Error('GITHUB_REPOSITORY not set');
  const [owner, repo] = repoPath.split('/');
  return { owner, repo };
}

function getPrNumber() {
  const ref = process.env['GITHUB_REF'];
  const match = ref?.match(/refs\/pull\/(\d+)\//);
  if (!match) throw new Error('Could not determine PR number from GITHUB_REF');
  return parseInt(match[1], 10);
}