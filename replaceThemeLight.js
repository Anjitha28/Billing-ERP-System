const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  const ext = path.extname(filePath);
  if (ext !== '.tsx' && ext !== '.ts' && ext !== '.jsx' && ext !== '.js') return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  const replacements = [
    { from: /text-gray-200/g, to: 'text-theme-text' },
    { from: /text-gray-300/g, to: 'text-theme-text-muted' },
    { from: /text-gray-400/g, to: 'text-theme-text-muted' },
    { from: /bg-gray-900\/50/g, to: 'bg-theme-surface-hover\/50' },
    { from: /bg-gray-800\/50/g, to: 'bg-theme-surface-hover\/50' },
    { from: /border-gray-800/g, to: 'border-theme-border' },
    { from: /border-gray-700/g, to: 'border-theme-border' },
    { from: /bg-gray-800/g, to: 'bg-theme-surface-hover' },
    { from: /bg-gray-900/g, to: 'bg-theme-bg' }, // bg-gray-900 often used for main bg
    { from: /bg-yellow-500\/10/g, to: 'bg-yellow-100 text-yellow-800' }, // adapting alerts
    { from: /bg-blue-500\/10/g, to: 'bg-blue-100 text-blue-800' },
    { from: /bg-green-500\/10/g, to: 'bg-emerald-100 text-emerald-800' },
    { from: /bg-purple-500\/10/g, to: 'bg-purple-100 text-purple-800' },
    { from: /text-blue-400/g, to: 'text-blue-700' },
    { from: /text-green-400/g, to: 'text-emerald-700' },
    { from: /text-purple-400/g, to: 'text-purple-700' },
    { from: /text-yellow-400/g, to: 'text-yellow-700' },
    { from: /text-red-400/g, to: 'text-red-600' }
  ];

  for (const rep of replacements) {
    content = content.replace(rep.from, rep.to);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else {
      replaceInFile(fullPath);
    }
  }
}

processDir('./app');
