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
export function gameStart(opponentFullDeckShuffled: CardInstance[]): boolean {
  // ★ 53장 덱 받음

  // === 초기 덱 유효성 검사 ===
  const playerFullDeck = get(deck_store);
  if (playerFullDeck.length !== 53) {
    console.error(`플레이어 덱 매수 오류: ${playerFullDeck.length} / 53`);
    // TODO: 게임 시작 불가 처리
    return false;
  }
  if (opponentFullDeckShuffled.length !== 53) {
    console.error(
      `상대방 덱 매수 오류: ${opponentFullDeckShuffled.length} / 53`
    );
    // TODO: 게임 시작 불가 처리
    return false;
  }

  // === 플레이어 설정 ===
  let playerCurrentDeck = [...playerFullDeck]; // 작업용 복사본
  const playerPartners: CardInstance[] = [];
  const playerMainDeck: CardInstance[] = [];

  // 1. 플레이어 파트너 3장 분리
  playerCurrentDeck.forEach((instance) => {
    const def = getCardDefinition(instance.serial_number);
    // ★★★ subtype이 아니라 type으로 체크! ★★★
    if (def?.type === "partner" && playerPartners.length < 3) {
      playerPartners.push(instance);
    } else {
      playerMainDeck.push(instance); // 나머지는 메인 덱 후보
    }
  });

  if (playerPartners.length !== 3) {
    console.error(`플레이어 덱 파트너 수 오류: ${playerPartners.length} / 3`);
    // TODO: 게임 시작 불가 처리
    return false;
  }
  if (playerMainDeck.length !== 50) {
    // 53 - 3 = 50 확인
    console.error(`플레이어 메인 덱 매수 오류: ${playerMainDeck.length} / 50`);
    return false;
  }
  console.log(
    "플레이어 파트너 분리 완료:",
    playerPartners.map((p) => p.serial_number)
  );

  // 2. 플레이어 메인 덱에서 3장 드로우
  const playerDraw: CardInstance[] = [];
  for (let i = 0; i < 3; i++) {
    playerDraw.push(playerMainDeck.pop()!); // pop으로 맨 뒤(위) 카드 가져옴
  }
  console.log("플레이어 3장 드로우 완료");

  // 3. 플레이어 시작 핸드 설정 (파트너 3 + 드로우 3 = 6장)
  playerPartners.forEach((p) => (p.zone = "hand"));
  playerDraw.forEach((d) => (d.zone = "hand"));
  hand_store.set([...playerPartners, ...playerDraw]);
  console.log("플레이어 시작 핸드 설정 완료:", get(hand_store).length);

  // 4. 플레이어 첫 엔트리 배치 (남은 메인 덱 47장에서 찾기)
  const playerFirstEntryIndex = playerMainDeck.findIndex((instance) => {
    const def = getCardDefinition(instance.serial_number);
    return def?.is_first_entry ?? false;
  });
  if (playerFirstEntryIndex !== -1) {
    const [playerFirstEntry] = playerMainDeck.splice(playerFirstEntryIndex, 1);
    playerFirstEntry.zone = "entry";
    entry_store.set([playerFirstEntry]);
    const def = getCardDefinition(playerFirstEntry.serial_number);
    console.log(
      `플레이어 첫 엔트리 배치: ${def?.name ?? playerFirstEntry.serial_number}`
    );
  } else {
    console.warn("플레이어 메인 덱에 첫 엔트리 카드가 없습니다.");
    entry_store.set([]); // 엔트리 비우기
  }

  // 5. 플레이어 최종 덱 설정 (남은 46장)
  deck_store.set(playerMainDeck);
  console.log("플레이어 최종 덱 설정 완료:", get(deck_store).length);

  // === 상대방 설정 (플레이어와 동일한 로직 적용) ===
  let opponentCurrentDeck = [...opponentFullDeckShuffled]; // 작업용 복사본
  const opponentPartners: CardInstance[] = [];
  const opponentMainDeck: CardInstance[] = [];

  // 1. 상대방 파트너 3장 분리
  opponentCurrentDeck.forEach((instance) => {
    const def = getCardDefinition(instance.serial_number);
    if (def?.type === "partner" && opponentPartners.length < 3) {
      opponentPartners.push(instance);
    } else {
      opponentMainDeck.push(instance);
    }
  });
  if (opponentPartners.length !== 3) {
    /* 오류 처리 */ return false;
  }
  if (opponentMainDeck.length !== 50) {
    /* 오류 처리 */ return false;
  }
  console.log("상대방 파트너 분리 완료");

  // 2. 상대방 메인 덱에서 3장 드로우
  const opponentDraw: CardInstance[] = [];
  for (let i = 0; i < 3; i++) {
    opponentDraw.push(opponentMainDeck.pop()!);
  }
  console.log("상대방 3장 드로우 완료");

  // 3. 상대방 시작 핸드 설정 (파트너 3 + 드로우 3 = 6장, 모두 flipped)
  opponentPartners.forEach((p) => {
    p.zone = "hand";
    p.state.is_flipped = true;
  });
  opponentDraw.forEach((d) => {
    d.zone = "hand";
    d.state.is_flipped = true;
  });
  opponent_hand_store.set([...opponentPartners, ...opponentDraw]);
  console.log("상대방 시작 핸드 설정 완료:", get(opponent_hand_store).length);

  // 4. 상대방 첫 엔트리 배치 (남은 메인 덱 47장에서 찾기)
  const opponentFirstEntryIndex = opponentMainDeck.findIndex((instance) => {
    const def = getCardDefinition(instance.serial_number);
    return def?.is_first_entry ?? false;
  });
  if (opponentFirstEntryIndex !== -1) {
    const [opponentFirstEntry] = opponentMainDeck.splice(
      opponentFirstEntryIndex,
      1
    );
    opponentFirstEntry.zone = "entry";
    opponent_entry_store.set([opponentFirstEntry]);
    console.log("상대방 첫 엔트리 배치 완료");
  } else {
    console.warn("상대방 메인 덱에 첫 엔트리 카드가 없습니다.");
    opponent_entry_store.set([]);
  }

  // 5. 상대방 최종 덱 설정 (남은 46장)
  opponent_deck_store.set(opponentMainDeck);
  console.log("상대방 최종 덱 설정 완료:", get(opponent_deck_store).length);

  // --- 3. 게임 상태 업데이트 ---
  game_playing.set(true);
  nextPhase();
  console.log("게임 시작 준비 완료! (53장 덱, 시작 핸드 6장)");
  return true;
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
