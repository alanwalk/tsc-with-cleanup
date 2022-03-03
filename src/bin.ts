#!/usr/bin/env node
import * as path from "path";
import * as commander from "commander";
import * as tscWithCleanup from "./index";

const pkg = require("../package.json");

commander
    .name(pkg.name)
    .description(pkg.description)
    .usage("tsc-with-cleanup -s src -d dist -w -rd -v")
    .version(pkg.version, "-V, --version", "output the current version")
    .option("-b, --buildModule <buildModuleDir>", "assign launch module", "null")
    .option("-s, --src <srcDir>", "sets the source folder with ts files (default: src)")
    .option("-d, --dist <distDir>", "sets the distribution folder with js files (default: dist)", "dist")
    .option("-e, --exclude [relativePath...]", "files to exclude on remove")
    .option("-w, --watch", "whether to watch for files being deleted (default: false)", false)
    .option("-v, --verbose", "Whether to show messages (default: false)", false)
    .option(
        "-if, --ifDeclared",
        "If set to true, js files in dist will only be removed if a file with the same name and a .d.ts extension is also present (default: false)",
        false
    )
    .option("-rd, --removeDirs", "whether to remove empty directories (default: false)", false)
    .allowUnknownOption()
    .parse(process.argv);

function getTscOpt(): string[] {
    let tscOpts = process.argv.splice(2); // trim node tsc-with-cleanup
    let opts = commander.opts();
    let optFmts: commander.Option[] = commander.options;
    optFmts.forEach((optFmt) => {
        if (optFmt.short === "-w") return;
        let index = tscOpts.indexOf(optFmt.short as string);
        if (index < 0) index = tscOpts.indexOf(optFmt.long);
        if (index < 0) return;
        if (optFmt.short === "-b") {
            tscOpts[index + 1] = path.resolve(tscOpts[index + 1], "./tsconfig.json");
            return;
        }
        if (optFmt.short === "-e") {
            tscOpts.splice(index, opts.exclude.length + 1);
        } else {
            tscOpts.splice(index, optFmt.required ? 2 : 1);
        }
    });
    return tscOpts;
}

function main() {
    let opts = commander.opts();
    const src = path.resolve(process.cwd(), opts.src);
    const dist = path.resolve(process.cwd(), opts.dist);

    // exec tsc command
    tscWithCleanup.execTsc(getTscOpt());

    // Clean the directory
    if (opts.buildModule == "null") {
        tscWithCleanup.clean(src, dist, opts.exclude, opts.ifDeclared, opts.verbose);
    } else {
        const buildModule = path.resolve(process.cwd(), opts.buildModule);
        tscWithCleanup.monoRepoClean(buildModule, opts.src, opts.dist, opts.exclude, opts.ifDeclared, opts.verbose, []);
    }

    // Check whether we should continue checking for chnages
    if (opts.watch) tscWithCleanup.watch(src, dist, opts.exclude, opts.removeDirs, opts.verbose);
}

main();
