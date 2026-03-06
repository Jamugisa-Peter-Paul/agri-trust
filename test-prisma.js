const { execSync } = require('child_process');
const fs = require('fs');

try {
  execSync('npx prisma validate', { stdio: 'pipe' });
  fs.writeFileSync('error.txt', 'success');
} catch (e) {
  fs.writeFileSync('error.txt', e.stderr.toString());
}
