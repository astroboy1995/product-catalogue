export class EmailDeliveryError extends Error {
  constructor() {
    super('Email delivery failed.');
    this.name = 'EmailDeliveryError';
  }
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof EmailDeliveryError) {
    return { status: 503, body: { error: { code: 'EMAIL_UNAVAILABLE', message: 'Email delivery is temporarily unavailable.' } } };
  }
  if (error && typeof error === 'object' && 'type' in error && error.type === 'entity.parse.failed') {
    return { status: 400, body: { error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } } };
  }
  return { status: 502, body: { error: { code: 'PRODUCT_SOURCE_UNAVAILABLE', message: 'Product data is temporarily unavailable.' } } };
}
