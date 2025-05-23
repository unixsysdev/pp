// Phase 5: Package Manager and Build Tools
// src/package/manager.ts
// Phase 5: Package Manager and Build Tools

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Value, StringValue, NumberValue, BooleanValue, ResultValue, OptionValue } from '../interpreter/interpreter';

// ============================================================================
// PACKAGE MANIFEST
// ============================================================================

export interface PackageManifest {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  keywords?: string[];
  main?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  repository?: {
    type: string;
    url: string;
  };
  engines?: {
    enterpriseLang: string;
  };
}

export class PackageVersion {
  constructor(
    public major: number,
    public minor: number,
    public patch: number,
    public prerelease?: string
  ) {}

  toString(): string {
    const base = `${this.major}.${this.minor}.${this.patch}`;
    return this.prerelease ? `${base}-${this.prerelease}` : base;
  }

  static parse(version: string): PackageVersion {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
    if (!match) {
      throw new Error(`Invalid version format: ${version}`);
    }

    return new PackageVersion(
      parseInt(match[1]),
      parseInt(match[2]),
      parseInt(match[3]),
      match[4]
    );
  }

  satisfies(constraint: string): boolean {
    // Simple semantic versioning constraint checking
    if (constraint.startsWith('^')) {
      const targetVersion = PackageVersion.parse(constraint.slice(1));
      return this.major === targetVersion.major &&
             (this.minor > targetVersion.minor ||
              (this.minor === targetVersion.minor && this.patch >= targetVersion.patch));
    } else if (constraint.startsWith('~')) {
      const targetVersion = PackageVersion.parse(constraint.slice(1));
      return this.major === targetVersion.major &&
             this.minor === targetVersion.minor &&
             this.patch >= targetVersion.patch;
    } else {
      return this.toString() === constraint;
    }
  }
}

// ============================================================================
// PACKAGE REGISTRY
// ============================================================================

export class PackageRegistry {
  private packages = new Map<string, Map<string, PackageInfo>>();

  constructor(private registryUrl: string = 'https://registry.enterpriselang.dev') {}

  async publish(packagePath: string): Promise<ResultValue> {
    try {
      const manifest = await this.readManifest(packagePath);
      const packageTarball = await this.createTarball(packagePath);
      const checksum = this.calculateChecksum(packageTarball);

      const packageInfo: PackageInfo = {
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        author: manifest.author,
        license: manifest.license,
        keywords: manifest.keywords || [],
        dependencies: manifest.dependencies || {},
        devDependencies: manifest.devDependencies || {},
        tarball: packageTarball,
        checksum,
        publishedAt: new Date().toISOString()
      };

      // Store in local registry (in production, this would upload to remote registry)
      if (!this.packages.has(manifest.name)) {
        this.packages.set(manifest.name, new Map());
      }
      this.packages.get(manifest.name)!.set(manifest.version, packageInfo);

      return new ResultValue(true, new StringValue(`Published ${manifest.name}@${manifest.version}`));
    } catch (error) {
      return new ResultValue(false, new StringValue(`Failed to publish: ${error}`));
    }
  }

  async install(packageName: string, versionConstraint: string): Promise<ResultValue> {
    try {
      const packageVersions = this.packages.get(packageName);
      if (!packageVersions) {
        return new ResultValue(false, new StringValue(`Package ${packageName} not found`));
      }

      // Find compatible version
      let bestMatch: PackageInfo | null = null;
      for (const [version, packageInfo] of packageVersions) {
        const parsedVersion = PackageVersion.parse(version);
        if (parsedVersion.satisfies(versionConstraint)) {
          if (!bestMatch || PackageVersion.parse(version).toString() > PackageVersion.parse(bestMatch.version).toString()) {
            bestMatch = packageInfo;
          }
        }
      }

      if (!bestMatch) {
        return new ResultValue(false, new StringValue(`No compatible version found for ${packageName}@${versionConstraint}`));
      }

      // Install the package
      await this.installPackage(bestMatch);
      
      return new ResultValue(true, new StringValue(`Installed ${bestMatch.name}@${bestMatch.version}`));
    } catch (error) {
      return new ResultValue(false, new StringValue(`Failed to install: ${error}`));
    }
  }

  async search(query: string): Promise<PackageInfo[]> {
    const results: PackageInfo[] = [];
    
    for (const [packageName, versions] of this.packages) {
      if (packageName.includes(query)) {
        // Get latest version
        const latestVersion = Array.from(versions.keys())
          .sort((a, b) => PackageVersion.parse(b).toString().localeCompare(PackageVersion.parse(a).toString()))[0];
        
        const packageInfo = versions.get(latestVersion)!;
        if (packageInfo.keywords?.some(keyword => keyword.includes(query)) ||
            packageInfo.description?.includes(query)) {
          results.push(packageInfo);
        }
      }
    }
    
    return results;
  }

  private async readManifest(packagePath: string): Promise<PackageManifest> {
    const manifestPath = path.join(packagePath, 'package.json');
    const content = await fs.promises.readFile(manifestPath, 'utf-8');
    return JSON.parse(content);
  }

  private async createTarball(packagePath: string): Promise<Buffer> {
    // In a real implementation, this would create a proper tarball
    // For now, we'll simulate with a simple archive
    const files = await this.getAllFiles(packagePath);
    const archive = JSON.stringify(files);
    return Buffer.from(archive);
  }

  private async getAllFiles(dir: string): Promise<Record<string, string>> {
    const files: Record<string, string> = {};
    
    const walk = async (currentPath: string, relativePath: string = '') => {
      const items = await fs.promises.readdir(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const relPath = path.join(relativePath, item);
        const stat = await fs.promises.stat(fullPath);
        
        if (stat.isDirectory()) {
          if (!item.startsWith('.') && item !== 'node_modules') {
            await walk(fullPath, relPath);
          }
        } else {
          files[relPath] = await fs.promises.readFile(fullPath, 'utf-8');
        }
      }
    };
    
    await walk(dir);
    return files;
  }

  private calculateChecksum(data: Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async installPackage(packageInfo: PackageInfo): Promise<void> {
    const installPath = path.join(process.cwd(), 'node_modules', packageInfo.name);
    
    // Create directory
    await fs.promises.mkdir(installPath, { recursive: true });
    
    // Extract files from tarball
    const files = JSON.parse(packageInfo.tarball.toString());
    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = path.join(installPath, filePath as string);
      await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.promises.writeFile(fullPath, content as string);
    }
    
    // Install dependencies recursively
    for (const [depName, depVersion] of Object.entries(packageInfo.dependencies)) {
      await this.install(depName, depVersion);
    }
  }
}

interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  keywords: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  tarball: Buffer;
  checksum: string;
  publishedAt: string;
}

// ============================================================================
// BUILD SYSTEM
// ============================================================================

export class BuildSystem {
  private tasks = new Map<string, BuildTask>();
  private cache = new Map<string, BuildCache>();

  addTask(name: string, task: BuildTask): void {
    this.tasks.set(name, task);
  }

  async run(taskName: string): Promise<ResultValue> {
    const task = this.tasks.get(taskName);
    if (!task) {
      return new ResultValue(false, new StringValue(`Task '${taskName}' not found`));
    }

    try {
      console.log(`Running task: ${taskName}`);
      const startTime = Date.now();
      
      // Check if task needs to run (incremental build)
      const needsRun = await this.shouldRunTask(taskName, task);
      if (!needsRun) {
        console.log(`Task '${taskName}' is up to date`);
        return new ResultValue(true, new StringValue(`Task '${taskName}' skipped (up to date)`));
      }

      // Run dependencies first
      for (const depName of task.dependencies) {
        const depResult = await this.run(depName);
        if (!depResult.isOk) {
          return depResult;
        }
      }

      // Run the task
      await task.execute();
      
      // Update cache
      await this.updateTaskCache(taskName, task);
      
      const duration = Date.now() - startTime;
      console.log(`Task '${taskName}' completed in ${duration}ms`);
      
      return new ResultValue(true, new StringValue(`Task '${taskName}' completed successfully`));
    } catch (error) {
      return new ResultValue(false, new StringValue(`Task '${taskName}' failed: ${error}`));
    }
  }

  private async shouldRunTask(taskName: string, task: BuildTask): boolean {
    const cache = this.cache.get(taskName);
    if (!cache) {
      return true; // No cache, must run
    }

    // Check if any input files have changed
    for (const inputFile of task.inputs) {
      const currentHash = await this.getFileHash(inputFile);
      if (cache.inputHashes[inputFile] !== currentHash) {
        return true;
      }
    }

    // Check if any output files are missing
    for (const outputFile of task.outputs) {
      if (!fs.existsSync(outputFile)) {
        return true;
      }
    }

    return false;
  }

  private async updateTaskCache(taskName: string, task: BuildTask): Promise<void> {
    const inputHashes: Record<string, string> = {};
    
    for (const inputFile of task.inputs) {
      inputHashes[inputFile] = await this.getFileHash(inputFile);
    }

    this.cache.set(taskName, {
      inputHashes,
      lastRun: Date.now()
    });
  }

  private async getFileHash(filePath: string): Promise<string> {
    try {
      const content = await fs.promises.readFile(filePath);
      return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
      return '';
    }
  }
}

export interface BuildTask {
  name: string;
  dependencies: string[];
  inputs: string[];
  outputs: string[];
  execute: () => Promise<void>;
}

interface BuildCache {
  inputHashes: Record<string, string>;
  lastRun: number;
}

// ============================================================================
// BUILD CONFIGURATION
// ============================================================================

export class BuildConfig {
  static createDefaultConfig(): BuildSystem {
    const buildSystem = new BuildSystem();

    // Compile task
    buildSystem.addTask('compile', {
      name: 'compile',
      dependencies: [],
      inputs: ['src/**/*.el'],
      outputs: ['dist/**/*.js'],
      execute: async () => {
        console.log('Compiling Enterprise Lang files...');
        // Compilation logic would go here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate compilation
      }
    });

    // Test task
    buildSystem.addTask('test', {
      name: 'test',
      dependencies: ['compile'],
      inputs: ['tests/**/*.el', 'dist/**/*.js'],
      outputs: ['coverage/**/*'],
      execute: async () => {
        console.log('Running tests...');
        // Test execution logic would go here
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    });

    // Package task
    buildSystem.addTask('package', {
      name: 'package',
      dependencies: ['compile', 'test'],
      inputs: ['dist/**/*.js', 'package.json'],
      outputs: ['dist/*.tar.gz'],
      execute: async () => {
        console.log('Creating package...');
        // Package creation logic would go here
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    });

    // Lint task
    buildSystem.addTask('lint', {
      name: 'lint',
      dependencies: [],
      inputs: ['src/**/*.el'],
      outputs: [],
      execute: async () => {
        console.log('Linting code...');
        // Linting logic would go here
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    });

    // Format task
    buildSystem.addTask('format', {
      name: 'format',
      dependencies: [],
      inputs: ['src/**/*.el'],
      outputs: ['src/**/*.el'],
      execute: async () => {
        console.log('Formatting code...');
        // Code formatting logic would go here
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    });

    return buildSystem;
  }
}

// ============================================================================
// DEPENDENCY RESOLVER
// ============================================================================

export class DependencyResolver {
  private dependencies = new Map<string, string[]>();

  addDependency(package: string, dependencies: string[]): void {
    this.dependencies.set(package, dependencies);
  }

  resolve(rootPackage: string): ResultValue {
    try {
      const resolved: string[] = [];
      const visiting = new Set<string>();
      const visited = new Set<string>();

      const visit = (pkg: string) => {
        if (visited.has(pkg)) {
          return;
        }

        if (visiting.has(pkg)) {
          throw new Error(`Circular dependency detected: ${Array.from(visiting).join(' -> ')} -> ${pkg}`);
        }

        visiting.add(pkg);
        
        const deps = this.dependencies.get(pkg) || [];
        for (const dep of deps) {
          visit(dep);
        }

        visiting.delete(pkg);
        visited.add(pkg);
        resolved.push(pkg);
      };

      visit(rootPackage);
      
      return new ResultValue(true, new StringValue(JSON.stringify(resolved)));
    } catch (error) {
      return new ResultValue(false, new StringValue(`Dependency resolution failed: ${error}`));
    }
  }
}

// ============================================================================
// HOT CODE RELOADING
// ============================================================================

export class HotReloader {
  private watchers = new Map<string, fs.FSWatcher>();
  private callbacks = new Map<string, (filePath: string) => void>();

  watch(filePath: string, callback: (filePath: string) => void): void {
    if (this.watchers.has(filePath)) {
      this.watchers.get(filePath)!.close();
    }

    const watcher = fs.watch(filePath, (eventType, filename) => {
      if (eventType === 'change' && filename) {
        callback(path.join(filePath, filename));
      }
    });

    this.watchers.set(filePath, watcher);
    this.callbacks.set(filePath, callback);
  }

  unwatch(filePath: string): void {
    const watcher = this.watchers.get(filePath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(filePath);
      this.callbacks.delete(filePath);
    }
  }

  unwatchAll(): void {
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();
    this.callbacks.clear();
  }
}

// ============================================================================
// WORKSPACE MANAGEMENT
// ============================================================================

export class Workspace {
  private packages = new Map<string, PackageManifest>();

  constructor(private rootPath: string) {}

  async initialize(): Promise<void> {
    const workspaceConfig = await this.loadWorkspaceConfig();
    
    for (const packagePath of workspaceConfig.packages) {
      const fullPath = path.join(this.rootPath, packagePath);
      const manifest = await this.loadPackageManifest(fullPath);
      this.packages.set(manifest.name, manifest);
    }
  }

  async addPackage(packagePath: string): Promise<ResultValue> {
    try {
      const fullPath = path.join(this.rootPath, packagePath);
      const manifest = await this.loadPackageManifest(fullPath);
      this.packages.set(manifest.name, manifest);
      
      return new ResultValue(true, new StringValue(`Added package ${manifest.name} to workspace`));
    } catch (error) {
      return new ResultValue(false, new StringValue(`Failed to add package: ${error}`));
    }
  }

  getPackages(): PackageManifest[] {
    return Array.from(this.packages.values());
  }

  private async loadWorkspaceConfig(): Promise<WorkspaceConfig> {
    const configPath = path.join(this.rootPath, 'workspace.json');
    
    try {
      const content = await fs.promises.readFile(configPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      // Default workspace config
      return {
        packages: ['packages/*']
      };
    }
  }

  private async loadPackageManifest(packagePath: string): Promise<PackageManifest> {
    const manifestPath = path.join(packagePath, 'package.json');
    const content = await fs.promises.readFile(manifestPath, 'utf-8');
    return JSON.parse(content);
  }
}

interface WorkspaceConfig {
  packages: string[];
}
