const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /gray-250/g, to: 'gray-200' },
  { from: /gray-750/g, to: 'gray-700' },
  { from: /gray-650/g, to: 'gray-600' },
  { from: /gray-655/g, to: 'gray-600' },
  { from: /gray-755/g, to: 'gray-700' },
  { from: /gray-150/g, to: 'gray-100' },
  { from: /gray-350/g, to: 'gray-300' },
  { from: /gray-55\b/g, to: 'gray-50' }
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      /* Recurse into a subdirectory */
      results = results.concat(walk(file));
    } else { 
      /* Is a file */
      if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.html')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('C:/Users/Amshavarthana/Desktop/Web Titans/Web Titans/frontend/src');
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`Total files updated: ${changedFiles}`);
