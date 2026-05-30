const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/app/api');

function walkDir(currentPath) {
  const files = fs.readdirSync(currentPath);
  for (const file of files) {
    const fullPath = path.join(currentPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('@/lib/ai/gemini')) {
        content = content.replace(/@\/lib\/ai\/gemini/g, '@/lib/ai/engine');
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walkDir(dir);

const geminiPath = path.join(__dirname, 'src/lib/ai/gemini.ts');
if (fs.existsSync(geminiPath)) {
  fs.unlinkSync(geminiPath);
  console.log(`Deleted ${geminiPath}`);
}
