<script lang="ts">
    import { member_store } from "$lib/engine/CardStore";
    import Card from "./Card.svelte";
</script>

<style>
    .member {
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

    .member-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 3개의 칸으로 정렬 */
    gap: 10px;
    margin-top: 10px;
    justify-items: center;
    align-items: center;
}
</style>

<div class="member">
    <h3>Member</h3>
    <div class="member-container">
        {#if $member_store.length > 0}
            {#each $member_store as card }
                <Card card_data={card}></Card>
            {/each}
        {/if}
    </div>
</div>