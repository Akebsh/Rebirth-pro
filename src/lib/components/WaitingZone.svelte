<script lang="ts">
    import { waiting_store } from "$lib/engine/CardStore";
    import Card from "./Card.svelte";

    let showPopup = false;
    let popupX = 0;
    let popupY = 0;

    function handleContextMenu(event: MouseEvent) {
        event.preventDefault();
        showPopup = true;
        popupX = event.clientX;
        popupY = event.clientY;
    }

    function closePopup() {
        showPopup = false;
    }
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
    <h3>Waiting ({$waiting_store.length})</h3>
    <div class="waiting-container">
        <div class="cards-stack">
            {#if $waiting_store.length > 0}
                {#each $waiting_store as card, i}
                    <div class="card-wrapper" style="transform: translateY({i * -1}px) translateX({i * 0.5}px)">
                        <Card card_data={card} />
                    </div>
                {/each}
            {:else}
                <div class="waiting-slot" />
            {/if}
        </div>
    </div>
</div>

{#if showPopup}
    <div class="popup" 
         style="left: {popupX}px; top: {popupY}px">
        <button class="close-button" on:click={closePopup}>×</button>
        <div class="popup-content">
            {#each $waiting_store as card}
                <div class="popup-card">
                    <Card card_data={card} />
                </div>
            {/each}
        </div>
    </div>
{/if}

<svelte:window on:click={closePopup} />
