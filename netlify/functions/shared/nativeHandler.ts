export type FunctionRequest = {
  httpMethod: string;
  path: string;
  headers: Record<string, string>;
  body: string | null;
  queryStringParameters: Record<string, string>;
};

export type FunctionResult = {
  statusCode: number;
  headers?: Record<string, string>;
  body?: string;
  isBase64Encoded?: boolean;
};

export type RequestHandler = (
  request: FunctionRequest,
) => FunctionResult | Promise<FunctionResult>;

export function nativeHandler(handler: RequestHandler) {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const body =
      request.method === "GET" || request.method === "HEAD"
        ? null
        : await request.text();
    const result = await handler({
      httpMethod: request.method,
      path: url.pathname,
      headers: Object.fromEntries(request.headers.entries()),
      body,
      queryStringParameters: Object.fromEntries(url.searchParams.entries()),
    });

    const responseBody =
      result.isBase64Encoded && result.body
        ? Buffer.from(result.body, "base64")
        : result.body || null;

    return new Response(responseBody, {
      status: result.statusCode,
      headers: result.headers,
    });
  };
}
