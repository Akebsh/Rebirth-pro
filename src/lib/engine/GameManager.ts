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

interface DeckEntry {
  serial_number: string;
  count: number;
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
export function gameStart(
  opponentFullDeckShuffled: CardInstance[], // ★ 인자 이름 명확하게
  playerFirstEntrySerial: string,
  opponentFirstEntrySerial: string
  // partnerSerials 인자는 이제 사용 안 함 (53장 방식이므로)
): boolean {
  // === 플레이어 설정 ===
  const playerFullDeck = get(deck_store);
  if (playerFullDeck.length !== 53) {
    console.error("플레이어 덱 53장 아님!");
    return false;
  }

  // 1. 파트너 찾기 (filter 사용)
  const playerPartners: CardInstance[] = playerFullDeck.filter((instance) => {
    const def = getCardDefinition(instance.serial_number);
    return def?.type === "partner";
  });
  if (playerPartners.length !== 3) {
    console.error("플레이어 파트너 3장 아님!");
    return false;
  }
  console.log("Player partners found:", playerPartners.length);

  // 2. 메인 덱 만들기 (filter 사용, ★★★ let으로 선언! ★★★)
  let playerMainDeck: CardInstance[] = playerFullDeck.filter((instance) => {
    const def = getCardDefinition(instance.serial_number);
    return def?.type !== "partner"; // 파트너가 아닌 카드만 포함
  });
  if (playerMainDeck.length !== 50) {
    console.error("플레이어 메인 덱 50장 아님!");
    return false;
  }
  console.log("Player main deck created:", playerMainDeck.length);

  // 3. 핸드 드로우 (playerMainDeck이 let이므로 pop 가능!)
  const playerDraw: CardInstance[] = [];
  for (let i = 0; i < 3; i++) {
    playerDraw.push(playerMainDeck.pop()!); // pop으로 수정 가능
  }
  console.log("Player 3 cards drawn");

  // 4. 시작 핸드 설정 (파트너 3 + 드로우 3)
  playerPartners.forEach((p) => (p.zone = "hand"));
  playerDraw.forEach((d) => (d.zone = "hand"));
  hand_store.set([...playerPartners, ...playerDraw]);
  console.log("Player starting hand set:", get(hand_store).length);

  // 5. 첫 엔트리 배치 (남은 메인 덱 47장에서 찾고 splice로 수정 가능!)
  const playerFirstEntryIndex = playerMainDeck.findIndex(
    (instance) => instance.serial_number === playerFirstEntrySerial
  );
  if (playerFirstEntryIndex !== -1) {
    const [playerFirstEntry] = playerMainDeck.splice(playerFirstEntryIndex, 1); // splice로 수정 가능
    playerFirstEntry.zone = "entry";
    entry_store.set([playerFirstEntry]);
    // ... 로그 ...
    console.log("Player first entry set.");
  } else {
    console.error(`지정된 플레이어 첫 엔트리(${playerFirstEntrySerial}) 없음!`);
    entry_store.set([]);
    return false;
  }

  // 6. 최종 덱 설정 (남은 46장)
  deck_store.set(playerMainDeck);
  console.log("Player final deck set:", get(deck_store).length);

  // === 상대방 설정 (플레이어와 동일하게, ★★★ opponentMainDeck도 let으로 선언! ★★★) ===
  if (opponentFullDeckShuffled.length !== 53) {
    /* ...오류 처리... */ return false;
  }

  const opponentPartners: CardInstance[] = opponentFullDeckShuffled.filter(
    (instance) => {
      const def = getCardDefinition(instance.serial_number); // 플레이어 로직 참고!
      return def?.type === "partner";
    }
  );
  if (opponentPartners.length !== 3) {
    /* ...오류 처리... */ return false;
  }

  // ★★★ let으로 선언! ★★★
  let opponentMainDeck: CardInstance[] = opponentFullDeckShuffled.filter(
    (instance) => {
      const def = getCardDefinition(instance.serial_number); // 플레이어 로직 참고!
      return def?.type !== "partner";
    }
  );
  if (opponentMainDeck.length !== 50) {
    /* ...오류 처리... */ return false;
  }
  console.log("Opponent main deck created:", opponentMainDeck.length);

  const opponentDraw: CardInstance[] = [];
  for (let i = 0; i < 3; i++) {
    opponentDraw.push(opponentMainDeck.pop()!); // OK
  }
  console.log("Opponent 3 cards drawn");

  // ... (상대방 핸드 설정, flipped=true 잊지 말 것!) ...
  opponentPartners.forEach((p) => {
    p.zone = "hand";
    p.state.is_flipped = true;
  });
  opponentDraw.forEach((d) => {
    d.zone = "hand";
    d.state.is_flipped = true;
  });
  opponent_hand_store.set([...opponentPartners, ...opponentDraw]);
  console.log("Opponent starting hand set:", get(opponent_hand_store).length);

  // ... (상대방 첫 엔트리 배치, ★ opponentMainDeck에서 splice 사용!) ...
  const opponentFirstEntryIndex = opponentMainDeck.findIndex(
    (instance) => instance.serial_number === opponentFirstEntrySerial
  );
  if (opponentFirstEntryIndex !== -1) {
    const [opponentFirstEntry] = opponentMainDeck.splice(
      opponentFirstEntryIndex,
      1
    ); // OK
    opponentFirstEntry.zone = "entry";
    opponent_entry_store.set([opponentFirstEntry]);
    console.log("Opponent first entry set.");
  } else {
    console.error(`지정된 상대방 첫 엔트리(${opponentFirstEntrySerial}) 없음!`);
    opponent_entry_store.set([]);
    return false;
  }

  // ... (상대방 최종 덱 설정) ...
  opponent_deck_store.set(opponentMainDeck);
  console.log("Opponent final deck set:", get(opponent_deck_store).length);

  // --- 3. 게임 상태 업데이트 ---
  game_playing.set(true);
  nextPhase();
  console.log("게임 시작 준비 완료!");
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
  { name: string; cards: DeckEntry[]; createdAt: string }[] // ★ 타입 수정!
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
