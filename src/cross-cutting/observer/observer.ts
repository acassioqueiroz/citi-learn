import { resolve } from '@/cross-cutting/dependency-injection/container';
import { Logger } from '@/cross-cutting/logging/logger';

export interface Observer<T> {
  notify(payload: T): void;
}

export class Notifier<T = undefined> {
  private observers: Observer<T>[] = [];

  constructor(private logger = resolve<Logger>('Logger')) {}

  public addObserver(observer: Observer<T>): void {
    this.logger.trace('Adding observer...');
    this.observers.push(observer);
  }

  public notifyAll(payload: T): void {
    this.logger.trace('Notifying all observers...');
    this.observers.forEach(observer => observer.notify(payload));
  }
}
