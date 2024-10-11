export class CrossCuttingError extends Error {
  name = 'CrossCuttingError';
  constructor(
    public readonly message: string,
    public readonly code?: string,
  ) {
    super(message);
  }
}
