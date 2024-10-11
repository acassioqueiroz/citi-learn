export interface Observer<T = void> {
  update(payload: T): void;
}

export class Notifier<T = void> {
  private observers: Observer<T>[] = [];

  public addObserver(observer: Observer<T>): void {
    this.observers.push(observer);
  }

  public notifyAll(payload: T): void {
    this.observers.forEach(observer => observer.update(payload));
  }
}
