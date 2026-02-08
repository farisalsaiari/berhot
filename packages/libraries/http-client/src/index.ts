import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

export interface ServiceClientConfig {
  baseURL: string;
  timeout?: number;
  serviceName?: string;
  tenantId?: string;
  authToken?: string;
}

export function createServiceClient(config: ServiceClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout || 10000,
    headers: {
      'Content-Type': 'application/json',
      ...(config.tenantId ? { 'x-tenant-id': config.tenantId } : {}),
      ...(config.authToken ? { Authorization: `Bearer ${config.authToken}` } : {}),
      ...(config.serviceName ? { 'x-source-service': config.serviceName } : {}),
    },
  });

  // Request interceptor for logging
  client.interceptors.request.use((request) => {
    console.debug(`[HTTP] ${request.method?.toUpperCase()} ${request.baseURL}${request.url}`);
    return request;
  });

  // Response interceptor for error normalization
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.error?.message || error.message;
        console.error(`[HTTP Error] ${status} - ${message}`);
      }
      throw error;
    },
  );

  return client;
}

/** Pre-configured clients for internal service communication */
export const InternalServices = {
  identity: (tenantId?: string) =>
    createServiceClient({
      baseURL: process.env.IDENTITY_SERVICE_URL || 'http://identity-access:8080',
      serviceName: 'internal',
      tenantId,
    }),
  tenant: (tenantId?: string) =>
    createServiceClient({
      baseURL: process.env.TENANT_SERVICE_URL || 'http://tenant-management:8080',
      serviceName: 'internal',
      tenantId,
    }),
  notification: (tenantId?: string) =>
    createServiceClient({
      baseURL: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-center:3000',
      serviceName: 'internal',
      tenantId,
    }),
};
