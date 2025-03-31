import { get } from "svelte/store";
import {
  deck_store,
  hand_store,
  entry_store,
  member_store,
  waiting_store,
  energy_store,
  partner_store,
  rebirth_store,
  retire_store,
} from "./CardStore";

export interface CardInstance {
  id: string; // 고유 인스턴스 ID (UUID, 필수!)
  serial_number: string; // 어떤 종류의 카드인지 식별
  zone: string; // 카드의 현재 위치 (기존 Zone 타입 사용)
  state: {
    // 카드의 현재 상태
    is_animating: boolean;
    is_fading_in: boolean;
    is_fading_out: boolean;
    is_flipped: boolean; // 앞면/뒷면
    is_selected: boolean; // 선택되었는지
    is_tapped: boolean; // 탭(회전)되었는지
  };
}

/* export function createCard(data: Partial<Card>): Card {
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
      is_tapped: false,
      ...data.state,
    },
  };
} */

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
    card: CardInstance,
    from_zone: string,
    target_zone: string,
    position: "top" | "bottom" = "bottom" // 기본값: bottom
  ): boolean {
    const current_deck = get(deck_store);
    const current_hand = get(hand_store);
    const current_entry = get(entry_store);
    const current_member = get(member_store);
    const current_waiting = get(waiting_store);
    const current_partner = get(partner_store);
    const current_rebirth = get(rebirth_store);
    const current_retire = get(retire_store);

    if (target_zone === "entry" && current_entry.length > 0) {
      return false;
    }

    // 각 멤버 슬롯에 대한 체크
    if (
      target_zone === "member1" &&
      current_member.some((c) => c.zone === "member1")
    ) {
      return false;
    }
    if (
      target_zone === "member2" &&
      current_member.some((c) => c.zone === "member2")
    ) {
      return false;
    }
    if (
      target_zone === "member3" &&
      current_member.some((c) => c.zone === "member3")
    ) {
      return false;
    }

    if (target_zone === "partner" && current_partner.length >= 3) {
      return false;
    }

    if (target_zone === "re-birth" && current_rebirth.length > 0) {
      return false;
    }

    // 기존 위치에서 카드 제거
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
      case "waiting":
        waiting_store.set(current_waiting.filter((c) => c !== card));
        break;
      case "member1":
      case "member2":
      case "member3":
        member_store.set(current_member.filter((c) => c !== card));
        break;
      case "partner":
        partner_store.update((cards) => cards.filter((c) => c !== card));
        break;
      case "energy":
        energy_store.update((cards) => cards.filter((c) => c !== card));
        break;
      case "re-birth":
        rebirth_store.update((cards) => cards.filter((c) => c !== card));
        break;
      case "retire":
        retire_store.update((cards) => cards.filter((c) => c !== card));
        break;
      default:
        break;
    }

    // 목표 위치로 카드 이동 (덱 위 or 덱 아래) 수정
    switch (target_zone) {
      case "deck":
        card.zone = "deck";
        deck_store.set(
          position === "top" ? [...current_deck, card] : [card, ...current_deck]
        );
        break;
      case "hand":
        card.zone = "hand";
        hand_store.set([...current_hand, card]);
        break;
      case "entry":
        card.zone = "entry";
        entry_store.set([...current_entry, card]);
        break;
      case "waiting":
        card.zone = "waiting";
        waiting_store.set([...current_waiting, card]);
        break;
      case "member1":
        card.zone = "member1";
        member_store.set([...current_member, card]);
        break;
      case "member2":
        card.zone = "member2";
        member_store.set([...current_member, card]);
        break;
      case "member3":
        card.zone = "member3";
        member_store.set([...current_member, card]);
        break;
      case "energy":
        card.zone = "energy";
        energy_store.update((cards) => [...cards, card]);
        break;
      case "partner":
        card.zone = "partner";
        partner_store.update((cards) => [...cards, card]);
        break;
      case "re-birth":
        card.zone = "re-birth";
        card.state.is_tapped = true;
        rebirth_store.update((cards) => [...cards, card]);
        break;
      case "retire":
        card.zone = "retire";
        card.state.is_tapped = true;
        retire_store.update((cards) => [...cards, card]);
        break;
      default:
        break;
    }

    card.state.is_selected = false;
    return true;
  }
}
