const eventPublisherWorkerConfig = {
  intervalInMs: 5000,
  delayedStartIntervalInMs: 500,
  batchSize: 500,
  maxPendingFlushCount: 10,
  eventProcessingBatchCompletionThreshold: 0.3,
};

export { eventPublisherWorkerConfig };
