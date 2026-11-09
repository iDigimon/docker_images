const { execFileSync } = require('node:child_process');
const { appendFileSync } = require('node:fs');

const {
  INPUT_REPOSITORY: repository,
  INPUT_CANDIDATE: candidate,
  INPUT_TAG: tag,
  INPUT_DIGEST: digest,
  INPUT_ROLLBACK: rollback,
  GITHUB_STEP_SUMMARY: summaryFile,
} = process.env;
const digestPattern = /^sha256:[0-9a-f]{64}$/;

function imagetools(...args) {
  return execFileSync('docker', ['buildx', 'imagetools', ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  }).trim();
}

function inspectDigest(reference) {
  const resolved = imagetools('inspect', '--format', '{{.Manifest.Digest}}', reference);
  if (!digestPattern.test(resolved)) {
    throw new Error(`No valid manifest digest for ${reference}`);
  }
  return resolved;
}

function publishTag(reference, expectedDigest) {
  imagetools('create', '--prefer-index=false', '--tag', reference, `${repository}@${expectedDigest}`);
  if (inspectDigest(reference) !== expectedDigest) {
    throw new Error(`Manifest digest mismatch for ${reference}`);
  }
}

try {
  if (!repository || !candidate || !tag || !digestPattern.test(digest)) {
    throw new Error('Repository, candidate, release tag and a valid build digest are required');
  }
  if (inspectDigest(candidate) !== digest) {
    throw new Error('The candidate digest does not match the tested build');
  }

  const release = `${repository}:${tag}`;
  const summary = [
    `- Published \`${release}\``,
    `- Build tag \`${candidate}\``,
    `- Manifest digest \`${digest}\``,
  ];
  if (rollback === 'true') {
    const previous = inspectDigest(release);
    const backup = `${release}-rollback-${previous.slice('sha256:'.length)}`;
    publishTag(backup, previous);
    summary.push(`- Rollback tag \`${backup}\` at \`${previous}\``);
  }

  publishTag(release, digest);
  appendFileSync(summaryFile, `${summary.join('\n')}\n`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
