<script lang="ts">
    // ✅ 상대방 핸드 스토어 import (CardStore.ts에 정의 필요)
    import { hand_store, opponent_hand_store } from "$lib/engine/CardStore";
    import Card from "./Card.svelte";
    import type { Card as CardType } from '../../routes/game/types'; // 타입 경로 확인
  
    // ✅ player prop 선언
    export let player: 'player' | 'opponent' | undefined = 'player';
  
    // ✅ player 값에 따라 사용할 스토어 선택
    $: zoneStore = player === 'opponent' ? opponent_hand_store : hand_store;
  
    // $: cards = $zoneStore; // 스토어 구독 (타입 명시 위해 아래처럼)
    $: cards = $zoneStore as CardType[];
  
  </script>


<style>
 .hand {
    margin: -50px 20px 20px 20px; /* 위쪽으로 50px 튀어나오게 설정 */
    padding: 20px;
    border-radius: 15px;
    border: 3px solid #333;
    background: linear-gradient(135deg, #111, #333);
    color: #fff;
    width: 100%;
    min-width: 500px;
    max-width: 100%;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
    text-align: center;
    overflow: visible; /* 내용이 넘칠 수 있도록 설정 */
    position: relative;
}

.hand-container {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    gap: 20px;
    padding: 15px;
    overflow: visible; /* 카드들이 더 많이 보이도록 설정 */
    min-height: 100px; /* 카드가 절반 이상 보이게 조정 */
}

</style>

<div class="hand">
  <h3>{player === 'opponent' ? 'Opponent Hand' : 'Hand'} ({cards.length})</h3>
  <div class="hand-container">
    {#if cards.length > 0}
       {#each cards as card (card.serial_number)}
          {#if player === 'opponent'}
             <Card card_data={card}></Card>
          {:else}
             <Card card_data={card}></Card>
          {/if}
       {/each}
    {/if}
  </div>
</div>