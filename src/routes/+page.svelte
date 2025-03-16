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
    import RetireZone from "$lib/components/RetireZone.svelte";
    import { gameStart, game_playing, gameSetting, automaticPhaseProgress } from "$lib/engine/GameManager";
</script>

<style>

.main-container {
        display: flex;
        height: 100vh;
    }

    /* 리타이어존을 왼쪽에 길게 배치 */
    .left-container {
        flex: 0.2; /* 전체 화면 중 20% 차지 */
        display: flex;
        justify-content: center;
        align-items: center;
    }

    /* 나머지 요소들이 오른쪽에 배치 */
    .right-container {
        flex: 0.8; /* 전체 화면 중 80% 차지 */
        display: flex;
        flex-direction: column;
        gap: 20px;
        align-items: center;
        justify-content: flex-start;
    }







    .top-container {
        display: flex;
        gap: 20px;
        align-items: flex-start;
    }

    .middle-container {
        display: flex;
        gap: 20px;
        align-items: flex-start;
    }

    .bottom-container {
        display: flex;
        gap: 20px;
        align-items: flex-start;
    }
</style>



<div class="main-container">
    <!-- 왼쪽에 리타이어존 -->
    <div class="left-container">
        <RetireZone />
    </div>

    <!-- 오른쪽에 기존 게임 UI 유지 -->
    <div class="right-container">


  <PhaseCounter/>
  <div class="top-container">
    <RebirthZone/>
    <EntryZone/>
    <Deck/>
  </div>
<div class="middle-container">
    <MemberZone/> 
    <WaitingZone/>
  </div>
<hr>
<div class="bottom-container">
    <EnergyZone />
    <PartnerZone/>
</div>
<hr>
<HandZone/>
{#if !$game_playing}
    <button on:click={gameSetting}>Game Setting</button>
    <button on:click={gameStart}>Start Game</button>
    {:else}
    <button on:click={automaticPhaseProgress}>Next Phase</button>
{/if}

</div>
</div>