<script>
    // import Card from "$lib/components/Card.svelte";
    import Deck from "$lib/components/Deck.svelte";
    import EntryZone from "$lib/components/EntryZone.svelte";
    import MemberZone from "$lib/components/MemberZone.svelte";
    import HandZone from "$lib/components/HandZone.svelte";
    import WaitingZone from "$lib/components/WaitingZone.svelte";
    import PhaseCounter from "$lib/components/PhaseCounter.svelte";
    import EnergyZone from "$lib/components/EnergyZone.svelte";
    import PartnerZone from "$lib/components/PartnerZone.svelte";
    import RebirthZone from "$lib/components/RebirthZone.svelte";
    import { gameStart, game_playing, gameSetting, automaticPhaseProgress } from "$lib/engine/GameManager";
</script>

<style>
    .bottom-container {
        display: flex;
        gap: 20px;
        align-items: flex-start;
    }
</style>

<PhaseCounter/>
<EntryZone/>
<MemberZone/>
<HandZone/>
<hr>
<div class="bottom-container">
    <Deck/>
    <WaitingZone/>
    <EnergyZone />
    <PartnerZone/>
    <RebirthZone/>
</div>
{#if !$game_playing}
    <button on:click={gameSetting}>Game Setting</button>
    <button on:click={gameStart}>Start Game</button>
    {:else}
    <button on:click={automaticPhaseProgress}>Next Phase</button>
{/if}