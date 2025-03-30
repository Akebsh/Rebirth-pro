<script lang="ts">
    // ✅ 상대방 스토어 import (CardStore.ts에 정의 필요)
    import { waiting_store, opponent_waiting_store } from "$lib/engine/CardStore";
    import Card from "./Card.svelte";
    import type { Card as CardType } from '../../routes/game/types'; // 타입 경로 확인
    import { get } from "svelte/store";
  
    // ✅ player prop 선언
    export let player: 'player' | 'opponent' | undefined = 'player';
  
    // ✅ player 값에 따라 사용할 스토어 선택
    $: zoneStore = player === 'opponent' ? opponent_waiting_store : waiting_store;
  
    // 팝업 관련 상태는 그대로 유지
    let showPopup = false;
    let popupX = 0;
    let popupY = 0;
  
    // Context 메뉴 핸들러 (팝업 여는 로직)
    function handleContextMenu(event: MouseEvent) {
        // 카드가 있을 때만 팝업 열기
        if (get(zoneStore).length > 0) {
            event.preventDefault();
            showPopup = true;
            popupX = event.clientX;
            popupY = event.clientY;
        }
    }
  
    // 팝업 닫기 함수
    function closePopup() {
        showPopup = false;
    }
  
    $: cards = $zoneStore as CardType[]; // 타입 명시
  </script>

<style>
    .waiting {
        margin: 20px;
        padding: 15px;
        border-radius: 10px;
        border: 2px solid #444;
        background: linear-gradient(135deg, #222, #444);
        color: #fff;
        width: 200px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        text-align: center;
    }

    .waiting-container {
        display: flex;
        justify-content: center;
        margin-top: 10px;
    }

    .waiting-slot {
        width: 126px;
        height: 176px;
        border: 2px dashed #666;
        border-radius: 9px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .waiting-slot:empty {
        background: rgba(255, 255, 255, 0.1);
    }

    .cards-stack {
        position: relative;
        width: 126px;
        height: 176px;
    }

    .card-wrapper {
        position: absolute;
        width: 100%;
        transition: transform 0.3s ease;
    }

    .popup {
        position: fixed;
        background: #1a1a1a;
        border: 2px solid #666;
        border-radius: 10px;
        padding: 20px;
        z-index: 1000;
        max-height: 600px;
        width: 500px;
        overflow-y: scroll;
    }

    .popup-content {
        display: grid;
        grid-template-columns: repeat(3, 126px);
        gap: 20px;
        justify-content: center;
        padding-right: 20px;
        margin-right: 5px;
    }

    .popup-card {
        position: relative;
    }

    .close-button {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        z-index: 1001;
    }

    .close-button:hover {
        background: #ff6666;
    }

    .popup::-webkit-scrollbar {
        width: 16px;
        background: #2a2a2a;
    }

    .popup::-webkit-scrollbar-track {
        background: #2a2a2a;
        border-radius: 7px;
    }

    .popup::-webkit-scrollbar-thumb {
        background: #666;
        border-radius: 8px;
        border: 3px solid #2a2a2a;
    }

    .popup::-webkit-scrollbar-thumb:hover {
        background: #888;
    }
</style>

<div class="waiting" on:contextmenu={handleContextMenu}>
    <h3>{player === 'opponent' ? 'Opponent Waiting' : 'Waiting'} ({cards.length})</h3>
    <div class="waiting-container">
        <div class="cards-stack">
            {#if cards.length > 0}
                {#each cards.slice(-5) as card, i (card.serial_number)}
                    <div class="card-wrapper" style="transform: translateY({i * 1}px) translateX({i * 1}px); z-index: {i};">
                        <Card card_data={card} />
                    </div>
                {/each}
                {:else}
                <div class="waiting-slot" /> {/if}
        </div>
    </div>
  </div>
  
  {#if showPopup}
      <div class="popup"
           style="left: {popupX}px; top: {popupY}px">
          <button class="close-button" on:click|stopPropagation={closePopup}>×</button>
          <div class="popup-content">
              {#each cards as card (card.serial_number)}
                  <div class="popup-card">
                      <Card card_data={card} />
                  </div>
              {/each}
          </div>
      </div>
      {/if}
