import { writable } from "svelte/store";

// 게임 정보 타입을 정의 (필요에 따라 확장)
interface GameInfo {
  gameId: string | null;
  myPlayerNum: number | null; // 내가 플레이어 1인지 2인지
  opponentId: string | null;
}

// GameInfo 타입 또는 null을 저장할 수 있는 writable 스토어 생성
// 초기값은 null 또는 기본값 객체
export const gameInfo = writable<GameInfo | null>(null);

// 또는 기본값 객체 사용
// export const gameInfo = writable<GameInfo>({
//   gameId: null,
//   myPlayerNum: null,
//   opponentId: null
// });
