import { writable } from "svelte/store";
import { type Card } from "./CardManager";

export const deck_store = writable<Card[]>([]);
export const opponent_deck_store = writable<Card[]>([]);
export const hand_store = writable<Card[]>([]);
export const opponent_hand_store = writable<Card[]>([]);
export const entry_store = writable<Card[]>([]);
export const opponent_entry_store = writable<Card[]>([]);
export const member_store = writable<Card[]>([]);
export const opponent_member_store = writable<Card[]>([]);
export const waiting_store = writable<Card[]>([]);
export const opponent_waiting_store = writable<Card[]>([]);
export const retire_store = writable<Card[]>([]);
export const opponent_retire_store = writable<Card[]>([]);
export const rebirth_store = writable<Card[]>([]);
export const opponent_rebirth_store = writable<Card[]>([]);
export const energy_store = writable<Card[]>([]);
export const opponent_energy_store = writable<Card[]>([]);
export const partner_store = writable<Card[]>([]);
export const opponent_partner_store = writable<Card[]>([]);

export const selected_card = writable<Card | null>(null);
