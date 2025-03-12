<script lang="ts">
    import { partner_store } from "$lib/engine/CardStore";
    import Card from "./Card.svelte";
</script>

<style>
    .partner {
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

<div class="partner">
    <h3>Partner</h3>
    <div class="partner-container">
        {#if $partner_store.length > 0}
            {#each $partner_store as card }
                <Card card_data={card}></Card>
            {/each}
        {/if}
    </div>
</div>
