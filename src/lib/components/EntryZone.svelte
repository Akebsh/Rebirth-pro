<script lang="ts">
    import { entry_store , opponent_entry_store} from "$lib/engine/CardStore";
    import Card from "./Card.svelte";
    import type { Card as CardType } from '../../routes/game/types';

    // ✅ player prop을 선언합니다. 기본값은 'player'
  export let player: 'player' | 'opponent' | undefined = 'player';

// ✅ player prop 값에 따라 사용할 스토어를 결정합니다.
$: zoneStore = player === 'opponent' ? opponent_entry_store : entry_store;

// ✅ 결정된 스토어에서 첫 번째 카드를 가져옵니다.
$: entry_card = $zoneStore[0] as CardType | undefined; // 타입 단언 추가







</script>

<style>
    .entry {
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

    .entry-container {
        display: flex;
        justify-content: center;
        margin-top: 10px;
    }

    .entry-slot {
        width: 126px;
        height: 176px;
        border: 2px dashed #666;
        border-radius: 9px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .entry-slot:empty {
        background: rgba(255, 255, 255, 0.1);
    }
</style>

<div class="entry">
    <h3>{player === 'opponent' ? 'Opponent Entry' : 'Entry'}</h3>
    <div class="entry-container">
        <div class="entry-slot">
            {#if entry_card}
                <Card card_data={entry_card} />
            {/if}
        </div>
    </div>
  </div>