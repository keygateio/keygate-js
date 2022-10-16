export type WorkerResponses = {
  login: { success: boolean };
  logout: { success: boolean };
};

export type ClientParams = {
  login: { username: string; password: string };
  logout: {};
};

export type Methods = keyof WorkerResponses | keyof ClientParams;

export type WorkerMessage<T extends Methods> = {
  method: T;
  response: WorkerResponses[T] | { error: string };
  id: number;
};