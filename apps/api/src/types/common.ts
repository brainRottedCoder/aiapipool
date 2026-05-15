export interface RequestContext {
  requestId: string;
  user: {
    id: string;
    email: string;
    balance: string; // decimal as string
  };
  apiKey: {
    id: string;
    rate_limit_rpm: number;
    rate_limit_tokens_day: number;
  };
  startTime: number;
}
