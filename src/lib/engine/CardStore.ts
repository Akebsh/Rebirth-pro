import { writable } from "svelte/store";
import type { CardInstance } from "$lib/engine/CardManager";

export const deck_store = writable<CardInstance[]>([]);
export const opponent_deck_store = writable<CardInstance[]>([]);
export const hand_store = writable<CardInstance[]>([]);
export const opponent_hand_store = writable<CardInstance[]>([]);
export const entry_store = writable<CardInstance[]>([]);
export const opponent_entry_store = writable<CardInstance[]>([]);
export const member_store = writable<CardInstance[]>([]);
export const opponent_member_store = writable<CardInstance[]>([]);
export const waiting_store = writable<CardInstance[]>([]);
export const opponent_waiting_store = writable<CardInstance[]>([]);
export const retire_store = writable<CardInstance[]>([]);
export const opponent_retire_store = writable<CardInstance[]>([]);
export const rebirth_store = writable<CardInstance[]>([]);
export const opponent_rebirth_store = writable<CardInstance[]>([]);
export const energy_store = writable<CardInstance[]>([]);
export const opponent_energy_store = writable<CardInstance[]>([]);
export const partner_store = writable<CardInstance[]>([]);
export const opponent_partner_store = writable<CardInstance[]>([]);

export const selected_card = writable<CardInstance | null>(null);
