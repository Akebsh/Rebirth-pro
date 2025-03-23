<script lang="ts">

    import { onMount } from 'svelte';
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
    import { gameStart, game_playing, automaticPhaseProgress } from "$lib/engine/GameManager";
    import { deck_store } from "$lib/engine/CardStore";
    import type { Card } from './types';


    interface DeckData {  // 'Deck' 대신 'DeckData' 사용
    name: string;
    cards: Card[];
}


    // 저장된 덱 관련 상태
    let savedDecks: DeckData[] = [];
    let showDeckSelector = false;
    let selectedDeckName = '';
    let selectedDeckIndex = -1;


    
    
    // 저장된 덱 목록 불러오기
    function loadSavedDecks(): DeckData[] {
    savedDecks = JSON.parse(localStorage.getItem('savedDecks') || '[]') as DeckData[];
    return savedDecks;
}

    // 특정 덱 불러와서 게임에 적용하기
    function loadDeckToGame(deckIndex) {
        if (deckIndex < 0 || deckIndex >= savedDecks.length) {
            console.error("Invalid deck index");
            return false;
        }
        
        const selectedDeck = savedDecks[deckIndex];
        selectedDeckName = selectedDeck.name;
        selectedDeckIndex = deckIndex;
        
        // 기존 덱 초기화
        deck_store.set([]);
        
        // 선택한 덱의 카드들을 게임 덱에 추가
        const deckCards = selectedDeck.cards.map(cardData => {
            // 카드매니저의 createCard 함수 사용
            return {
                serial_number: cardData.serial_number,
                name: cardData.name,
                description: cardData.description,
                image_url: cardData.image_url,
                atk: cardData.atk,
                hp: cardData.hp,
                type: cardData.type,
                subtype: cardData.subtype,
                zone: "deck",
                is_first_entry: cardData.subtype === 'member', // 멤버 카드가 첫 엔트리 후보
                state: {
                    is_animating: false,
                    is_fading_in: false,
                    is_fading_out: false,
                    is_flipped: false,
                    is_selected: false,
                    is_tapped: false,
                }
            };
        });
        
        // 덱 섞기
        const shuffledDeck = shuffleDeck(deckCards);
        
        // 덱 업데이트
        deck_store.set(shuffledDeck);
        
        // 모달 닫기
        showDeckSelector = false;
        
        return true;
    }

    // 덱 섞기 함수 
    function shuffleDeck(deck) {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // 덱 선택 모달 표시
    function openDeckSelector() {
        loadSavedDecks();
        showDeckSelector = true;
    }

    // 게임 시작 함수
    function startGame() {
        // 덱이 선택되었는지 확인
        if (selectedDeckIndex === -1) {
            alert('게임을 시작하기 전에 덱을 선택해주세요.');
            return;
        }
        
        gameStart();
    }

    onMount(() => {
        // 저장된 덱 목록 불러오기
        loadSavedDecks();
    });
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
            <!-- 게임 시작 전 덱 선택 UI -->
            <div class="deck-selection">
                {#if selectedDeckName}
                    <div class="deck-info">선택된 덱: <strong>{selectedDeckName}</strong></div>
                    <button class="secondary" on:click={openDeckSelector}>다른 덱 선택</button>
                {:else}
                    <button class="primary" on:click={openDeckSelector}>덱 선택하기</button>
                {/if}
            </div>
            <button on:click={startGame} disabled={selectedDeckIndex === -1}>Start Game</button>
        {:else}
            <button on:click={automaticPhaseProgress}>Next Phase</button>
        {/if}
    </div>
</div>

<!-- 덱 선택 모달 -->
{#if showDeckSelector}
    <div class="modal-overlay">
        <div class="deck-selector-modal">
            <h2>덱 선택</h2>
            
            {#if savedDecks.length === 0}
                <div class="no-decks-message">
                    <p>저장된 덱이 없습니다. 먼저 덱 빌더에서 덱을 만들어주세요.</p>
                    <a href="/deck" class="deck-builder-link">덱 빌더로 이동</a>
                </div>
            {:else}
                <div class="deck-list">
                    {#each savedDecks as deck, index}
                        <div 
                            class="deck-item {selectedDeckIndex === index ? 'selected' : ''}" 
                            on:click={() => loadDeckToGame(index)}
                        >
                            <h3>{deck.name}</h3>
                            <div class="deck-stats">
                                <p>카드 수: {deck.cards.length}</p>
                                <p>생성일: {new Date(deck.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
            
            <div class="modal-buttons">
                <button class="secondary" on:click={() => showDeckSelector = false}>닫기</button>
            </div>
        </div>
    </div>
{/if}


<div class="header-actions">
    <a href="/" class="back-btn">메인 화면으로 돌아가기</a>
</div>
