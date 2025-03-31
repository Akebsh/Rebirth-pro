<script lang="ts">
    // ✅ 상대방 에너지 스토어 import (CardStore.ts에 정의 필요)
    import { energy_store, opponent_energy_store } from "$lib/engine/CardStore";
    import Card from "./Card.svelte";
    import type { CardInstance } from '$lib/engine/CardManager'; // 또는 다른 경로
    import { getCardDefinition, type CardDefinition } from '$lib/data/cardDatabase';
  
    export let gridArea: string | undefined = undefined;
    // ✅ player prop 선언
    export let player: 'player' | 'opponent' | undefined = 'player';
  
    // ✅ player 값에 따라 사용할 스토어 선택
    $: zoneStore = player === 'opponent' ? opponent_energy_store : energy_store;
  
    $: cards = $zoneStore as CardInstance[];
  </script>

<style>
    .energy {
        
        padding: 10px;
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

    .energy-container {
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

<div class="energy energy-zone-component"style={gridArea ? `grid-area: ${gridArea};` : ''}> 
    <h3>{player === 'opponent' ? 'Opponent Energy' : 'Energy'} ({cards.length})</h3>
    <div class="energy-container">
        {#if cards.length > 0}
            {#each cards as card (card.id)}
                <Card cardInstance={card}></Card>
            {/each}
        {/if}
    </div>
  </div>
