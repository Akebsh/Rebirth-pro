import { writable, get } from "svelte/store";
import { deck_store, hand_store, entry_store } from "./CardStore";
import { CardMovement, createCard } from "./CardManager";

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
export function gameStart() {
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
