import { HttpRequest, HttpResponse } from '@/adapters/ports/http/http-definitions';

export type HandlerFunction = (request: HttpRequest) => Promise<HttpResponse>;
export type HttpRoute = { method: 'get' | 'post' | 'put' | 'patch' | 'delete'; path: string; handler: HandlerFunction };

export interface HttpController {
  getRoutes(): HttpRoute[];
}
