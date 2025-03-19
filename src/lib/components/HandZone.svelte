<script lang="ts">
    import { hand_store } from "$lib/engine/CardStore";
    import Card from "./Card.svelte";
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
    <h3>Hand</h3>
    <div class="hand-container">
        {#if $hand_store.length > 0}
            {#each $hand_store as card }
                <Card card_data={card}></Card>
            {/each}
        {/if}
    </div>
</div>