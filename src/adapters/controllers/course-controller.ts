import { resolve } from '@/cross-cutting/dependency-injection/container';
import { CreateCourse } from '@/application/use-cases/create-course';
import { HttpController, HttpRoute } from '@/adapters/controllers/http-controller';
import { HttpRequest, HttpResponse } from '@/adapters/ports/http/http-definitions';

export class CreateCourseController implements HttpController {
  async createCourse({ body }: HttpRequest): Promise<HttpResponse> {
    const { tenantId, title, description } = body;
    const createCourse = resolve<CreateCourse>('CreateCourse');
    const { courseId } = await createCourse.execute({
      tenantId,
      title,
      description,
    });
    return { statusCode: 200, payload: { courseId } };
  }

  getRoutes(): HttpRoute[] {
    return [{ method: 'post', path: '/courses', handler: this.createCourse.bind(this) }];
  }
}
