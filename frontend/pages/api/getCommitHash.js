const { execSync } = require('child_process');

export default function handler(req, res) {
  const headCommitHash = execSync('git rev-parse HEAD').toString().trim();
  res.status(200).json({ lastCommitHash: headCommitHash });
}
