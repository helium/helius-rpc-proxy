export interface Env {
  CORS_ALLOW_ORIGIN: string;
  HELIUS_API_KEY: string;
  TRITON_API_KEY: string;
  SESSION_KEY: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_CLOUDWATCH_LOG_GROUP_HELIUS: string;
  AWS_CLOUDWATCH_LOG_GROUP_TRITON: string;
  RPC_PROVIDER_OVERRIDE?: string;
}
