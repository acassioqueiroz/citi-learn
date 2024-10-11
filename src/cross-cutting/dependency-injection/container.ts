import { CrossCuttingError } from '@/cross-cutting/errors/cross-cutting-error';

type Factory<T> = () => T;

class Registry {
  private static registryInstance: Registry | undefined = undefined;
  private instances: { [key: string]: unknown } = {};
  private factories: { [key: string]: Factory<unknown> } = {};

  public registerFactory<T>(name: string, factory: Factory<T>): void {
    if (Object.keys(this.factories).includes(name) || Object.keys(this.instances).includes(name)) {
      throw new CrossCuttingError(`Factory or singleton already registered for ${name}`);
    }
    this.factories[name as keyof typeof this.factories] = factory;
  }

  public registerSingleton<T>(name: string, instance: T): void {
    if (Object.keys(this.factories).includes(name) || Object.keys(this.instances).includes(name)) {
      throw new CrossCuttingError(`Factory or singleton already registered for ${name}`);
    }
    this.instances[name] = instance;
  }

  public resolve<T>(name: string): T {
    if (Object.keys(this.instances).includes(name)) {
      return this.instances[name] as T;
    }
    if (!Object.keys(this.factories).includes(name)) {
      throw new CrossCuttingError(`No factory or singleton found for ${name}.`);
    }
    const factory = this.factories[name];
    return factory() as T;
  }

  public static getInstance() {
    if (!Registry.registryInstance) {
      Registry.registryInstance = new Registry();
    }
    return Registry.registryInstance;
  }
}

export class RegistrySingleton {}

export function resolve<T>(dependencyName: string): T {
  const instance = Registry.getInstance().resolve<T>(dependencyName);
  return instance;
}

export function register(dependencyName: string, factory: Factory<unknown> | unknown): void {
  if (factory instanceof Function) {
    Registry.getInstance().registerFactory(dependencyName, factory as Factory<unknown>);
  } else {
    Registry.getInstance().registerSingleton(dependencyName, factory);
  }
}
