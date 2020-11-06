import * as path from 'path';
import * as fs from 'fs';
import * as chokidar from 'chokidar';
import * as colors from 'colors';
import { spawn } from "cross-spawn";
import * as readline from "readline";

const srcTypePattern = /^(.*)\.ts$/;
const distTypePattern = /^(.*)\.d\.ts$/;
const distTypeJsPattern = /^(.*)\.js$/;

export function watch(src : string, dist : string, removeDirs : boolean, verbose : boolean) {
    chokidar
        .watch(src, {
            persistent: true,
            cwd: src,
        })
        .on("unlink", filename => {
            // Check if it was a typescript file
            const match = filename.match(srcTypePattern);
            if (match) {
                filename = path.resolve(dist, match[1]);

                if (fs.existsSync(filename + ".js")) fs.unlinkSync(filename + ".js");
                if (fs.existsSync(filename + ".js.map")) fs.unlinkSync(filename + ".js.map");
                if (fs.existsSync(filename + ".d.ts")) fs.unlinkSync(filename + ".d.ts");
                if (fs.existsSync(filename + ".d.ts.map")) fs.unlinkSync(filename + ".d.ts.map");

                if (verbose) console.log(`Removed "${match[1]}" from dist`);
            }
        })
        .on('unlinkDir', dir => {
            if (removeDirs) {
                let fullDir = path.join(dist, dir);
                fs.rmdirSync(fullDir, { recursive: true });
                if (verbose) console.log(`Removed "${colors.yellow(fullDir)}"`);
            }
        });;
    if (verbose) console.log(`Watching in "${src}"`);
};

export function clean(src : string, dist : string, ifTsDecl : boolean, verbose : boolean) {
    // Define a recursive method for scanning and cleaning a directory
    const readDir = (dirPath : string) => {
        // Get and read the files in the directory
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            const filename = path.join(dirPath, file);

            // Check if this file is a directory or not, and if it is; recurse
            if (fs.existsSync(filename) && fs.lstatSync(filename).isDirectory()) {
                readDir(filename);
            } else {
                // Otherwise, check if it is a ts dist file
                const match = filename.match(ifTsDecl ? distTypePattern : distTypeJsPattern);
                if (match) {
                    const extLess = match[1].substring(0, match[1].length);
                    const relPath = extLess.substring(dist.length);
                    const srcPath = path.join(src, relPath);

                    // Check if there is either a ts, d.ts or tsx file corresponding to this d.ts files
                    if (
                        !(
                            fs.existsSync(srcPath + ".d.ts") ||
                            fs.existsSync(srcPath + ".ts") ||
                            fs.existsSync(srcPath + ".tsx")
                        )
                    ) {
                        if (fs.existsSync(extLess + ".js"))
                            fs.unlinkSync(extLess + ".js");
                        if (fs.existsSync(extLess + ".js.map"))
                            fs.unlinkSync(extLess + ".js.map");
                        if (fs.existsSync(extLess + ".d.ts"))
                            fs.unlinkSync(extLess + ".d.ts");
                        if (fs.existsSync(extLess + ".d.ts.map"))
                            fs.unlinkSync(extLess + ".d.ts.map");

                        if (verbose) console.log(`Removed "${relPath}" from dist`);
                    }
                }
            }
        });
    };

    // Start cleaning the root directory
    readDir(dist);

    if (verbose) console.log(`Cleaned "${dist}"`);
};

export function execTsc(opts : string[]) {
    let tsc : string = "";
    try {
        tsc = require.resolve("typescript/bin/tsc")
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
    const tscProcess = spawn("node", [tsc, ...opts]);
    const rl = readline.createInterface({ input: tscProcess.stdout });
    rl.on("line", function (input) { console.log(input); });
}