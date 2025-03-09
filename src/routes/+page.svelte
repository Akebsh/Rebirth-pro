<script>
    // import Card from "$lib/components/Card.svelte";
    import Deck from "$lib/components/Deck.svelte";
    import EntryZone from "$lib/components/EntryZone.svelte";
    import HandZone from "$lib/components/HandZone.svelte";
    import PhaseCounter from "$lib/components/PhaseCounter.svelte";
    import { gameStart, game_playing, gameSetting, automaticPhaseProgress } from "$lib/engine/GameManager";

</script>

<PhaseCounter/>
<EntryZone/>
<HandZone/>
<hr>
<Deck/>
{#if !$game_playing}
    <button on:click={gameSetting}>Game Setting</button>
    <button on:click={gameStart}>Start Game</button>
    {:else}
    <button on:click={automaticPhaseProgress}>Next Phase</button>
{/if}