/* eslint-disable @typescript-eslint/no-explicit-any */
export interface HttpRequest {
  body?: any;
  query?: { [key: string]: string };
  params?: { [key: string]: string };
  headers?: { [key: string]: string };
}

export interface HttpResponse {
  statusCode: number;
  payload?: any;
  headers?: { [key: string]: string };
}
