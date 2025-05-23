import { Compiler } from '../src/compiler';
import { LLVMCodeGenerator, NativeCompiler } from '../src/codegen/llvm';
import * as fs from 'fs';

async function compileToNative(sourceFile: string, outputFile: string) {
    const source = fs.readFileSync(sourceFile, 'utf-8');
    const compiler = new Compiler();
    
    // Parse and type check
    const { statements } = compiler.parseAndCheck(source);
    
    // Generate LLVM IR
    const llvmGen = new LLVMCodeGenerator();
    const llvmIR = llvmGen.generate(statements);
    
    // Compile to native
    const nativeCompiler = new NativeCompiler();
    await nativeCompiler.compileAndLink(llvmIR, outputFile);
    
    console.log(`Compiled ${sourceFile} to ${outputFile}`);
}

// Usage: ts-node scripts/compile.ts input.el output
const [sourceFile, outputFile] = process.argv.slice(2);
if (sourceFile && outputFile) {
    compileToNative(sourceFile, outputFile).catch(console.error);
} else {
    console.log('Usage: compile.ts <source.el> <output>');
}
