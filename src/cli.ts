#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { Compiler } from './compiler';

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: enterprise-lang <file.el>');
        console.log('       enterprise-lang --repl');
        process.exit(1);
    }
    
    if (args[0] === '--repl') {
        console.log('Enterprise Lang REPL (not implemented yet)');
        return;
    }
    
    const filename = args[0];
    
    if (!fs.existsSync(filename)) {
        console.error(`Error: File '${filename}' not found`);
        process.exit(1);
    }
    
    const source = fs.readFileSync(filename, 'utf-8');
    const compiler = new Compiler();
    
    try {
        compiler.compile(source);
    } catch (error) {
        console.error('Compilation failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
