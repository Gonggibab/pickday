export type VoteOption = string; // ISO 날짜 문자열 (예: "2025-06-10")

export interface Vote {
  id: string;
  title: string;
  description?: string;
  options: VoteOption[];
  createdAt: string;
  responses: VoteResponse[];
}

export interface VoteResponse {
  nickname: string;
  password: string;
  selectedDates: VoteOption[];
}

