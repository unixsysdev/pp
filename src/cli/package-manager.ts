#!/usr/bin/env node

import { PackageRegistry, BuildSystem, BuildConfig } from '../package/manager';

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    const registry = new PackageRegistry();
    
    switch (command) {
        case 'install':
            const packageName = args[1];
            const version = args[2] || '*';
            const result = await registry.install(packageName, version);
            console.log(result.isOk ? result.value.toString() : `Error: ${result.value.toString()}`);
            break;
            
        case 'publish':
            const publishResult = await registry.publish('.');
            console.log(publishResult.isOk ? publishResult.value.toString() : `Error: ${publishResult.value.toString()}`);
            break;
            
        case 'build':
            const buildSystem = BuildConfig.createDefaultConfig();
            const buildResult = await buildSystem.run(args[1] || 'compile');
            console.log(buildResult.isOk ? buildResult.value.toString() : `Error: ${buildResult.value.toString()}`);
            break;
            
        default:
            console.log('Usage: elpm <install|publish|build> [args...]');
            break;
    }
}

if (require.main === module) {
    main().catch(console.error);
}
