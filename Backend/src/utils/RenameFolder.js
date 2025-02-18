
import fs from "fs";
import path from "path";

function copyFolderContents(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((file) => {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file);

        if (fs.statSync(srcFile).isDirectory()) {
            copyFolderContents(srcFile, destFile);
        } else {
            fs.copyFileSync(srcFile, destFile);
        }
    });
}

function renameFolder(oldPath, newPath) {
    if (fs.existsSync(oldPath)) {
        console.log(`✅ Copying contents from: ${oldPath} → ${newPath}`);
        copyFolderContents(oldPath, newPath);
        fs.rmSync(oldPath, { recursive: true, force: true });
        console.log(`✅ Deleted old folder: ${oldPath}`);
    } else {
        console.log(`❌ Old folder does not exist: ${oldPath}`);
    }
}


export {renameFolder,copyFolderContents};