<script lang="ts">
    import { CardMovement } from "$lib/engine/CardManager";
    import { deck_store } from "$lib/engine/CardStore";

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
<div class="deck">
    <div class="deck-counter">{$deck_store.length}</div>
</div>