<script lang="ts">
    import { get } from "svelte/store";
    import type { Card } from "$lib/engine/CardManager";
    import { selected_card } from "$lib/engine/CardStore";
    import { CardMovement } from "$lib/engine/CardManager";
    
    export let card_data: Card;
    let card_actions = Array<string>();
    let showMemberSubmenu: boolean = false;
    let showDeckSubmenu: boolean = false;
    let isExpanded: boolean = false;

    $: card_data.state.is_selected = $selected_card === card_data;


    function handleLongPress(event: MouseEvent) {
    event.preventDefault(); // 기본 동작 방지
    isExpanded = !isExpanded; // 카드 크기 토글
}

    function handleRightClick(event: MouseEvent) {
        console.log("우클릭 이벤트 감지됨!");
        event.preventDefault(); // 기본 우클릭 메뉴 방지
        card_data.state.is_tapped = !card_data.state.is_tapped;
        selected_card.set(card_data); // 변경 사항 반영
        
    }


    function isClicked(event: MouseEvent) {
        const current_selected_card = get(selected_card);
        if (current_selected_card) {
            current_selected_card.state.is_selected = false;
        }

        selected_card.set(card_data);
        card_data.state.is_selected = true;


        if (card_data.zone === "hand") {
            card_actions = ["덱", "엔트", "대기" ,"멤버", "에너", "파트", "리버" ,"리타"];
        } else if (card_data.zone === "entry") {
            card_actions = ["덱", "대기" ,"멤버", "에너", "파트", "리버" ,"리타" ,"핸드"];
        }
        else if (card_data.zone === "waiting") {
            card_actions = ["덱", "엔트" ,"멤버", "에너", "파트", "리버" ,"리타" ,"핸드"];
        }
        else if (card_data.zone === "member1" ||card_data.zone === "member2" ||card_data.zone === "member3"  ) {
            card_actions = ["덱", "엔트", "대기" , "에너", "파트", "리버" ,"리타" ,"핸드"];
        }
        else if (card_data.zone === "energy") {
            card_actions = ["덱", "엔트", "대기" ,"멤버", "파트", "리버" ,"리타" ,"핸드"];
        }
        else if (card_data.zone === "partner") {
            card_actions = ["덱","엔트", "대기" ,"멤버", "에너", "리버" ,"리타" ,"핸드"];
        }
        else if (card_data.zone === "re-birth") {
            card_actions = ["덱", "엔트", "대기" ,"멤버", "에너", "파트","리타" ,"핸드"];
        }
        else if (card_data.zone === "retire") {
            card_actions = ["덱", "엔트", "대기" ,"멤버", "에너", "파트", "리버" ,"핸드"];
        }
      
        showMemberSubmenu = false;
        showDeckSubmenu = false;
    }

    function actionClicked(action: string) {
        const card = get(selected_card);
        if (!card) return;

        // 덱 서브메뉴 표시 토글
        if (action === "덱" || action === "9") {
            card.state.is_tapped = false;
            card.state.is_flipped = false;
            console.log("덱 버튼 발동");
            showDeckSubmenu = !showDeckSubmenu;
            showMemberSubmenu = false;
            return;
        }

        // 엔트리로 이동
        if (action === "엔트") {
            card.state.is_tapped = false;
            card.state.is_flipped = false;
            console.log(` (${card.zone} → 엔트리)`);
            CardMovement.moveCard(card, card.zone, "entry");
            selected_card.set(null);
            card_actions = [];
            return;
        }

        // 웨이팅으로 이동
        if (action === "대기") {
            card.state.is_tapped = false;
            card.state.is_flipped = false;
            console.log(` (${card.zone} → 웨이팅)`);
            CardMovement.moveCard(card, card.zone, "waiting");
            selected_card.set(null);
            card_actions = [];
            return;
        }

        // 멤버 서브메뉴 표시 토글
        if (action === "멤버") {
            card.state.is_tapped = false;
            card.state.is_flipped = false;
            console.log("멤버 버튼 발동");
            showMemberSubmenu = !showMemberSubmenu;
            showDeckSubmenu = false;
            return;
        }

        // 에너지로 이동
        if (action === "에너") {
            card.state.is_tapped = false;
            card.state.is_flipped = false;
            console.log(` (${card.zone} → 에너지)`);
            card.state.is_flipped = true;  // 카드를 뒷면으로 뒤집기
            CardMovement.moveCard(card, card.zone, "energy");
            selected_card.set(null);
            card_actions = [];
            return;
        }

        // 파트너로 이동
        if (action === "파트") {
            card.state.is_tapped = false;
            card.state.is_flipped = false;
            console.log(` (${card.zone} → 파트너)`);
            CardMovement.moveCard(card, card.zone, "partner");
            selected_card.set(null);
            card_actions = [];
            return;
        }

        // 리버스로 이동
        if (action === "리버") {
            card.state.is_tapped = false;
            card.state.is_flipped = false;
            console.log(` (${card.zone} → 리버스)`);
            CardMovement.moveCard(card, card.zone, "re-birth");
            selected_card.set(null);
            card_actions = [];
            return;
        }

        // 리타이어로 이동
        if (action === "리타") {
            card.state.is_tapped = false;
            card.state.is_flipped = false;
            console.log(` (${card.zone} → 리타이어)`);
            CardMovement.moveCard(card, card.zone, "retire");
            selected_card.set(null);
            card_actions = [];
            return;
        }

        if (action === "핸드") {
            card.state.is_tapped = false;
            card.state.is_flipped = false;
            console.log(` (${card.zone} → 핸드)`);
            CardMovement.moveCard(card, card.zone, "hand");
            selected_card.set(null);
            card_actions = [];
            return;
        }



        // 덱 위치 선택 처리
        if (action === "deck_top") {
            console.log(` (${card.zone} → 덱 위)`);
            CardMovement.moveCard(card, card.zone, "deck", "top");
            selected_card.set(null);
            showDeckSubmenu = false;
            return;
        }
        if (action === "deck_bottom") {
            console.log(` (${card.zone} → 덱 밑)`);
            CardMovement.moveCard(card, card.zone, "deck");
            selected_card.set(null);
            showDeckSubmenu = false;
            return;
        }
        
        // 멤버 위치 선택 처리
        if (action === "member1") {
            CardMovement.moveCard(card, card.zone, "member1");
            console.log("멤버 1로 이동");
            selected_card.set(null);
            showMemberSubmenu = false;
            return;
        }
        if (action === "member2") {
            CardMovement.moveCard(card, card.zone, "member2");
            console.log("멤버 2로 이동");
            selected_card.set(null);
            showMemberSubmenu = false;
            return;
        }
        if (action === "member3") {
            CardMovement.moveCard(card, card.zone, "member3");
            console.log("멤버 3로 이동");
            selected_card.set(null);
            showMemberSubmenu = false;
            return;
        }

        switch (action) {
            default:
                console.log("알 수 없는 액션");
                break;
        }

        selected_card.set(null);
        card_actions = [];
        showMemberSubmenu = false;
        showDeckSubmenu = false;
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
        transition: transform 0.3s ease;
    }
    
    .card.expanded {
    transform: scale(4); /* 확대 비율 */
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
        width: 50px;
        height: 40px;
        background-color: #427cd8;
        border: none;
        color: white;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5px;
    }
    
    .member-btn:hover {
        background-color: #1837d4;
    }

    .deck-submenu {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 5px;
        justify-items: center;
        align-items: center;
        border: 2px solid #000;
        border-radius: 10px;
        padding: 5px;
        background-color: rgba(255, 255, 255, 0.9);
        z-index: 300;
        opacity: 1;
        visibility: visible;
    }
    
    .deck-btn {
        width: 70px;
        height: 40px;
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
    
    .deck-btn:hover {
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

    .tapped {
        transform: rotate(90deg);
    }


</style>

<div class="card 
    {card_data.state.is_selected ? 'selected' : ''}
    {card_data.state.is_animating ? 'deck-fade-out' : ''}
    {card_data.state.is_fading_in ? 'hand-fade-in' : 'hand-position'}
    {card_data.state.is_tapped ? 'tapped' : ''}"
    class:expanded={isExpanded} 
    on:click={isClicked}
    on:contextmenu={handleRightClick}
    on:mousedown={handleLongPress} 
    aria-hidden="true">
    
    <div>
        {#if card_data.state.is_flipped}
            <img src="/rebirthBack.png" alt="card back" />
        {:else}
            <img src={card_data.image_url} alt={card_data.serial_number} />
        {/if}
    </div>

    {#if card_data.state.is_selected && !isExpanded}
        <div class="action-menu">
            {#each card_actions as action, i}
                <button class="action-menu-btn" 
                on:click={(event) => { event.stopPropagation(); actionClicked(action); }}>
                {action}
                </button>
            {/each}
        </div>

        {#if showDeckSubmenu}
        <div class="deck-submenu">
            <button class="deck-btn" 
                on:click={(event) => { event.stopPropagation(); actionClicked("deck_top"); }}>
                덱 위로
            </button>
            <button class="deck-btn" 
                on:click={(event) => { event.stopPropagation(); actionClicked("deck_bottom"); }}>
                덱 밑으로
            </button>
        </div>
        {/if}

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
