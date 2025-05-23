// Phase 4: Advanced Concurrency Primitives
// src/concurrency/async.ts
// Phase 4: Advanced Concurrency Primitives

import { Value, NumberValue, StringValue, BooleanValue, OptionValue, ResultValue } from '../interpreter/interpreter';

// ============================================================================
// ASYNC/AWAIT INFRASTRUCTURE
// ============================================================================

export class PromiseValue extends Value {
  private state: 'pending' | 'fulfilled' | 'rejected' = 'pending';
  private value: Value | null = null;
  private callbacks: Array<(value: Value) => void> = [];
  private errorCallbacks: Array<(error: Value) => void> = [];

  constructor(
    executor?: (resolve: (value: Value) => void, reject: (error: Value) => void) => void
  ) {
    super();
    
    if (executor) {
      try {
        executor(
          (value: Value) => this.resolve(value),
          (error: Value) => this.reject(error)
        );
      } catch (err) {
        this.reject(new StringValue(err instanceof Error ? err.message : String(err)));
      }
    }
  }

  toString(): string {
    return `Promise(${this.state})`;
  }

  static resolve(value: Value): PromiseValue {
    const promise = new PromiseValue();
    promise.resolve(value);
    return promise;
  }

  static reject(error: Value): PromiseValue {
    const promise = new PromiseValue();
    promise.reject(error);
    return promise;
  }

  private resolve(value: Value): void {
    if (this.state !== 'pending') return;
    
    this.state = 'fulfilled';
    this.value = value;
    
    for (const callback of this.callbacks) {
      setImmediate(() => callback(value));
    }
    this.callbacks = [];
  }

  private reject(error: Value): void {
    if (this.state !== 'pending') return;
    
    this.state = 'rejected';
    this.value = error;
    
    for (const callback of this.errorCallbacks) {
      setImmediate(() => callback(error));
    }
    this.errorCallbacks = [];
  }

  then(onFulfilled?: (value: Value) => Value | PromiseValue): PromiseValue {
    return new PromiseValue((resolve, reject) => {
      const handleFulfilled = (value: Value) => {
        try {
          if (onFulfilled) {
            const result = onFulfilled(value);
            if (result instanceof PromiseValue) {
              result.then(resolve).catch(reject);
            } else {
              resolve(result);
            }
          } else {
            resolve(value);
          }
        } catch (err) {
          reject(new StringValue(err instanceof Error ? err.message : String(err)));
        }
      };

      if (this.state === 'fulfilled') {
        setImmediate(() => handleFulfilled(this.value!));
      } else if (this.state === 'rejected') {
        setImmediate(() => reject(this.value!));
      } else {
        this.callbacks.push(handleFulfilled);
        this.errorCallbacks.push(reject);
      }
    });
  }

  catch(onRejected: (error: Value) => Value | PromiseValue): PromiseValue {
    return new PromiseValue((resolve, reject) => {
      const handleRejected = (error: Value) => {
        try {
          const result = onRejected(error);
          if (result instanceof PromiseValue) {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } catch (err) {
          reject(new StringValue(err instanceof Error ? err.message : String(err)));
        }
      };

      if (this.state === 'rejected') {
        setImmediate(() => handleRejected(this.value!));
      } else if (this.state === 'fulfilled') {
        setImmediate(() => resolve(this.value!));
      } else {
        this.callbacks.push(resolve);
        this.errorCallbacks.push(handleRejected);
      }
    });
  }

  static all(promises: PromiseValue[]): PromiseValue {
    return new PromiseValue((resolve, reject) => {
      if (promises.length === 0) {
        resolve(new ArrayValue([]));
        return;
      }

      const results: Value[] = new Array(promises.length);
      let completedCount = 0;

      promises.forEach((promise, index) => {
        promise.then((value) => {
          results[index] = value;
          completedCount++;
          
          if (completedCount === promises.length) {
            resolve(new ArrayValue(results));
          }
        }).catch(reject);
      });
    });
  }

  static race(promises: PromiseValue[]): PromiseValue {
    return new PromiseValue((resolve, reject) => {
      for (const promise of promises) {
        promise.then(resolve).catch(reject);
      }
    });
  }
}

// ============================================================================
// ACTOR MODEL IMPLEMENTATION
// ============================================================================

export class ActorSystem {
  private static instance: ActorSystem;
  private actors = new Map<string, Actor>();
  private messageQueue: Message[] = [];
  private isProcessing = false;

  static getInstance(): ActorSystem {
    if (!ActorSystem.instance) {
      ActorSystem.instance = new ActorSystem();
    }
    return ActorSystem.instance;
  }

  spawn(name: string, behavior: ActorBehavior): ActorRef {
    const actor = new Actor(name, behavior);
    this.actors.set(name, actor);
    return new ActorRef(name);
  }

  send(actorName: string, message: Message): void {
    this.messageQueue.push(message);
    this.processMessages();
  }

  private async processMessages(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      const actor = this.actors.get(message.recipient);
      
      if (actor) {
        try {
          await actor.receive(message);
        } catch (error) {
          console.error(`Actor ${message.recipient} error:`, error);
        }
      }
    }

    this.isProcessing = false;
  }

  stop(actorName: string): void {
    this.actors.delete(actorName);
  }
}

export class ActorRef extends Value {
  constructor(public name: string) {
    super();
  }

  toString(): string {
    return `ActorRef(${this.name})`;
  }

  send(message: Value, sender?: ActorRef): void {
    const msg = new Message(this.name, message, sender);
    ActorSystem.getInstance().send(this.name, msg);
  }
}

export class Message {
  constructor(
    public recipient: string,
    public payload: Value,
    public sender?: ActorRef
  ) {}
}

export interface ActorBehavior {
  receive(message: Message): Promise<void> | void;
}

class Actor {
  constructor(
    public name: string,
    private behavior: ActorBehavior
  ) {}

  async receive(message: Message): Promise<void> {
    await this.behavior.receive(message);
  }
}

// ============================================================================
// CHANNEL IMPLEMENTATION (CSP-style)
// ============================================================================

export class Channel<T extends Value> extends Value {
  private buffer: T[] = [];
  private readers: Array<(value: T) => void> = [];
  private writers: Array<{ value: T, resolve: () => void }> = [];
  private closed = false;

  constructor(private capacity: number = 0) {
    super();
  }

  toString(): string {
    return `Channel(capacity: ${this.capacity}, buffered: ${this.buffer.length})`;
  }

  async send(value: T): Promise<void> {
    if (this.closed) {
      throw new Error('Cannot send to closed channel');
    }

    return new Promise((resolve) => {
      if (this.readers.length > 0) {
        // Direct transfer to waiting reader
        const reader = this.readers.shift()!;
        setImmediate(() => reader(value));
        resolve();
      } else if (this.buffer.length < this.capacity) {
        // Buffer the value
        this.buffer.push(value);
        resolve();
      } else {
        // Wait for space
        this.writers.push({ value, resolve });
      }
    });
  }

  async receive(): Promise<T> {
    if (this.buffer.length > 0) {
      const value = this.buffer.shift()!;
      
      // Process waiting writers
      if (this.writers.length > 0) {
        const writer = this.writers.shift()!;
        this.buffer.push(writer.value);
        setImmediate(() => writer.resolve());
      }
      
      return value;
    }

    if (this.closed && this.buffer.length === 0) {
      throw new Error('Channel is closed');
    }

    return new Promise((resolve) => {
      this.readers.push(resolve);
    });
  }

  close(): void {
    this.closed = true;
    
    // Reject all waiting readers
    for (const reader of this.readers) {
      setImmediate(() => {
        try {
          throw new Error('Channel closed');
        } catch (err) {
          // In a real implementation, this would properly handle the error
        }
      });
    }
    
    this.readers = [];
  }

  isClosed(): boolean {
    return this.closed;
  }
}

// ============================================================================
// SOFTWARE TRANSACTIONAL MEMORY (STM)
// ============================================================================

export class STMValue<T extends Value> extends Value {
  private value: T;
  private version = 0;

  constructor(initialValue: T) {
    super();
    this.value = initialValue;
  }

  toString(): string {
    return `STM(${this.value.toString()})`;
  }

  read(transaction: Transaction): T {
    transaction.addRead(this, this.version);
    return this.value;
  }

  write(transaction: Transaction, newValue: T): void {
    transaction.addWrite(this, newValue);
  }

  commit(newValue: T, expectedVersion: number): boolean {
    if (this.version !== expectedVersion) {
      return false; // Conflict detected
    }
    
    this.value = newValue;
    this.version++;
    return true;
  }

  getCurrentVersion(): number {
    return this.version;
  }
}

export class Transaction {
  private reads = new Map<STMValue<any>, number>();
  private writes = new Map<STMValue<any>, Value>();
  private committed = false;

  addRead<T extends Value>(stmValue: STMValue<T>, version: number): void {
    if (!this.reads.has(stmValue)) {
      this.reads.set(stmValue, version);
    }
  }

  addWrite<T extends Value>(stmValue: STMValue<T>, value: T): void {
    this.writes.set(stmValue, value);
  }

  async commit(): Promise<boolean> {
    if (this.committed) {
      throw new Error('Transaction already committed');
    }

    // Validate reads
    for (const [stmValue, expectedVersion] of this.reads) {
      if (stmValue.getCurrentVersion() !== expectedVersion) {
        return false; // Conflict - retry needed
      }
    }

    // Apply writes
    for (const [stmValue, newValue] of this.writes) {
      const readVersion = this.reads.get(stmValue) || stmValue.getCurrentVersion();
      if (!stmValue.commit(newValue, readVersion)) {
        return false; // Conflict during write
      }
    }

    this.committed = true;
    return true;
  }
}

export class STM {
  static async atomically<T>(operation: (transaction: Transaction) => T): Promise<T> {
    const maxRetries = 100;
    let retries = 0;

    while (retries < maxRetries) {
      const transaction = new Transaction();
      
      try {
        const result = operation(transaction);
        
        if (await transaction.commit()) {
          return result;
        }
        
        // Conflict detected, retry with exponential backoff
        retries++;
        await this.delay(Math.min(100, 2 ** retries));
      } catch (error) {
        throw error;
      }
    }

    throw new Error('Transaction failed after maximum retries');
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// WORK-STEALING SCHEDULER
// ============================================================================

export class Task {
  constructor(
    public id: string,
    public work: () => Promise<Value> | Value,
    public priority: number = 0
  ) {}
}

export class WorkerThread {
  private queue: Task[] = [];
  private isRunning = false;
  private stealRequests = 0;

  constructor(public id: string) {}

  addTask(task: Task): void {
    this.queue.push(task);
    this.queue.sort((a, b) => b.priority - a.priority); // Higher priority first
    
    if (!this.isRunning) {
      this.start();
    }
  }

  async start(): Promise<void> {
    this.isRunning = true;
    
    while (this.queue.length > 0 || this.stealRequests > 0) {
      const task = this.queue.shift();
      
      if (task) {
        try {
          await task.work();
        } catch (error) {
          console.error(`Task ${task.id} failed:`, error);
        }
      } else {
        // No work available, try to steal
        await this.tryStealWork();
      }
    }
    
    this.isRunning = false;
  }

  private async tryStealWork(): Promise<void> {
    // In a real implementation, this would attempt to steal work from other threads
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  stealHalf(): Task[] {
    const half = Math.floor(this.queue.length / 2);
    return this.queue.splice(0, half);
  }

  getQueueSize(): number {
    return this.queue.length;
  }
}

export class WorkStealingScheduler {
  private workers: WorkerThread[] = [];
  private roundRobinIndex = 0;

  constructor(numWorkers: number = 4) {
    for (let i = 0; i < numWorkers; i++) {
      this.workers.push(new WorkerThread(`worker-${i}`));
    }
  }

  schedule(task: Task): void {
    // Round-robin assignment to workers
    const worker = this.workers[this.roundRobinIndex];
    worker.addTask(task);
    
    this.roundRobinIndex = (this.roundRobinIndex + 1) % this.workers.length;
    
    // Trigger work stealing if needed
    this.balanceLoad();
  }

  private balanceLoad(): void {
    // Find the worker with the most tasks
    let maxWorker = this.workers[0];
    let minWorker = this.workers[0];
    
    for (const worker of this.workers) {
      if (worker.getQueueSize() > maxWorker.getQueueSize()) {
        maxWorker = worker;
      }
      if (worker.getQueueSize() < minWorker.getQueueSize()) {
        minWorker = worker;
      }
    }
    
    // If imbalance is significant, steal work
    if (maxWorker.getQueueSize() - minWorker.getQueueSize() > 2) {
      const stolenTasks = maxWorker.stealHalf();
      for (const task of stolenTasks) {
        minWorker.addTask(task);
      }
    }
  }

  async shutdown(): Promise<void> {
    // Wait for all workers to complete
    await Promise.all(this.workers.map(worker => worker.start()));
  }
}

// ============================================================================
// ASYNC UTILITIES
// ============================================================================

export class AsyncUtils {
  static sleep(ms: NumberValue): PromiseValue {
    return new PromiseValue((resolve) => {
      setTimeout(() => resolve(new NumberValue(0)), ms.value);
    });
  }

  static timeout<T extends Value>(promise: PromiseValue, ms: NumberValue): PromiseValue {
    const timeoutPromise = new PromiseValue((_, reject) => {
      setTimeout(() => reject(new StringValue('Operation timed out')), ms.value);
    });

    return PromiseValue.race([promise, timeoutPromise]);
  }

  static retry<T extends Value>(
    operation: () => PromiseValue,
    maxAttempts: NumberValue,
    delay: NumberValue
  ): PromiseValue {
    return new PromiseValue((resolve, reject) => {
      let attempts = 0;

      const attempt = () => {
        attempts++;
        operation()
          .then(resolve)
          .catch((error) => {
            if (attempts >= maxAttempts.value) {
              reject(error);
            } else {
              setTimeout(attempt, delay.value);
            }
          });
      };

      attempt();
    });
  }

  static debounce(func: () => Value, delay: NumberValue): () => PromiseValue {
    let timeoutId: NodeJS.Timeout | null = null;

    return () => {
      return new PromiseValue((resolve) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
          const result = func();
          resolve(result);
        }, delay.value);
      });
    };
  }

  static throttle(func: () => Value, interval: NumberValue): () => Value | null {
    let lastCall = 0;

    return () => {
      const now = Date.now();
      if (now - lastCall >= interval.value) {
        lastCall = now;
        return func();
      }
      return null;
    };
  }
}

// ============================================================================
// CONCURRENT DATA STRUCTURES
// ============================================================================

export class ConcurrentQueue<T extends Value> extends Value {
  private queue: T[] = [];
  private lock = false;

  toString(): string {
    return `ConcurrentQueue(${this.queue.length} items)`;
  }

  async enqueue(item: T): Promise<void> {
    await this.acquireLock();
    try {
      this.queue.push(item);
    } finally {
      this.releaseLock();
    }
  }

  async dequeue(): Promise<OptionValue> {
    await this.acquireLock();
    try {
      const item = this.queue.shift();
      return new OptionValue(item || null);
    } finally {
      this.releaseLock();
    }
  }

  async size(): Promise<NumberValue> {
    await this.acquireLock();
    try {
      return new NumberValue(this.queue.length);
    } finally {
      this.releaseLock();
    }
  }

  private async acquireLock(): Promise<void> {
    while (this.lock) {
      await new Promise(resolve => setImmediate(resolve));
    }
    this.lock = true;
  }

  private releaseLock(): void {
    this.lock = false;
  }
}

// ============================================================================
// FIBER-BASED COOPERATIVE MULTITASKING
// ============================================================================

export class Fiber extends Value {
  private generator: Generator<Value, Value, Value>;
  private isComplete = false;
  private result: Value | null = null;

  constructor(generatorFunc: () => Generator<Value, Value, Value>) {
    super();
    this.generator = generatorFunc();
  }

  toString(): string {
    return `Fiber(${this.isComplete ? 'complete' : 'running'})`;
  }

  resume(input?: Value): { value: Value; done: boolean } {
    if (this.isComplete) {
      return { value: this.result!, done: true };
    }

    const result = this.generator.next(input);
    
    if (result.done) {
      this.isComplete = true;
      this.result = result.value;
    }

    return { value: result.value, done: result.done };
  }

  static yield(value: Value): Value {
    // This would be implemented as a special instruction in the interpreter
    return value;
  }
}

export class FiberScheduler {
  private fibers: Fiber[] = [];
  private isRunning = false;

  spawn(fiberFunc: () => Generator<Value, Value, Value>): Fiber {
    const fiber = new Fiber(fiberFunc);
    this.fibers.push(fiber);
    
    if (!this.isRunning) {
      this.start();
    }
    
    return fiber;
  }

  private async start(): Promise<void> {
    this.isRunning = true;

    while (this.fibers.length > 0) {
      for (let i = this.fibers.length - 1; i >= 0; i--) {
        const fiber = this.fibers[i];
        const result = fiber.resume();

        if (result.done) {
          this.fibers.splice(i, 1);
        }
      }

      // Yield control to allow other tasks
      await new Promise(resolve => setImmediate(resolve));
    }

    this.isRunning = false;
  }
}
