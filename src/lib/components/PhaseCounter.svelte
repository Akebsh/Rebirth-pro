<script lang="ts">
    import { current_phase } from "$lib/engine/GameManager";
    export let gridArea: string | undefined = undefined;
    function phaseCheck() {
        if ($current_phase === 0) {
            return "End Phase";
        } else if ($current_phase === 1) {
            return "Draw Phase";
        } else if ($current_phase === 2) {
            return "Energy Phase";
        } else if ($current_phase === 3) {
            return "Main Phase";
        }
    }
</script>

<div class="phase-counter-component"style={gridArea ? `grid-area: ${gridArea};` : ''}>
    <h3>{phaseCheck()}</h3>
</div>