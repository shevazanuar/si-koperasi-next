const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src/app/dashboard', function(filePath) {
  if (filePath.endsWith('page.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    let parts = content.split('<Plus');
    if (parts.length > 1) {
      for (let i = 0; i < parts.length - 1; i++) {
        let before = parts[i];
        let lastClassIdx = before.lastIndexOf('className="');
        if (lastClassIdx !== -1) {
          let classStr = before.substring(lastClassIdx);
          
          let newClassStr = classStr
            .replace(/bg-blue-600([^"']*)hover:bg-blue-700/g, 'bg-gradient-to-r from-[#cd8957] to-[#a05a26] $1hover:from-[#b07044] hover:to-[#8c4819]')
            .replace(/bg-amber-600([^"']*)hover:bg-amber-700/g, 'bg-gradient-to-r from-[#cd8957] to-[#a05a26] $1hover:from-[#b07044] hover:to-[#8c4819]')
            .replace(/shadow-blue-500\/20/g, 'shadow-orange-500/20')
            .replace(/shadow-amber-500\/20/g, 'shadow-orange-500/20');
            
          // If it just has btn-primary
          newClassStr = newClassStr.replace(/btn-primary/g, 'bg-gradient-to-r from-[#cd8957] to-[#a05a26] hover:from-[#b07044] hover:to-[#8c4819] text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-md shadow-orange-500/20');

          parts[i] = before.substring(0, lastClassIdx) + newClassStr;
        }
      }
      content = parts.join('<Plus');
    }

    if(content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Updated', filePath);
    }
  }
});
