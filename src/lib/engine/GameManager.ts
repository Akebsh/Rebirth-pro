import { writable, get } from "svelte/store";
import {
  deck_store,
  hand_store,
  entry_store,
  opponent_deck_store,
  opponent_entry_store,
  opponent_hand_store,
} from "./CardStore";
import { CardMovement, type CardInstance } from "./CardManager";
import { getCardDefinition } from "$lib/data/cardDatabase";

export enum GAME_PHASE {
  END = 0,
  DRAW = 1,
  ENERGY = 2,
  MAIN = 3,
}

export let game_playing = writable(false);
export let current_phase = writable(GAME_PHASE.END);

/* export function gameSetting() {
  for (let i = 0; i < 20; i++) {
    deck_store.update((deck) => [
      ...deck,
      createCard({
        serial_number: "CP-0001_1",
        name: "토오루",
        description: "のびしろ",
        image_url:
          "https://s3-ap-northeast-1.amazonaws.com/rebirth-fy.com/wordpress/wp-content/uploads/2025/03/RB_IMS_002B_095RRR.png",
        atk: 2,
        hp: 4,
        type: "character",
        subtype: "guard",
      }),
    ]);
  }
  for (let i = 0; i < 20; i++) {
    deck_store.update((deck) => [
      ...deck,
      createCard({
        serial_number: "CP-0001_2",
        name: "마도카",
        description: "のびしろ",
        image_url:
          "https://s3-ap-northeast-1.amazonaws.com/rebirth-fy.com/wordpress/wp-content/uploads/2025/03/RB_IMS_002B_105RRR.png",
        atk: 2,
        hp: 4,
        type: "character",
        subtype: "guard",
      }),
    ]);
  }
  for (let i = 0; i < 5; i++) {
    deck_store.update((deck) => [
      ...deck,
      createCard({
        serial_number: "CP-0001_3",
        name: "코익투스",
        description: "のびしろ",
        image_url:
          "https://s3-ap-northeast-1.amazonaws.com/rebirth-fy.com/wordpress/wp-content/uploads/2025/03/RB_IMS_002B_115RRR.png",
        atk: 2,
        hp: 4,
        type: "character",
        subtype: "guard",
      }),
    ]);
  }
  for (let i = 0; i < 4; i++) {
    deck_store.update((deck) => [
      ...deck,
      createCard({
        serial_number: "CP-0001_4",
        name: "히나나",
        description: "のびしろ",
        image_url:
          "https://s3-ap-northeast-1.amazonaws.com/rebirth-fy.com/wordpress/wp-content/uploads/2025/03/RB_IMS_002B_125RRR.png",
        atk: 2,
        hp: 4,
        type: "character",
        subtype: "guard",
      }),
    ]);
  }
  deck_store.update((deck) => [
    ...deck,
    createCard({
      serial_number: "CP-0001_1",
      name: "프로모_1",
      description: "のびしろ",
      image_url:
        "https://s3-ap-northeast-1.amazonaws.com/rebirth-fy.com/wordpress/wp-content/images/cardlist/PR/cp_0003.png",
      atk: 3,
      hp: 3,
      type: "character",
      subtype: "member",
      is_first_entry: true,
    }),
  ]);
} */
// gameStart 함수를 수정하여 선택된 덱이 없으면 경고 메시지 표시
export function gameStart(opponentDeck: CardInstance[]): boolean {
  // 반환 타입을 boolean으로 명시

  // --- 1. 플레이어 초기 설정 (기존 로직 활용) ---
  const playerDeck = get(deck_store);

  // 플레이어 덱 유효성 검사
  if (playerDeck.length === 0) {
    console.error("플레이어 덱이 비어있습니다! (deck_store)");
    return false; // 시작 실패
  }

  // 플레이어 첫 엔트리 카드 찾기 및 이동
  // 플레이어 첫 엔트리 찾기 수정
  const playerFirstEntryInstance = playerDeck.find((instance) => {
    const definition = getCardDefinition(instance.serial_number);
    return definition?.is_first_entry ?? false; // ★ DB 조회 후 확인!
  });
  if (playerFirstEntryInstance) {
    const moved = CardMovement.moveCard(
      playerFirstEntryInstance,
      "deck",
      "entry"
    ); // ★ 인스턴스 전달
    // ...
  } else {
    console.warn("플레이어 덱에 첫 엔트리 정의된 카드가 없습니다.");
  }

  // 플레이어 초기 핸드 드로우 (3장)
  console.log("플레이어 초기 핸드 드로우 (3장)");
  for (let i = 0; i < 3; i++) {
    const drawn = CardMovement.drawCard(); // drawCard가 deck_store -> hand_store로 이동시킨다고 가정
    if (!drawn) {
      console.error(`플레이어 ${i + 1}번째 카드 드로우 실패`);
      // 드로우 실패 시 처리 (예: 게임 시작 불가)
      // return false;
      break; // 일단 루프 중단
    }
  }

  // --- 2. 상대방 초기 설정 (새로 추가된 로직) ---

  // 상대방 덱 복사 (원본 배열 수정을 피하기 위해)
  let currentOpponentDeck = [...opponentDeck];

  // 상대방 덱 유효성 검사 (최소 카드 수 등)
  if (currentOpponentDeck.length < 4) {
    // 첫 엔트리 1장 + 핸드 3장 = 최소 4장 필요 가정
    console.error("상대방 덱의 카드 수가 부족합니다.");
    return false;
  }

  // 상대방 첫 엔트리 카드 찾기
  const opponentFirstEntryIndex = currentOpponentDeck.findIndex((instance) => {
    const definition = getCardDefinition(instance.serial_number);
    return definition?.is_first_entry ?? false; // ★ DB 조회 후 확인!
  });
  if (opponentFirstEntryIndex !== -1) {
    const [opponentFirstEntryInstance] = currentOpponentDeck.splice(
      opponentFirstEntryIndex,
      1
    );
    opponentFirstEntryInstance.zone = "entry";
    opponent_entry_store.update((entries) => [
      ...entries,
      opponentFirstEntryInstance,
    ]); // ★ 인스턴스 전달
    // 로그 수정 필요 (아래 참고)
  } else {
    console.warn("상대방 덱에 첫 엔트리 정의된 카드가 없습니다.");
  }

  // 상대방 초기 핸드 드로우 (3장)
  console.log("상대방 초기 핸드 드로우 (3장)");
  const opponentInitialHand: CardInstance[] = [];
  for (let i = 0; i < 3; i++) {
    if (currentOpponentDeck.length === 0) {
      console.error("상대방 핸드 드로우 중 덱 부족");
      break;
    }
    // 덱 맨 위 카드 가져오기 (원본 배열 수정)
    const drawnCard = currentOpponentDeck.pop();
    if (drawnCard) {
      drawnCard.zone = "hand"; // 카드 상태 업데이트
      opponentInitialHand.push(drawnCard);
    }
  }
  // 상대방 핸드 스토어에 추가 (CardMovement 수정 대신 임시 방편)
  opponent_hand_store.set(opponentInitialHand);
  console.log(`상대방 초기 핸드 ${opponentInitialHand.length}장 설정 완료`);

  // 참고: 사용된 opponentDeck (currentOpponentDeck)의 남은 카드는 이제 상대방의 '덱' 역할을 해야 함.
  // 이 남은 카드들을 관리할 방법이 필요 (예: opponent_deck_store를 만들고 여기에 set 하거나, GameManager 내부에 변수로 저장)
  // 여기서는 일단 남은 카드는 currentOpponentDeck 배열에 남아있음.

  opponent_deck_store.set(currentOpponentDeck);

  // --- 3. 게임 상태 업데이트 ---
  game_playing.set(true); // 게임 진행 상태로 변경
  nextPhase(); // 첫 페이즈 시작

  console.log("게임 시작 준비 완료!");
  return true; // 게임 시작 성공
}

export function nextPhase() {
  current_phase.update((phase) => phase + 1);
}

export async function automaticPhaseProgress() {
  let phase = get(current_phase);
  if (phase === GAME_PHASE.END) {
    nextPhase();
    console.log("End Phase");
  } else if (phase === GAME_PHASE.DRAW) {
    nextPhase();
    await CardMovement.drawCard();
    console.log("Draw Phase");
  } else if (phase === GAME_PHASE.ENERGY) {
    nextPhase();
    // TODO: Implement energy phase
    console.log("Energy Phase");
  } else if (phase === GAME_PHASE.MAIN) {
    nextPhase();
    // TODO: Implement main phase
    console.log("Main Phase");
  }
}

// 저장된 덱 목록을 가져오는 store
export const saved_decks_store = writable<
  { name: string; cards: CardInstance[]; createdAt: string }[]
>([]);

// 현재 선택된 덱 ID를 저장하는 store
export const selected_deck_id = writable<number>(-1);

// 저장된 덱 불러오기
export function loadSavedDecks() {
  const loadedDecks = JSON.parse(localStorage.getItem("savedDecks") || "[]");
  saved_decks_store.set(loadedDecks);
  return loadedDecks;
}

/*
// 특정 덱 불러와서 게임에 적용하기
export function loadDeckToGame(deckIndex: number) {
  const decks = get(saved_decks_store);

  if (deckIndex < 0 || deckIndex >= decks.length) {
    console.error("Invalid deck index");
    return false;
  }

  const selectedDeck = decks[deckIndex];

  // 기존 덱 초기화
  deck_store.set([]);

  // 선택한 덱의 카드들을 게임 덱에 추가
  const deckCards = selectedDeck.cards.map((cardData) => {
    // 게임에 필요한 카드 프로퍼티 설정
    return createCard({
      ...cardData,
      zone: "deck",
      state: {
        is_animating: false,
        is_fading_in: false,
        is_fading_out: false,
        is_flipped: false,
        is_selected: false,
        is_tapped: false,
      },
    });
  });

  // 덱 섞기
  const shuffledDeck = shuffleDeck(deckCards);

  // 덱에 첫번째 엔트리 카드 설정 (첫 멤버 카드를 찾아서 설정)
  const firstMemberCard = shuffledDeck.find(
    (card) => card.subtype === "member"
  );
  if (firstMemberCard) {
    firstMemberCard.is_first_entry = true;
  }

  // 덱 업데이트
  deck_store.set(shuffledDeck);
  selected_deck_id.set(deckIndex);

  return true;
}
  

// 덱 섞기 함수
function shuffleDeck(deck: CardInstance[]): CardInstance[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

*/
