// types/index.ts

/** ISO 날짜 문자열 (예: "2025-06-10") */
export type ISODateString = string;

/** 사용자가 투표에서 선택하는 개별 날짜 또는 날짜-시간 옵션 */
export interface PollOption {
  date: ISODateString; // YYYY-MM-DD 형식
  label: string; // 사용자에게 표시될 날짜 레이블 (예: "6월 10일 (화)")
  votes: string[]; // 해당 옵션에 투표한 사용자 닉네임 배열
  timeSlots?: Array<{ time: string; votes: string[] }>; // 'datetime' 투표 유형에 사용될 시간대별 투표 정보
}

/** 투표(Poll) 정보 전체 구조 */
export interface Poll {
  id: string;
  title: string;
  voteType: "date" | "datetime";
  periodStartDate: ISODateString; // 투표 가능 기간 시작일
  periodEndDate: ISODateString; // 투표 가능 기간 종료일
  options: PollOption[];
  createdAt: string; // ISO timestamp 문자열
  // adminKey는 현재 사용되지 않으므로 제거된 상태 유지
}

/** API를 통해 클라이언트로 전달될 수 있는 Poll 데이터의 일부 (옵션 필드 제외 가능) */
export interface PollDetails extends Omit<Poll, "options" | "createdAt"> {
  createdAt?: string; // 생성 시에는 문자열, 클라이언트에서는 Date 객체로 변환될 수 있음
  options?: PollOption[]; // 옵션은 선택적으로 포함
}

/** 사용자의 투표 응답 정보 (API 요청/응답 시 사용 가능) */
export interface ParticipantVote {
  nickname: string;
  password?: string; // 인증에 필요한 비밀번호 (요청 시 사용)
  selectedDates: ISODateString[]; // 선택한 날짜들 (YYYY-MM-DD 형식)
}

/** 참여자 인증 API 응답 */
export interface ParticipantAuthResponse {
  success: boolean;
  participant: { nickname: string };
  previousSelectedDates: ISODateString[] | null; // 기존에 선택했던 날짜들
  error?: string;
}

/** 로컬 스토리지에 저장될 참여자 정보 */
export interface StoredParticipantData {
  nickname: string;
  previousSelectedDates?: ISODateString[];
}
