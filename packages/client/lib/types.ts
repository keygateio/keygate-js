export type ServerResponses = {
	login: { success: boolean };
	logout: { success: boolean };
};

export type ClientParams = {
	login: { username: string; password: string };
	logout: {};
};

export type Methods = keyof ServerResponses | keyof ClientParams;

export type WorkerMessage<T extends Methods> = {
	method: T;
	response: ServerResponses[T] | { error: string };
	id: number;
};
