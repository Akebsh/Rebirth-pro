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
    import type { Card } from './types';
    import { get } from "svelte/store";
    import { CardMovement } from "$lib/engine/CardManager";

    // ✅ Deck 인터페이스 정의 (DeckComponent와 충돌 방지)
    interface DeckData {
        name: string;
        cards: Card[];
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
        console.log(`(덱 → 엔트리): ${card.name}`);
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
    function createDeckCards(cardDataArray: Card[]): Card[] {
        return cardDataArray.map(cardData => ({
            serial_number: cardData.serial_number,
            name: cardData.name,
            description: cardData.description,
            image_url: cardData.image_url,
            atk: cardData.atk,
            hp: cardData.hp,
            type: cardData.type,
            subtype: cardData.subtype,
            zone: "deck",
            is_first_entry: cardData.subtype === 'member',
            state: { is_animating: false, is_fading_in: false, is_fading_out: false, is_flipped: false, is_selected: false, is_tapped: false }
        }));
    }

    // 덱 섞기 (기존 로직 유지)
    function shuffleDeck(deck: Card[]): Card[] {
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

    // 게임 시작 함수 (수정됨)
    function startGame(): void {
        // 양쪽 다 덱 선택했는지 확인
        if (playerSelectedDeckIndex === -1 || opponentSelectedDeckIndex === -1) {
            alert('플레이어와 상대방의 덱을 모두 선택해주세요.');
            return;
        }

        // 1. 선택된 덱 데이터 가져오기
        const playerDeckData = savedDecks[playerSelectedDeckIndex];
        const opponentDeckData = savedDecks[opponentSelectedDeckIndex];

        if (!playerDeckData || !opponentDeckData) {
            alert('선택된 덱 정보를 불러올 수 없습니다.');
            return;
        }

        // 2. 카드 배열 생성 및 섞기
        const playerDeckCards = createDeckCards(playerDeckData.cards);
        const playerShuffledDeck = shuffleDeck(playerDeckCards);

        const opponentDeckCards = createDeckCards(opponentDeckData.cards);
        const opponentShuffledDeck = shuffleDeck(opponentDeckCards);

        // 3. 플레이어 덱만! deck_store에 설정
        deck_store.set(playerShuffledDeck);
        console.log(`플레이어 덱 (${playerDeckData.name})을 deck_store에 로드.`);

        // 4. gameStart 함수 호출 (상대방 덱은 인자로 전달)
        console.log(`상대방 덱 (${opponentDeckData.name}) 정보를 GameManager로 전달하며 게임 시작!`);
        // !!! 중요: GameManager.ts의 gameStart 함수가 opponentShuffledDeck 인자를 받도록 수정해야 함 !!!
        gameStart(opponentShuffledDeck); // 이 부분은 GameManager 수정 후 작동
    }

    // 컴포넌트 마운트 시 저장된 덱 로드 (기존과 동일)
    onMount(() => {
        loadSavedDecks();
    });

</script>


<style>
.game-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

/* 필드 크기 지정 */
.opponent-field, .player-field {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.opponent-field {
  justify-content: flex-end;
  margin-right: 2000px; /* 오른쪽으로 이동 */
}

.player-field {
  justify-content: flex-start;
  margin-left: 2000px; /* 왼쪽으로 이동 */
}

/* 구분선 */
.field-divider {
  height: 4px;
  background-color: #444;
  margin: 10px 0;
  width: 100%;
}

/* 메인 컨테이너 */
.main-container {
  display: flex;
  width: 95%;
  max-width: 1200px;
}

/* 상대 필드 회전 */
.opponent-field .main-container {
  transform: rotate(180deg);
  flex-direction: row-reverse; /* 컨테이너 좌우 반전 */
}

/* 좌우 컨테이너 */
.left-container {
  flex: 0.2;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.right-container {
  flex: 0.8;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
}

/* 상단 컨테이너 */
.top-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 엔트리존 컨테이너 */
.rebirth-entry-container {
  display: flex;
  gap: 20px;
}

/* 중간 컨테이너 */
.middle-container {
  display: flex;
  gap: 20px;
  margin: 10px 0;
}

/* 하단 컨테이너 */
.bottom-container {
  display: flex;
  gap: 20px;
  margin: 10px 0;
}

/* 각 영역 */
RebirthZone, EntryZone, MemberZone, WaitingZone, EnergyZone, PartnerZone, HandZone {
  min-width: 80px;
  min-height: 60px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: rgba(240, 240, 240, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 상대방 필드에서 플레이어 UI 숨김 */

/* 카드 핸드 영역 */
HandZone {
  width: 100%;
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

/* 반응형 조정 */
@media (max-width: 1200px) {
  .rebirth-entry-container {
    gap: 10px;
  }
  
  .top-container, .middle-container, .bottom-container {
    gap: 10px;
  }
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
  <div class="opponent-field">
    <div class="main-container opponent">
      <div class="right-container rotated">
        <PhaseCounter/>
        <div class="top-container">
          <div class="rebirth-entry-container">
            <RebirthZone player="opponent"/>
            <EntryZone player="opponent"/></div>
          <button class="entry-in-button" disabled>엔트리 인</button>
          <Deck player="opponent"/> </div>
        <div class="middle-container">
          <MemberZone player="opponent"/>
          <WaitingZone player="opponent"/> </div>
        <hr>
        <div class="bottom-container">
          <EnergyZone player="opponent"/>
          <PartnerZone player="opponent"/> </div>
        <hr>
        <HandZone player="opponent"/> </div>

      <div class="left-container rotated">
        <RetireZone player="opponent"/> </div>
    </div>
  </div>

  <div class="field-divider"></div>

  <div class="player-field">
    <div class="main-container">
      <div class="left-container">
        <RetireZone player="player"/> </div>

      <div class="right-container">
        <PhaseCounter/>
        <div class="top-container">
          <div class="rebirth-entry-container">
            <RebirthZone player="player"/>
            <EntryZone player="player"/> </div>
          <button class="entry-in-button" on:click={movePlayerDeckToEntry}>엔트리 인</button>
          <Deck player="player"/> </div>
        <div class="middle-container">
          <MemberZone player="player"/>
          <WaitingZone player="player"/> </div>
        <hr>
        <div class="bottom-container">
          <EnergyZone player="player"/>
          <PartnerZone player="player"/> </div>
        <hr>
        <HandZone player="player"/> {#if !$game_playing}
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
          <button on:click={automaticPhaseProgress}>Next Phase</button>
        {/if}
        </div>
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