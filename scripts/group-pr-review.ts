import { getChangedFiles, postReviewComment } from 'utils/github';
import { reviewBatch } from 'utils/openai';
import { buildPrompts } from '../utils/prompt-builder';
import * as core from '@actions/core';

async function run() {
  try {
    const prNumber = process.env['GITHUB_REF_NAME'] || process.env['GITHUB_HEAD_REF'];
    if (!prNumber) throw new Error('PR number not fWound');

    const files = await getChangedFiles();
    if (files.length === 0) {
      core.info('No changed files to review.');
      return;
    }

    const batches = buildPrompts(files);

    let aggregatedReview = '## 🤖 AI Review Summary\n';
    for (const { filenames, prompt } of batches) {
      const response = await reviewBatch(prompt);
      aggregatedReview += `### Files: ${filenames.join(', ')}\n`;
      aggregatedReview += response.trim() + '\n\n';
    }

    await postReviewComment(aggregatedReview);
    core.info('AI review posted.');
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();