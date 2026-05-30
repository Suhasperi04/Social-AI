const fs = require('fs');
const path = require('path');

function walkDir(currentPath) {
  const files = fs.readdirSync(currentPath);
  for (const file of files) {
    const fullPath = path.join(currentPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('.next')) {
        walkDir(fullPath);
      }
    } else {
      if (['.tsx', '.ts', '.md', '.css', '.local', '.example'].some(ext => fullPath.endsWith(ext))) {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('GrowMyInsta')) {
          content = content.replace(/GrowMyInsta/g, 'GrowMyAccount');
          content = content.replace(/growmyinsta/g, 'growmyaccount');
          fs.writeFileSync(fullPath, content);
          console.log(`Updated ${fullPath}`);
        }
      }
    }
  }
}

walkDir(__dirname);
