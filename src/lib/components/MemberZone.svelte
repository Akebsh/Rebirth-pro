<script lang="ts">
    import { member_store } from "$lib/engine/CardStore";
    import Card from "./Card.svelte";

    $: member1 = $member_store.find(card => card.zone === "member1");
    $: member2 = $member_store.find(card => card.zone === "member2");
    $: member3 = $member_store.find(card => card.zone === "member3");
</script>

<style>
    .member {
        margin: 20px;
        padding: 15px;
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

<div class="member">
    <h3>Member</h3>
    <div class="member-container">
        <div class="member-slot">
            {#if member1}
                <Card card_data={member1} />
            {/if}
        </div>
        <div class="member-slot">
            {#if member2}
                <Card card_data={member2} />
            {/if}
        </div>
        <div class="member-slot">
            {#if member3}
                <Card card_data={member3} />
            {/if}
        </div>
    </div>
</div>