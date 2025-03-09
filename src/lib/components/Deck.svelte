<script lang="ts">
    import { CardMovement } from "$lib/engine/CardManager";
    import { deck_store } from "$lib/engine/CardStore";
    import { get } from "svelte/store";

    // 덱 클릭 시 실행될 함수
    function handleDeckClick() {
        CardMovement.drawCard();
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
<div class="deck" on:click={handleDeckClick}>
    <div class="deck-counter">{$deck_store.length}</div>
</div>