import { writable } from "svelte/store";
import { type Card } from "./CardManager";

export const deck_store = writable<Card[]>([]);
export const hand_store = writable<Card[]>([]);
export const entry_store = writable<Card[]>([]);
export const member_store = writable<Card[]>([]);
export const waiting_store = writable<Card[]>([]);
export const retire_store = writable<Card[]>([]);
export const rebirth_store = writable<Card[]>([]);
export const energy_store = writable<Card[]>([]);
export const partner_store = writable<Card[]>([]);

export const selected_card = writable<Card | null>(null);
