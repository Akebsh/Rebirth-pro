import { writable } from "svelte/store";
import { type Card } from "./CardManager";

export const deck_store = writable<Card[]>([]);
export const hand_store = writable<Card[]>([]);
export const entry_store = writable<Card[]>([]);

export const selected_card = writable<Card | null>(null);