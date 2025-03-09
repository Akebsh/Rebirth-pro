<script lang="ts">
    import { entry_store } from "$lib/engine/CardStore";
    import Card from "./Card.svelte";
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
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        margin-top: 10px;
    }
</style>

<div class="entry">
    <h3>Entry</h3>
    <div class="entry-container">
        {#if $entry_store.length > 0}
            {#each $entry_store as card }
                <Card card_data={card}></Card>
            {/each}
        {/if}
    </div>
</div>