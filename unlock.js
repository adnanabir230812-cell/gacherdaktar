const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const configPath = path.join(__dirname, 'frontend', 'src', 'config', 'maintenance.json');
const repoDir = __dirname;

try {
  // 1. Update config
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  config.enabled = false;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  console.log('✅ Maintenance mode disabled locally in maintenance.json');

  // 2. Commit and Push
  console.log('🔄 Staging, committing and pushing changes to GitHub...');
  execSync('git add frontend/src/config/maintenance.json', { cwd: repoDir, stdio: 'inherit' });
  try {
    execSync('git commit -m "chore: disable maintenance mode"', { cwd: repoDir, stdio: 'inherit' });
  } catch (e) {
    console.log('⚠️ Git commit failed or nothing to commit. Continuing to push...');
  }
  execSync('git push origin main', { cwd: repoDir, stdio: 'inherit' });
  
  console.log('\n🚀 Success! Maintenance mode has been disabled and the live site is restored!');
} catch (error) {
  console.error('❌ An error occurred:', error.message);
}
