class JsonApiError extends Error {
  status: string;
  code: string;
  source?: { pointer: string } | undefined;
  title: string;
  detail?: string | undefined;

  constructor({
    status,
    title,
    code,
    source,
    detail,
  }: {
    status: string;
    title: string;
    detail?: string | undefined;
    code: string;
    source?: { pointer: string };
  }) {
    super(title);
    this.name = 'JsonApiError';
    this.status = status;
    this.detail = detail;
    this.code = code;
    this.source = source;
    this.title = title;
  }

  toJSON() {
    return {
      errors: [
        {
          status: this.status.toString(),
          title: this.title,
          detail: this.detail,
          code: this.code,
          source: this.source,
        },
      ],
    };
  }

  asJSON() {
    return {
      status: this.status.toString(),
      title: this.title,
      detail: this.detail,
      code: this.code,
      source: this.source,
    };
  }
}

class ValidationError extends JsonApiError {
  constructor(field: string, detail?: string) {
    super({
      status: '422',
      code: 'VALIDATION_ERROR',
      title: 'Validation Error',
      source: { pointer: `/data/attributes/${field}` },
      detail,
    });
  }
}

class NotFoundError extends JsonApiError {
  constructor(resource: string = 'Resource') {
    super({
      status: '404',
      code: 'NOT_FOUND',
      title: 'Resource Not Found',
      detail: `The requested ${resource.toLowerCase()} was not found.`,
    });
  }
}

export { JsonApiError, ValidationError, NotFoundError };
