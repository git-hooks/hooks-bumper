#! /usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    child_process = require('child_process');

var root = process.cwd();
while (!fs.existsSync(path.join(root, 'package.json'))) {
    root = path.dirname(root);
}

bump();

// version bumpping
function bump() {
    var packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    var version = packageJson.version;
    var newVersion = version.split('.').map(function(v, i) {
        return i === 2 ? ++v : v;
    }).join('.');
    var patch = [
        "diff --git a/package.json b/package.json" ,
        "--- a/package.json" ,
        "+++ b/package.json" ,
        "@@ -3 +3 @@" ,
        "-  \"version\": \"%s\"," ,
        "+  \"version\": \"%s\","
    ].join('\n');
    patch = util.format(patch, version, newVersion);
    // apply patch
    var git = child_process.spawn('git', ['apply', '--index', '--unidiff-zero']);
    git.stdin.write(patch);
    git.stdin.end('\n');
    git.stderr.on('data', function(err) {
        console.log(err.toString());
    });
}
