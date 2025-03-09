<script lang="ts">
    import { get } from "svelte/store";
    import type { Card } from "$lib/engine/CardManager";
    import { selected_card } from "$lib/engine/CardStore";
    import { CardMovement } from "$lib/engine/CardManager";
    
    export let card_data: Card;
    let card_actions = Array<string>();

    $: card_data.state.is_selected = $selected_card === card_data;

    function isClicked(event: MouseEvent) {
        const current_selected_card = get(selected_card);
        if (current_selected_card) {
            current_selected_card.state.is_selected = false;
        }

        selected_card.set(card_data);
        card_data.state.is_selected = true;

        if (card_data.zone === "hand") {
            card_actions = ["1", "2", "3"];
        } else if (card_data.zone === "entry") {
            card_actions = ["4", "5", "6"];
        }

    }

    function actionClicked(action: string) {

        const card = get(selected_card);
    if (!card) return; // 선택된 카드가 없으면 실행 안 함

    switch (action) {
        case "1":
            console.log(" (핸드 → 덱 위)"); // 나중에 정말로 덱 위가 맞는지 드로우로 확인
            CardMovement.moveCard(card, "hand", "deck", "top");
            break;
        case "2":
            console.log(" (핸드 → 덱 밑)");
            CardMovement.moveCard(card, "hand", "deck");
            break;
        case "4":
            console.log(" (엔트리 → 덱 위)"); // 나중에 정말로 덱 위가 맞는지 드로우로 확인
            CardMovement.moveCard(card, "entry", "deck", "top");
            break;
        case "5":
            console.log(" (엔트리 → 덱 밑)");
            CardMovement.moveCard(card, "entry", "deck");
            break;


            default:
            console.log("알 수 없는 액션");
            break;
    }
        console.log(action);
        console.log("액션 클릭");
    }
</script>

<style>
    .card {
        position: relative;
        width: 126px;
        height: 176px;
        border: 2px solid #42d86f;
        border-radius: 9px;
        perspective: 1000px;
        cursor: pointer;
    }

    img {
        width: 100%;
        height: 100%;
    }

    .action-menu {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
        width: 100px;
        height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        border: 2px solid #000;
        padding: 5px;
        z-index: 10;
    }

    .action-menu-btn {
        display: block;
        margin: 2.5px 0;
        padding: 8px 12px;
        width: 100%;
        background-color: #427cd8;
        border: none;
        color: white;
        font-size: 10px;
        cursor: pointer;
    }

    .action-menu-btn:hover {
        background-color: #1837d4;
    }

    .selected {
        outline: 3px solid #ffcc00;
        box-shadow: 0 0 10px rgba(255, 204, 0, 0.8);
    }
    
    /*********************************************************/
    /********************* ANIMATION CSS *********************/
    /*********************************************************/

    
    .hand-fade-in {
        opacity: 0;
        transform: translateY(-30px);
    }

    .hand-position {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.5s ease-out, transform 0.5s ease-out;
    }


</style>

<div class="card 
    {card_data.state.is_selected ? 'selected' : ''}
    {card_data.state.is_animating ? 'deck-fade-out' : ''}
    {card_data.state.is_fading_in ? 'hand-fade-in' : 'hand-position'}"
    on:click={isClicked}
    aria-hidden="true">
    
    <div>
        {#if card_data.state.is_flipped}
            <img src="" alt="back" />
        {:else}
            <img src={card_data.image_url} alt={card_data.serial_number} />
        {/if}
    </div>

    {#if card_data.state.is_selected}
        <div class="action-menu">
            {#each card_actions as action}
                <button class="action-menu-btn" 
                on:click={(event) => { event.stopPropagation(); actionClicked(action); }}>
                {action}
                </button>
            {/each}
        </div>
    {/if}
</div>
