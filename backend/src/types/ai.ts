export interface GenerateRequestBody {
  prompt: string;
}

export interface GenerateResponse {
  success: boolean;
  data?: string;
  error?: string;
}