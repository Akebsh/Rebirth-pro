<script lang="ts">
    // ✅ 상대방 멤버 스토어 import (CardStore.ts에 정의 필요)
    import { member_store, opponent_member_store } from "$lib/engine/CardStore";
    import Card from "./Card.svelte";
    import type { Card as CardType } from '$lib/engine/CardManager'; // 타입 경로 확인
    
    export let gridArea: string | undefined = undefined;
    // ✅ player prop 선언
    export let player: 'player' | 'opponent' | undefined = 'player';
  
    // ✅ player 값에 따라 사용할 스토어 선택
    $: zoneStore = player === 'opponent' ? opponent_member_store : member_store;
  
    // ✅ 선택된 스토어에서 각 멤버 위치 카드 찾기
    $: member1 = $zoneStore.find(card => card.zone === "member1") as CardType | undefined;
    $: member2 = $zoneStore.find(card => card.zone === "member2") as CardType | undefined;
    $: member3 = $zoneStore.find(card => card.zone === "member3") as CardType | undefined;
  </script>


<style>
    .member {
       
        padding: 10px;
        border-radius: 10px;
        border: 2px solid #444;
        background: linear-gradient(135deg, #222, #444);
        color: #fff;
        width: 600px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        text-align: center;
    }

    .member-container {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-top: 10px;
        justify-items: center;
        align-items: center;
    }

    .member-slot {
        width: 126px;
        height: 176px;
        border: 2px dashed #666;
        border-radius: 9px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .member-slot:empty {
        background: rgba(255, 255, 255, 0.1);
    }
</style>

<div class="member member-zone-component"style={gridArea ? `grid-area: ${gridArea};` : ''}> 
    <h3>{player === 'opponent' ? 'Opponent Member' : 'Member'}</h3>
    <div class="member-container">
        <div class="member-slot">{#if member1}<Card card_data={member1} />{/if}</div>
        <div class="member-slot">{#if member2}<Card card_data={member2} />{/if}</div>
        <div class="member-slot">{#if member3}<Card card_data={member3} />{/if}</div>
    </div>
  </div>