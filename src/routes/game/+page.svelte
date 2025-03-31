<script lang="ts">
    import { onMount } from 'svelte';
    import Deck from "$lib/components/Deck.svelte"; // ✅ Deck 컴포넌트 이름 변경
    import EntryZone from "$lib/components/EntryZone.svelte";
    import MemberZone from "$lib/components/MemberZone.svelte";
    import HandZone from "$lib/components/HandZone.svelte";
    import WaitingZone from "$lib/components/WaitingZone.svelte";
    import PhaseCounter from "$lib/components/PhaseCounter.svelte";
    import EnergyZone from "$lib/components/EnergyZone.svelte";
    import PartnerZone from "$lib/components/PartnerZone.svelte";
    import RebirthZone from "$lib/components/RebirthZone.svelte";
    import RetireZone from "$lib/components/RetireZone.svelte";
    import { gameStart, game_playing, automaticPhaseProgress } from "$lib/engine/GameManager";
    import { deck_store , entry_store } from "$lib/engine/CardStore";
    
    import { get } from "svelte/store";
    import { CardMovement } from "$lib/engine/CardManager";
    import { v4 as uuidv4 } from 'uuid';
    import type { CardInstance } from '$lib/engine/CardManager';

    // ✅ Deck 인터페이스 정의 (DeckComponent와 충돌 방지)
    interface DeckData {
        name: string;
        cards: CardInstance[];
        createdAt?: string;
    }

     // --- 상태 변수 ---
     let savedDecks: DeckData[] = [];
    let showDeckSelector = false;
    let selectingFor: 'player' | 'opponent' | null = null;
    let tempSelectedDeckIndex: number | null = null;

    // 플레이어 덱 선택 정보
    let playerSelectedDeckName = '';
    let playerSelectedDeckIndex = -1;

    // 상대방 덱 선택 정보
    let opponentSelectedDeckName = '';
    let opponentSelectedDeckIndex = -1;


     // 플레이어 덱에서 엔트리로 이동 (deck_store 사용 유지)
     function movePlayerDeckToEntry() {
        const current_deck = get(deck_store); // 플레이어 덱으로 간주
        if (current_deck.length === 0) {
            console.log("덱에 카드가 없습니다.");
            return;
        }
        const card = current_deck[current_deck.length - 1];
        if (get(entry_store).length > 0) {
            console.log("엔트리에 이미 카드가 있습니다.");
            return;
        }
        CardMovement.moveCard(card, "deck", "entry", "top"); // 기존 로직 유지 가정
    }

    // 저장된 덱 목록 불러오기
    function loadSavedDecks(): void {
        try {
            savedDecks = JSON.parse(localStorage.getItem('savedDecks') || '[]') as DeckData[];
        } catch (e) {
            console.error("저장된 덱 로딩 실패:", e);
            savedDecks = [];
        }
    }

     // 모달에서 '선택 완료' 시 호출 (덱 선택 정보만 저장)
     function confirmDeckSelection(): void {
        if (tempSelectedDeckIndex === null || selectingFor === null) return;
        const deckIndex = tempSelectedDeckIndex;

        if (deckIndex < 0 || deckIndex >= savedDecks.length) {
             console.error("Invalid deck index");
             resetModalSelection();
             return;
        }

        const selectedDeckData: DeckData = savedDecks[deckIndex];

        // 선택 정보만 상태 변수에 저장 (deck_store 건드리지 않음!)
        if (selectingFor === 'player') {
            playerSelectedDeckName = selectedDeckData.name;
            playerSelectedDeckIndex = deckIndex;
            console.log(`플레이어 덱 "${playerSelectedDeckName}" 선택`);
        } else if (selectingFor === 'opponent') {
            opponentSelectedDeckName = selectedDeckData.name;
            opponentSelectedDeckIndex = deckIndex;
            console.log(`상대방 덱 "${opponentSelectedDeckName}" 선택`);
        }

        resetModalSelection(); // 모달 닫기
    }

    // 덱 데이터 -> 카드 객체 배열 생성 (기존 로직 유지)
    function createDeckCards(savedDeckCards: Array<{ serial_number: string /*, count?: number */ }>): CardInstance[] {
    const newDeck: CardInstance[] = [];
    // savedDeckCards는 serial_number 목록 또는 {serial_number, count} 객체 배열이라고 가정
    savedDeckCards.forEach(item => {
        // 만약 카드 장수(count) 정보가 있다면 그만큼 반복 생성
        const count = 1; // 예시: count 정보가 없다면 1장
        for (let i = 0; i < count; i++) {
            // 여기서 CardList나 cardDatabase를 참조할 필요 없음!
            newDeck.push({
                id: uuidv4(), // 고유 ID 생성
                serial_number: item.serial_number, // 종류 번호만 저장
                zone: 'deck',
                state: { // 기본 상태
                    is_animating: false, is_fading_in: false, is_fading_out: false,
                    is_flipped: false, is_selected: false, is_tapped: false,
                }
            });
        }
    });
    return newDeck;
}
    // 덱 섞기 (기존 로직 유지)
    function shuffleDeck(deck: CardInstance[]): CardInstance[] {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // 덱 선택 모달 열기 (누구 위한 모달인지 지정)
    function openDeckSelector(playerType: 'player' | 'opponent'): void {
        loadSavedDecks(); // 최신 덱 목록 로드
        selectingFor = playerType; // 선택 대상 지정
        // 이전에 선택한 덱이 있으면 모달에 기본으로 표시되도록 임시 인덱스 설정
        tempSelectedDeckIndex = playerType === 'player' ? playerSelectedDeckIndex : opponentSelectedDeckIndex;
        tempSelectedDeckIndex = tempSelectedDeckIndex === -1 ? null : tempSelectedDeckIndex; // -1은 선택 안 함으로 간주
        showDeckSelector = true;
    }

    // 모달 닫고 임시 상태 초기화
    function resetModalSelection(): void {
         showDeckSelector = false;
         selectingFor = null;
         tempSelectedDeckIndex = null;
    }

    function startGame(): void {
      if (playerSelectedDeckIndex === -1 || opponentSelectedDeckIndex === -1) {
            alert('플레이어와 상대방의 덱을 모두 선택해주세요.');
            return;
        }
       
    // 1. 선택된 덱의 *기본 카드 목록* 가져오기 (serial_number, count 등)
    // (★ DeckData 인터페이스 또는 savedDecks 실제 구조 재확인 필요!)
    const playerDeckDefinitionList = savedDecks[playerSelectedDeckIndex].cards; // 이게 {serial_number, count?}[] 라고 가정
    const opponentDeckDefinitionList = savedDecks[opponentSelectedDeckIndex].cards; // 이게 {serial_number, count?}[] 라고 가정

    if (!playerDeckDefinitionList || !opponentDeckDefinitionList) {
        alert('선택된 덱의 카드 목록 정보를 불러올 수 없습니다.');
        // goto('/'); // 필요시 메인으로
        return;
    }

    // 2. 기본 목록으로 CardInstance 배열 생성! ★ 여기가 중요!
    const playerDeckInstances = createDeckCards(playerDeckDefinitionList); // 기본 목록 전달
    const opponentDeckInstances = createDeckCards(opponentDeckDefinitionList); // 기본 목록 전달

    // 3. CardInstance 배열 셔플!
    const playerShuffledDeck = shuffleDeck(playerDeckInstances); // 수정된 shuffleDeck 사용
    const opponentShuffledDeck = shuffleDeck(opponentDeckInstances); // 수정된 shuffleDeck 사용
    console.log(`플레이어 덱 ${playerShuffledDeck.length}장, 상대 덱 ${opponentShuffledDeck.length}장 준비 완료.`);

    // 4. 플레이어 덱 스토어 설정
    deck_store.set(playerShuffledDeck); // CardInstance[] 설정
    console.log("플레이어 deck_store 설정 완료.");

    // 5. gameStart 함수 호출 (상대방 CardInstance[] 전달)
    console.log(`상대방 덱 정보를 GameManager로 전달하며 게임 시작!`);
    gameStart(opponentShuffledDeck); // CardInstance[] 전달
}
    // 컴포넌트 마운트 시 저장된 덱 로드 (기존과 동일)
    onMount(() => {
        loadSavedDecks();
    });

</script>


<style>


.game-container {
  display: flex; /* 내부 요소 정렬 위해 */
  flex-direction: column; /* 세로 방향 배치 (위: 상대, 중간: 구분선, 아래: 나) */
  min-height: 100vh; /* 최소 화면 전체 높이 */
  padding: 8px; /* 화면 가장자리와 약간의 여백 */
  box-sizing: border-box;
  align-items: center; /* 가로축 중앙 정렬 (보드 래퍼를 중앙에) */
  /* background: #어두운배경색; /* 게임판 배경색 추천 */
}

.board-wrapper {
  width: 100%;
  max-width: 1600px; /* 최대 너비 */
  flex: 1; /* 세로 공간 채우기 */
  display: grid; /* ★ 3열 Grid 사용 */
  grid-template-columns: auto 1fr auto; /* 양쪽 리타이어: 자동, 중앙: 나머지 공간 */
  gap: 8px; /* 칸 사이 간격 */
  padding: 5px; /* 내부 여백 */
  min-height: 0; /* 높이 문제 방지 */
}



.center-play-area {
  display: flex;
  flex-direction: column; /* 위: 상대, 중간: 구분선, 아래: 나 */
  gap: 5px; /* 내부 요소 간격 */
  min-width: 0; /* 너비 문제 방지 */
}
.player-main-zones,
.opponent-zones-rotated {
  flex: 1;
  display: grid; /* ★ Grid 사용 */
  min-height: 300px; /* 최소 높이 (내용물 따라 조절) */
  padding: 8px; /* 내부 여백 */
  gap: 8px; /* Zone 간의 간격 */
  border: 1px dashed #444; /* 영역 확인용 임시 테두리 (나중에 제거) */
  border-radius: 5px; /* 약간 둥글게 */
  background-color: rgba(0, 0, 0, 0.1); /* 배경색 */

  /* ▼▼▼ Grid 구조 정의 ▼▼▼ */
  /* 컬럼 정의: Rebirth/Wait/Energy | Entry/Member/Partner | Deck/Member/Partner */
  /* 크기는 내용물(auto)과 남은 공간(1fr)으로 조절 */
  grid-template-columns: auto 1fr auto;

  /* 로우 정의: 1,2,3행은 내용물 크기만큼, 마지막 핸드 행은 남은 공간 모두 */
  grid-template-rows: auto auto auto auto 1fr;

  /* 영역 이름 정의 */
  grid-template-areas:
    "phase   phase   phase phase"
    "rebirth entry entry-btn deck"    /* 1행: 리버스, 엔트리, 덱 */
    "waiting member  member member" 
    "energy . partner ."       /* 3행: 에너지, 파트너, 빈칸 */
    "pregame pregame pregame pregame" 
    "hand    hand   hand  hand";   /* 4행: 핸드(3칸 차지) */
  /* ▲▲▲ Grid 구조 정의 끝 ▲▲▲ */

  /* opponent-zones-rotated는 transform: rotate(180deg); 유지 */
}

.opponent-zones-rotated {
    transform: rotate(180deg);
   
}


.field-divider {
  height: 2px;
  background-color: #555;
  margin: 0;
  width: 100%;
  flex-shrink: 0;
}


/* 버튼 스타일 */
button {
  padding: 5px 10px;
  margin: 5px;
  border-radius: 5px;
  border: none;
  background-color: #3498db;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #2980b9;
}


    /* 덱 선택 관련 스타일 */
    .deck-selection {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .deck-info {
        padding: 5px 10px;
        background-color: #e3f2fd;
        border-radius: 4px;
        font-size: 0.9rem;
    }
    
    /* 모달 스타일 */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .deck-selector-modal {
        background: white;
        padding: 20px;
        border-radius: 8px;
        width: 80%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .deck-selector-modal h2 {
        margin-top: 0;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
    }
    
    .deck-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
        margin: 15px 0;
    }
    
    .deck-item {
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .deck-item:hover {
        background-color: #f5f5f5;
    }
    
    .deck-item.selected {
        border-color: #2196F3;
        background-color: #e3f2fd;
    }
    
    .modal-buttons {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
        gap: 10px;
    }
    
    button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    button.primary {
        background-color: #2196F3;
        color: white;
    }
    
    button.secondary {
        background-color: #f5f5f5;
        color: #333;
    }
    
    button:hover {
        opacity: 0.9;
    }
    
    .no-decks-message {
        padding: 20px;
        text-align: center;
        color: #666;
    }
    
    .deck-builder-link {
        display: block;
        margin-top: 15px;
        text-align: center;
        color: #2196F3;
        text-decoration: none;
    }
    
    .deck-builder-link:hover {
        text-decoration: underline;
    }

    .header-actions {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  .back-btn {
    padding: 8px 16px;
    background-color: #607D8B;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: bold;
    transition: background-color 0.2s;
  }
  
  .back-btn:hover {
    background-color: #455A64;
  }

</style>



<div class="game-container">
  <div class="board-wrapper">

    
    <div class="player-retire-area">
       
      <RetireZone player="player" />
    </div>

    
    <div class="center-play-area">
      
      <div class="opponent-main-zones">
        <div class="opponent-zones-rotated">
           
            <PhaseCounter gridArea="phase" />
            <RebirthZone player="opponent" gridArea="rebirth" />
            <EntryZone player="opponent" gridArea="entry" />
            <button class="entry-in-button" on:click={movePlayerDeckToEntry}>엔트리 인</button>
            <Deck player="opponent" gridArea="deck" />
            <MemberZone player="opponent" gridArea="member" />
            <WaitingZone player="opponent" gridArea="waiting" />
            <EnergyZone player="opponent" gridArea="energy" />
            <PartnerZone player="opponent" gridArea="partner" />
            <HandZone player="opponent" gridArea="hand" />
           
        </div>
      </div>

     
      <div class="field-divider"></div>

    
      <div class="player-main-zones">
          
          <PhaseCounter gridArea="phase" />
          <RebirthZone player="player" gridArea="rebirth" />
          <EntryZone player="player" gridArea="entry" />
          <button class="entry-in-button" on:click={movePlayerDeckToEntry}>엔트리 인</button>
          <Deck player="player" gridArea="deck" />
          <MemberZone player="player" gridArea="member" />
          <WaitingZone player="player" gridArea="waiting" />
          <EnergyZone player="player" gridArea="energy" />
          <PartnerZone player="player" gridArea="partner" />
          <HandZone player="player" gridArea="hand" />
         

         {#if !$game_playing}
         <div class="deck-selection-area" style="margin-top: 10px; padding: 10px; border: 1px solid #eee; border-radius: 5px; background-color: #f9f9f9;">
          
          <div class="player-deck-selector" style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
            <span>플레이어 덱:</span>
            {#if playerSelectedDeckName}
                <div class="deck-info" style="padding: 5px 10px; background-color: #e3f2fd; border-radius: 4px; font-size: 0.9rem; border: 1px solid #bbdefb;">
                    <strong>{playerSelectedDeckName}</strong>
                </div>
                <button class="secondary" on:click={() => openDeckSelector('player')}>다른 덱 선택</button>
            {:else}
                <button class="primary" on:click={() => openDeckSelector('player')}>덱 선택하기</button>
            {/if}
          </div>

          
          <div class="opponent-deck-selector" style="display: flex; gap: 10px; align-items: center;">
            <span>상대방 덱:</span>
            {#if opponentSelectedDeckName}
                <div class="deck-info" style="padding: 5px 10px; background-color: #e3f2fd; border-radius: 4px; font-size: 0.9rem; border: 1px solid #bbdefb;">
                    <strong>{opponentSelectedDeckName}</strong>
                </div>
                <button class="secondary" on:click={() => openDeckSelector('opponent')}>다른 덱 선택</button>
            {:else}
                <button class="primary" on:click={() => openDeckSelector('opponent')}>덱 선택하기</button>
            {/if}
          </div>

          
          <button
            style="margin-top: 10px;"
            on:click={startGame}
            disabled={playerSelectedDeckIndex === -1 || opponentSelectedDeckIndex === -1}
            class:primary={playerSelectedDeckIndex !== -1 && opponentSelectedDeckIndex !== -1}
          >
            Start Game
          </button>
        </div>
         {:else}
         <button class="next-phase-button" on:click={automaticPhaseProgress}>
          Next Phase
        </button>
         {/if}
      </div>
    </div>

   
    <div class="opponent-retire-area">
      <RetireZone player="opponent" />
    </div>

  </div> 

  {#if showDeckSelector}
    <div class="modal-overlay" on:click|self={resetModalSelection}> <div class="deck-selector-modal">
        <h2 class="modal-title">덱 선택 ({selectingFor === 'player' ? '플레이어' : '상대방'})</h2>

        {#if savedDecks.length === 0}
          <div class="no-decks-message">
            <p>저장된 덱이 없습니다. 먼저 덱 빌더에서 덱을 만들어주세요.</p>
            <a href="/deck" class="deck-builder-link">덱 빌더로 이동</a>
          </div>
        {:else}
          <div class="deck-list">
            {#each savedDecks as deck, index}
              <div
                class="deck-item"
                class:temp-selected={tempSelectedDeckIndex === index} 
                on:click={() => tempSelectedDeckIndex = index} 
              >
                <h3>{deck.name}</h3>
                <div class="deck-stats">
                  <p>카드 수: {deck.cards.length}</p>
                  <p>생성일: {deck.createdAt ? new Date(deck.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            {/each}
          </div>
        {/if}

      
        <div class="modal-buttons">
          <button
              class="primary"
              on:click={confirmDeckSelection} 
              disabled={tempSelectedDeckIndex === null} 
          >
              선택 완료
          </button>
          <button class="secondary" on:click={resetModalSelection}>취소</button>
        </div>
      </div>
    </div>
  {/if}
  <div class="header-actions">
    <a href="/" class="back-btn">메인 화면으로 돌아가기</a>
  </div>
</div>
