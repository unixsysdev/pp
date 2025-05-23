import { PackageRegistry, PackageVersion, DependencyResolver } from '../../src/package/manager';

describe('Package Manager', () => {
  describe('PackageVersion', () => {
    test('parses semantic versions', () => {
      const version = PackageVersion.parse('1.2.3');
      expect(version.major).toBe(1);
      expect(version.minor).toBe(2);
      expect(version.patch).toBe(3);
    });

    test('checks version constraints', () => {
      const version = PackageVersion.parse('1.2.5');
      expect(version.satisfies('^1.2.0')).toBe(true);
      expect(version.satisfies('~1.2.3')).toBe(true);
      expect(version.satisfies('^2.0.0')).toBe(false);
    });
  });

  describe('DependencyResolver', () => {
    test('resolves dependency order', () => {
      const resolver = new DependencyResolver();
      resolver.addDependency('A', ['B', 'C']);
      resolver.addDependency('B', ['D']);
      resolver.addDependency('C', ['D']);
      resolver.addDependency('D', []);
      
      const result = resolver.resolve('A');
      expect(result.isOk).toBe(true);
      
      const resolved = JSON.parse((result.value as any).value);
      expect(resolved).toEqual(['D', 'B', 'C', 'A']);
    });

    test('detects circular dependencies', () => {
      const resolver = new DependencyResolver();
      resolver.addDependency('A', ['B']);
      resolver.addDependency('B', ['A']);
      
      const result = resolver.resolve('A');
      expect(result.isOk).toBe(false);
      expect((result.value as any).value).toContain('Circular dependency');
    });
  });
});
