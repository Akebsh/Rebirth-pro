<script lang="ts">
    import { retire_store } from "$lib/engine/CardStore";
    import Card from "./Card.svelte";
</script>

<style>
    .retire {
        margin: 20px;
        padding: 15px;
        border-radius: 10px;
        border: 2px solid #444;
        background: linear-gradient(135deg, #222, #444);
        color: #fff;
        width: auto;
        min-width: 200px;
        max-width: 100%;
        height: 90vh; 
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        text-align: center;
        overflow-x: auto;
        white-space: nowrap;
        flex-direction: column; /* 🔹 내부 요소들을 세로 정렬 */
        justify-content: flex-start; /* 🔹 내부 요소를 위에서부터 배치 */
    }

    .retire h3 {
    margin-bottom: 50px; /* 제목 아래 여백 추가 */
}


    .retire-container {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        justify-content: center;
        gap: 0px;
        padding: 10px;
        padding-top: 80px; 
        overflow-y: auto; /* 🔹 세로 스크롤 가능하도록 설정 */
        overflow-x: hidden; /* 🔹 가로 스크롤 제거 */
        margin-top: 10px;
    }


    .retire-container :global(.card) {
    margin-top: -90px; /* 카드 간격 조절 */
    transition: transform 0.2s ease-in-out;
}
</style>

<div class="retire">
    <h3>Retire</h3>
    <div class="retire-container">
        {#if $retire_store.length > 0}
            {#each $retire_store as card }
                <Card card_data={card}></Card>
            {/each}
        {/if}
    </div>
</div>
