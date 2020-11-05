import * as path from 'path';
import * as fs from 'fs';
import * as chokidar from 'chokidar';
import * as colors from 'colors';

export interface IWatchOptions {
    root?: string;
    removeEmptyDirs?: boolean;
    verbose?: boolean;
}

const EXTENSIONS = ['.js', '.js.map', '.d.ts'];
const MATCH_TS_PATTERN = /^(.*)\.ts$/;

export function cleanup(dist: string) {
    fs.rmdirSync(dist, { recursive: true });
}

export function watch(src: string, dist: string, options: IWatchOptions = {}) {
    chokidar
        .watch(src, {
            persistent: true,
            cwd: src,
        })
        .on('unlink', filename => {
            // Check if it was a typescript file
            const match = filename.match(MATCH_TS_PATTERN);
            if (match) {
                const base = path.resolve(dist, match[1]);
                for (const ext of EXTENSIONS) {
                    const f = base + ext;
                    if (fs.existsSync(f)) {
                        fs.unlinkSync(f);
                        if (options.verbose)
                            console.log(`Removed "${colors.yellow(f)}"`);
                    }
                }
            }
        })
        .on('unlinkDir', dir => {
            if (options.removeEmptyDirs) {
                let fullDir = path.join(dist, dir);
                fs.rmdirSync(fullDir, { recursive: true });
                if (options.verbose)
                    console.log(`Removed "${colors.yellow(fullDir)}"`);
            }
        });
    if (options.verbose)
        console.log(`Watching in "${colors.yellow(src)}"`);
}