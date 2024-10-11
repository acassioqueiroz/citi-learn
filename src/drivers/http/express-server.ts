import express, { Express, json } from 'express';
import { Server } from 'http';
import { HttpController } from '@/adapters/controllers/http-controller';
import { HttpRequest, HttpResponse } from '@/adapters/ports/http/http-definitions';

class ExpressServer {
  private app: Express;
  private server?: Server;

  constructor() {
    const app = express();
    app.use(json());
    this.app = app;
  }
  public attach(controllers: HttpController[]): void {
    controllers.forEach(controller => {
      const routes = controller.getRoutes();
      routes.forEach(route => {
        this.register(route.method, route.path, route.handler);
      });
    });
  }

  private register(method: 'get' | 'post' | 'put' | 'patch' | 'delete', path: string, handler: (req: HttpRequest) => Promise<HttpResponse>): void {
    this.app[method](path, async (request, response) => {
      const body = request.body;
      const headers = request.headers as Record<string, string>;
      const params = request.headers as Record<string, string>;
      const query = request.headers as Record<string, string>;
      try {
        const { statusCode, payload, headers: responseHeaders } = await handler({ body, headers, params, query });
        response.set({ ...responseHeaders });
        response.status(statusCode).json(payload);
      } catch (error) {
        if (error instanceof Error) {
          response.status(500).json({ error: error.message });
          return;
        }
        response.status(500).json({ error: 'Internal server error' });
      }
    });
  }

  listen(port: number, callback?: () => void): void {
    this.server = this.app.listen(port, callback);
  }

  stopServer(): void {
    if (!this.server) {
      return;
    }
    this.server?.close();
  }
}

export { ExpressServer };
