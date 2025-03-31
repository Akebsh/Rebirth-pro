<script lang="ts">
    // ✅ 상대방 파트너 스토어 import (CardStore.ts에 정의 필요)
    import { partner_store, opponent_partner_store } from "$lib/engine/CardStore";
    import Card from "./Card.svelte";
    import type { CardInstance } from '$lib/engine/CardManager'; // 또는 다른 경로
    import { getCardDefinition, type CardDefinition } from '$lib/data/cardDatabase';

    export let gridArea: string | undefined = undefined;
    // ✅ player prop 선언
    export let player: 'player' | 'opponent' | undefined = 'player';
  
    // ✅ player 값에 따라 사용할 스토어 선택
    $: zoneStore = player === 'opponent' ? opponent_partner_store : partner_store;
  
    // Partner는 보통 하나만 존재하므로 첫 번째 카드를 사용
    $: partner_card = $zoneStore[0] as CardInstance | undefined;
  
  </script>
  

<style>
    .partner {
       
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

    .partner-container {
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

<div class="partner partner-zone-component"style={gridArea ? `grid-area: ${gridArea};` : ''}> 
    <h3>{player === 'opponent' ? 'Opponent Partner' : 'Partner'}</h3>
    <div class="partner-container">
        <div class="partner-slot">
            {#if partner_card}
                <Card cardInstance={partner_card}></Card>
            {/if}
        </div>
    </div>
  </div>
