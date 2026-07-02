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

    // We only want to replace the className of elements that have <Plus inside them
    // It's a bit tricky to parse JSX with regex, so we can split by "<Plus"
    
    // Find the main "Tambah" button in header which usually has <Plus
    // Usually it's:
    // className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-md shadow-blue-500/20"
    // >
    //   <Plus className="w-5 h-5" />
    
    // Let's manually replace the bg-blue-600 with the gradient IF it's part of the header button (which has 'shadow-blue-500/20')
    // and wait, the shadow is an indicator of the primary button in page.jsx.
    
    let parts = content.split('<Plus');
    if (parts.length > 1) {
      // Find the last className before <Plus
      for (let i = 0; i < parts.length - 1; i++) {
        let before = parts[i];
        let lastClassIdx = before.lastIndexOf('className="');
        if (lastClassIdx !== -1) {
          let classStr = before.substring(lastClassIdx);
          let newClassStr = classStr
            .replace(/bg-blue-600/g, 'bg-gradient-to-r from-[#cd8957] to-[#a05a26]')
            .replace(/hover:bg-blue-700/g, 'hover:from-[#b07044] hover:to-[#8c4819]')
            .replace(/shadow-blue-500\/20/g, 'shadow-orange-500/20');
            
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
