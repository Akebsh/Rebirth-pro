import { writable } from "svelte/store";
import type { Socket } from "socket.io-client";

// Socket 인스턴스 또는 null을 저장할 수 있는 writable 스토어 생성
// 초기값은 null (연결 전)
export const socket = writable<Socket | null>(null);
