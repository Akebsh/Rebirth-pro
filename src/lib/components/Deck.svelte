<script lang="ts">
    import { CardMovement } from "$lib/engine/CardManager";
    // ✅ 플레이어 및 상대방 덱 스토어 import (CardStore.ts에 opponent_deck_store 정의 필요)
    import { deck_store, opponent_deck_store } from "$lib/engine/CardStore";
    import { get } from "svelte/store";
    import type { Card } from '../../routes/game/types'; // 타입 경로 확인
  
    // ✅ player prop (기존에 추가됨)
    export let player: 'player' | 'opponent' | undefined = 'player';
  
    // ✅ player 값에 따라 사용할 덱 스토어 선택
    // 참고: opponent_deck_store는 gameStart 함수에서 상대방 덱의 남은 카드를 설정해야 함
    $: zoneStore = player === 'opponent' ? opponent_deck_store : deck_store;
  
    // ✅ 선택된 스토어의 카드 개수 표시
    $: deckCount = $zoneStore.length;
  
    // ✅ 플레이어 덱 클릭 시에만 카드 드로우 실행
    function handleDeckClick() {
        if (player === 'player' || player === undefined) { // 플레이어 덱일 경우에만
            CardMovement.drawCard();
        } else {
            // 상대방 덱 클릭 시 동작 (예: 콘솔 로그 또는 아무것도 안 함)
            console.log("상대방 덱은 클릭해도 드로우되지 않습니다.");
        }
    }
  </script>

<style>
    .deck {
        margin: 20px;
        width: 126px;
        height: 176px;
        border: 2px solid #42d86f;
        border-radius: 9px;
        perspective: 1000px;
        background-color: #4f4fce;
        cursor: pointer; /* 클릭 가능하도록 커서 변경 */
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
    }

    .deck-counter {
        position: absolute;
        top: 50%;
        right: 50%;
        transform: translate(100%, -50%);
        background-color: #fff;
        width: 40px;
        height: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        border: 2px solid #000;
    }
</style>

<div>
    <h3>Deck</h3>
</div>

<!-- 덱 클릭 시 handleDeckClick 실행 -->
<div class="deck" class:opponent-deck={player === 'opponent'} on:click={handleDeckClick}>
    <span>DECK</span>
    <div class="deck-counter">{deckCount}</div>
</div>