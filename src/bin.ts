#!/usr/bin/env node

import * as path from "path";
import * as program from "commander";
import * as colors from "colors";
import * as readline from "readline";
import { cleanup, watch } from "./index";
import { spawn } from "cross-spawn";

const pkg = require("../package.json");
const tsconfig = require("../tsconfig.json");

const tsccOpts = [
    { length : 2, short : "-s", long : "--src"          },
    { length : 2, short : "-d", long : "--dist"         },
    { length : 1, short : "-w", long : "--watch"        },
    { length : 1, short : "-r", long : "--remove-dirs"  }
]

program
    .name(pkg.name)
    .description(pkg.description)
    .version(pkg.version, "-v, --version", "output the current version")
    .option("-s, --src <srcDir>", "sets the source folder with ts files (auto load from tsconfig.json)")
    .option("-d, --dist <distDir>", "sets the distribution folder with js files (auto load from tsconfig.json)")
    .option("-w, --watch", "whether to watch for files being deleted (disabled by default)", false)
    .option("-r, --remove-dirs", "whether to remove empty directories (enabled by default)", true)
    .allowUnknownOption()
    .parse(process.argv);

function getTscOpts(args : string[]) : string[] {
    let options = args.splice(2) // trim node tscc
    tsccOpts.forEach(element => {
        let index = options.indexOf(element.short);
        if (index > -1) { options.splice(index, element.length); }
        index = options.indexOf(element.long);
        if (index > -1) { options.splice(index, element.length); }
    });
    return options
}

function spawnTsc() {
    try {
        let bin = require.resolve("typescript/bin/tsc");
        const tscProcess = spawn("node", [bin, ...getTscOpts(process.argv)]);
        const rl = readline.createInterface({ input: tscProcess.stdout });
        rl.on("line", function (input) { console.log(input); });
    } catch (e) {
        if (e.code === "MODULE_NOT_FOUND") {
            console.error(e.message);
            process.exit(9);
        }
        throw e;
    }
}

function watchFileChange(opts : { [key: string]: any }) {
    if (watch) {
        const root = process.cwd();
        const fullSrc = opts.src && path.resolve(root, opts.src);
        const fullDist = opts.dist && path.resolve(root, opts.dist);
        watch(fullSrc, fullDist, {
            removeEmptyDirs: opts.removeDirs,
        });
        return;
    }
}

function main() {
    let opts = program.opts();
    opts.src = opts.src ?? tsconfig.compilerOptions.rootDir ?? "src"
    opts.dist = opts.dist ?? tsconfig.compilerOptions.outDir ?? "dist"

    console.log("opts :" + opts)

    cleanup(opts.dist);
    spawnTsc();
    watchFileChange(opts);
}

main()
