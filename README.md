# tsc-with-cleanup
A simple script that that can be used to cleanup previously transpiled typescript files.

## Install
```
npm install tsc-with-cleanup --save-dev
```

## Usage
```
tsc-with-cleanup -s src -d dist -w -rd -v
```

## Options
```
-s, --src <srcDir>              sets the source folder with ts files (default: src)
-d, --dist <distDir>            sets the distribution folder with js files (default: dist)
-e, --exclude [relativePath...] files to exclude on remove
-w, --watch                     whether to watch for files being deleted (default: false)
-v, --verbose                   Whether to show messages (default: false)
-if, --ifDeclared               If set to true, js files in dist will only be removed if a file with the same name and a .d.ts extension is also present (default: false)
-rd, --removeDirs               whether to remove empty directories (default: false)
...
Any tsc options
```

## Reference
- [ts-cleanup](https://www.npmjs.com/package/ts-cleanup)
- [ts-cleaner](https://www.npmjs.com/package/ts-cleaner)
- [tsc-watch](https://www.npmjs.com/package/tsc-watch)