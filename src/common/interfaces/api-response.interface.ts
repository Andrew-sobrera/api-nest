export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  data: null;
  message: string;
  errors?: string[];
  statusCode: number;
  timestamp: string;
  path: string;
}
