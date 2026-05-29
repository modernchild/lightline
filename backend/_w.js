const fs=require("fs");const path=require("path");
const root=path.join(__dirname);
function w(rel,c){const p=path.join(root,rel);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,c);console.log("w",rel);}
