export class CoreError extends Error {
  name = 'CoreError';
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    if (cause instanceof Error) {
      this.stack = `${this.stack}\n${cause.stack}`;
    }
  }
}
