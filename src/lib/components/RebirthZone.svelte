<script lang="ts">
    // ✅ 상대방 스토어 import (CardStore.ts에 정의 필요)
    import { rebirth_store, opponent_rebirth_store } from "$lib/engine/CardStore";
    import Card from "./Card.svelte";
    import type { Card as CardType } from '../../routes/game/types'; // 타입 경로 확인
  
    // ✅ player prop 선언
    export let player: 'player' | 'opponent' | undefined = 'player';
  
    // ✅ player 값에 따라 사용할 스토어 선택
    $: zoneStore = player === 'opponent' ? opponent_rebirth_store : rebirth_store;
  
    $: cards = $zoneStore as CardType[];
  </script>

<style>
    .rebirth {
        margin: 20px;
        padding: 15px;
        border-radius: 10px;
        border: 2px solid #444;
        background: linear-gradient(135deg, #222, #444);
        color: #fff;
        width: auto;
        min-width: 320px;
        max-width: 100%;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        text-align: center;
        overflow-x: auto;
        white-space: nowrap;
    }

    .rebirth-container {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: center;
        gap: 10px;
        padding: 10px;
        overflow-x: auto;
        margin-top: 10px;
    }
</style>

<div class="rebirth">
    <h3>{player === 'opponent' ? 'Opponent Re-Birth' : 'Re-Birth'} ({cards.length})</h3>
    <div class="rebirth-container">
        {#if cards.length > 0}
            {#each cards as card (card.serial_number)}
                <Card card_data={card}></Card>
            {/each}
        {:else}
             <div style="width: 126px; height: 176px; border: 2px dashed #666; border-radius: 9px; display: flex; justify-content: center; align-items: center; background: rgba(255, 255, 255, 0.1);"></div>
        {/if}
    </div>
  </div>