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
            card_actions = ["1", "2", "3" ,"4", "5", "6", "7" ,"8"];
        } else if (card_data.zone === "entry") {
            card_actions = ["9", "10", "11"];
        }
        showMemberSubmenu = false;
    }


    let showMemberSubmenu: boolean = false;


    function actionClicked(action: string) {

        const card = get(selected_card);
    if (!card) return; // 선택된 카드가 없으면 실행 안 함






// 멤버 서브메뉴 표시 토글
if (action === "4") {
    console.log("멤버 버튼 발동시?")
        showMemberSubmenu = !showMemberSubmenu;
        return; // 다른 액션은 실행하지 않음
    }
    
    // 멤버 위치 선택 처리
    if (action === "member1" || action === "member2" || action === "member3") {
        const memberIndex = parseInt(action.replace("member", "")) - 1;
        console.log(`멤버 ${memberIndex + 1}로 이동`);
        CardMovement.moveCard(card, card.zone, "member", undefined, memberIndex);
        
        // 액션 완료 후 상태 초기화
        selected_card.set(null);
        card_actions = [];
        showMemberSubmenu = false;
        return;
    }





    switch (action) {
        case "1":
            console.log(" (핸드 → 덱 위)"); 
            CardMovement.moveCard(card, "hand", "deck", "top");
            break;
        case "2":
            console.log(" (핸드 → 덱 밑)");
            CardMovement.moveCard(card, "hand", "deck");
            break;
         case "3":
            console.log(" (핸드 → 엔트리)");
            CardMovement.moveCard(card, "hand", "entry");
            break;

        case "9":
            console.log(" (엔트리 → 덱 위)"); 
            CardMovement.moveCard(card, "entry", "deck", "top");
            break;
        case "10":
            console.log(" (엔트리 → 덱 밑)");
            CardMovement.moveCard(card, "entry", "deck");
            break;


            default:
            console.log("알 수 없는 액션");
            break;
    }

    selected_card.set(null);
    card_actions = [];
    showMemberSubmenu = false;

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
        background-color: rgba(255, 255, 255, 0.9); /* 반투명 배경 */
        width: 140px;
        height: 140px;
        display: grid;
        grid-template-columns: repeat(3, 1fr); /* 3x3 정사각형 배치 */
        grid-template-rows: repeat(3, 1fr);
        justify-items: center;
        align-items: center;
        border: 2px solid #000;
        border-radius: 10px;
        padding: 5px;
        z-index: 100;
        opacity: 1;
        transform: translate(-50%, -50%) scale(0.8);
        transition: opacity 0.2s ease-out, transform 0.2s ease-out;
    }

    /* 선택된 상태일 때만 보이도록 설정 */
    .action-menu.show {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
        pointer-events: auto;
    }

    .action-menu-btn {
        width: 40px;
        height: 40px;
        background-color: #427cd8;
        border: none;
        color: white;
        font-size: 12px;
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
    }

    .action-menu-btn:hover {
        background-color: #1837d4;
        transform: scale(1.1);
    }

    .action-menu-btn:active {
        transform: scale(0.9);
        box-shadow: none;
    }


  /* 멤버 서브메뉴 스타일 */
  .member-submenu {
        position: absolute;
        top: -10px; /* 카드 위쪽에 표시 */
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 5px;
        justify-items: center;
        align-items: center;
        border: 2px solid #000;
        border-radius: 10px;
        padding: 5px;
        background-color: rgba(255, 255, 255, 0.9); /* 반투명 배경 */
        z-index: 300;
        opacity: 1;
        visibility: visible;
    }
    
    .member-btn {
        width: 30px;
        height: 30px;
        background-color: #427cd8;
        border: none;
        color: white;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
    }
    
    .member-btn:hover {
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
            {#each card_actions as action, i}
                <button class="action-menu-btn" 
                on:click={(event) => { event.stopPropagation(); actionClicked(action); }}>
                {action}
                </button>
            {/each}
        </div>

        {#if showMemberSubmenu}
        <div class="member-submenu">
            <button class="member-btn" 
                on:click={(event) => { event.stopPropagation(); actionClicked("member1"); }}>
                left
            </button>
            <button class="member-btn" 
                on:click={(event) => { event.stopPropagation(); actionClicked("member2"); }}>
                center
            </button>
            <button class="member-btn" 
                on:click={(event) => { event.stopPropagation(); actionClicked("member3"); }}>
                right
            </button>
        </div>
        {/if}


    {/if}
</div>
