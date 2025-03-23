import { writable, get } from "svelte/store";
import { deck_store, hand_store, entry_store } from "./CardStore";
import { CardMovement, createCard, type Card } from "./CardManager";

export enum GAME_PHASE {
  END = 0,
  DRAW = 1,
  ENERGY = 2,
  MAIN = 3,
}

export let game_playing = writable(false);
export let current_phase = writable(GAME_PHASE.END);

export function gameSetting() {
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
}
// gameStart 함수를 수정하여 선택된 덱이 없으면 경고 메시지 표시
export function gameStart() {
  // 덱이 비어있는지 확인
  if (get(deck_store).length === 0) {
    console.error("덱을 먼저 선택해주세요!");
    return false;
  }

  let first_entry = get(deck_store).find((card) => card.is_first_entry);
  if (first_entry) {
    CardMovement.moveCard(first_entry, "deck", "entry");
  } else {
    console.log("Error: No first entry card found");
  }

  for (let i = 0; i < 3; i++) {
    CardMovement.drawCard();
  }

  game_playing.set(true);
  nextPhase();
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
  { name: string; cards: Card[]; createdAt: string }[]
>([]);

// 현재 선택된 덱 ID를 저장하는 store
export const selected_deck_id = writable<number>(-1);

// 저장된 덱 불러오기
export function loadSavedDecks() {
  const loadedDecks = JSON.parse(localStorage.getItem("savedDecks") || "[]");
  saved_decks_store.set(loadedDecks);
  return loadedDecks;
}

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
function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
