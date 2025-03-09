import { get } from "svelte/store";
import { deck_store, hand_store, entry_store } from "./CardStore";

export interface Card {
  serial_number: string;
  name: string;
  description: string;
  image_url: string;
  atk: number;
  hp: number;
  type: "character" | "re-birth" | "partner";
  subtype: "member" | "spark" | "guard" | "cancel";
  zone:
    | "deck"
    | "hand"
    | "entry"
    | "member-1"
    | "member-2"
    | "member-3"
    | "waiting"
    | "retire"
    | "re-birth"
    | "energy"
    | "partner";
  is_first_entry: boolean;
  state: {
    is_animating: boolean;
    is_fading_in: boolean;
    is_fading_out: boolean;
    is_flipped: boolean;
    is_selected: boolean;
  };
}

export function createCard(data: Partial<Card>): Card {
  return {
    serial_number: data.serial_number ?? "",
    name: data.name ?? "",
    description: data.description ?? "",
    image_url: data.image_url ?? "",
    atk: data.atk ?? 0,
    hp: data.hp ?? 0,
    type: data.type ?? "character",
    subtype: data.subtype ?? "member",
    zone: data.zone ?? "deck",
    is_first_entry: data.is_first_entry ?? false,
    state: {
      is_animating: false,
      is_fading_in: false,
      is_fading_out: false,
      is_flipped: false,
      is_selected: false,
      ...data.state,
    },
  };
}

export class CardMovement {
  static async drawCard(): Promise<void> {
    const current_deck = get(deck_store);
    const current_hand = get(hand_store);
    if (current_deck.length === 0) return;

    const drawn_card = current_deck.pop();
    if (!drawn_card) return;

    drawn_card.zone = "hand";
    drawn_card.state.is_fading_in = false;

    hand_store.set([...current_hand, drawn_card]);
    deck_store.set(current_deck);

    await new Promise((resolve) =>
      setTimeout(() => {
        drawn_card.state.is_fading_in = true;
        hand_store.set([...get(hand_store)]);
        resolve(null);
      }, 100)
    );

    await new Promise((resolve) =>
      setTimeout(() => {
        drawn_card.state.is_fading_in = false;
        hand_store.set([...get(hand_store)]);
        resolve(null);
      }, 500)
    );
  }

  static moveCard(
    card: Card,
    from_zone: string,
    target_zone: string,
    position: "top" | "bottom" = "bottom"
  ): void {
    const current_deck = get(deck_store);
    const current_hand = get(hand_store);
    const current_entry = get(entry_store);

    switch (from_zone) {
      case "deck":
        deck_store.set(current_deck.filter((c) => c !== card));
        break;
      case "hand":
        hand_store.set(current_hand.filter((c) => c !== card));
        break;
      case "entry":
        entry_store.set(current_entry.filter((c) => c !== card));
        break;
      default:
        break;
    }

    switch (target_zone) {
      case "deck":
        card.zone = "deck";
        if (position === "top") {
          deck_store.set([card, ...current_deck]); // 맨 위에 추가
        } else {
          deck_store.set([...current_deck, card]); // 맨 밑에 추가
        }
        break;
      case "hand":
        card.zone = "hand";
        hand_store.set([...current_hand, card]);
        break;
      case "entry":
        card.zone = "entry";
        entry_store.set([...current_entry, card]);
        break;
      default:
        break;
    }
    card.state.is_selected = false;
  }
}
