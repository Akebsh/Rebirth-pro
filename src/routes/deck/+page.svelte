<script lang="ts">
    import { onMount } from 'svelte';
    import { cardList } from '$lib/engine/CardList';
    import type { Card } from '$lib/engine/CardManager';
    import VirtualList from 'svelte-virtual-list';

    interface Deck {
        name: string;
        cards: Card[];
        createdAt: string;
    }

    let isLoading = false;


    // 덱 상태 관리
    let selectedCards: Card[] = [];
    let searchTerm = '';
    let filterType: Card['type'] | 'all' = 'all';
    let filterSubtype: Card['subtype'] | 'all' = 'all';
    let deckName = '새 덱';
    let savingStatus = '';
  
    let savedDecks: Deck[] = [];









    
    // 페이지네이션 추가
  let currentPage = 1;
  const pageSize = 10;
  let displayedCards: Card[] = [];

   // 필터링된 카드 목록
 $: filteredCards = cardList ? cardList.filter(card => {
      // 검색어 필터링
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            card.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 타입 필터링
      const matchesType = filterType === 'all' || card.type === filterType;
      
      // 서브타입 필터링
      const matchesSubtype = filterSubtype === 'all' || card.subtype === filterSubtype;
      
      return matchesSearch && matchesType && matchesSubtype;
    }): [];


  // 페이지네이션을 위한 추가 변수들
  $: totalPages = Math.ceil(filteredCards.length / pageSize);

  

 // 페이지별 카드 로드 함수
 function loadPageCards() {
        displayedCards = getCardsByPage(currentPage, pageSize);
    }

    // 특정 페이지의 카드 데이터를 동적으로 가져오는 함수
    function getCardsByPage(page = 1, pageSize = 50) {
        const startIndex = (page - 1) * pageSize;
        return filteredCards.slice(startIndex, startIndex + pageSize);
    }

    // 다음 페이지 로드 함수
    function nextPage() {
        if (currentPage < totalPages) {
            currentPage++;
            loadPageCards();
        }
    }

    // 이전 페이지 로드 함수
    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
            loadPageCards();
        }
    }

    // 컴포넌트 마운트 시 초기 페이지 로드
    onMount(() => {
    if (filteredCards.length > 0) {
        loadPageCards();
    } else {
        console.warn("Filtered cards is empty during onMount.");
    }
});

    // 필터 변경 시 첫 페이지로 리셋
    $: if (searchTerm || filterType || filterSubtype) {
        currentPage = 1;
        loadPageCards();
    }



    let items = filteredCards || []; // 가상 리스트로 관리
    let rowHeight = 100; // 카드 높이

    $: console.log('Total Pages:', totalPages);
    $: console.log('Current Page:', currentPage);

    // 덱에 카드 추가
    function addCardToDeck(card: Card) {
      if (selectedCards.length >= 50) {
        alert('덱은 최대 50장까지만 구성할 수 있습니다.');
        return;
      }
      
      // 같은 카드는 최대 4장까지만 추가 가능
      const countInDeck = selectedCards.filter(c => c.serial_number === card.serial_number).length;
      if (countInDeck >= 4) {
        alert('같은 카드는 덱에 최대 4장까지만 추가할 수 있습니다.');
        return;
      }
      
      // 카드의 복사본을 생성하여 덱에 추가
      const cardCopy = JSON.parse(JSON.stringify(card)) as Card;
      selectedCards = [...selectedCards, cardCopy];
    }
  
    // 덱에서 카드 제거
    function removeCardFromDeck(index: number) {
      selectedCards = selectedCards.filter((_, i) => i !== index);
    }
  
    // 덱 저장하기
    function saveDeck(): void {
      if (selectedCards.length < 50) {
        alert('덱은 정확히 50장으로 구성해야 합니다.');
        return;
      }
      
      if (!deckName.trim()) {
        alert('덱 이름을 입력해주세요.');
        return;
      }
      
      // 로컬 스토리지에 덱 저장
      const deck = {
        name: deckName,
        cards: selectedCards,
        createdAt: new Date().toISOString()
      };
      
      const savedDecks = JSON.parse(localStorage.getItem('savedDecks') || '[]');
      savedDecks.push(deck);
      localStorage.setItem('savedDecks', JSON.stringify(savedDecks));
      
      savingStatus = '덱이 성공적으로 저장되었습니다!';
      setTimeout(() => {
        savingStatus = '';
      }, 3000);
    }
  
    // 덱 초기화
    function resetDeck() {
      if (confirm('덱을 초기화하시겠습니까?')) {
        selectedCards = [];
      }
    }
  
    
    
    // 저장된 덱 불러오기
    function loadDeck(index: number) {
      if (confirm('현재 작업 중인 덱을 버리고 선택한 덱을 불러오시겠습니까?')) {
        const deck = savedDecks[index];
        deckName = deck.name;
        selectedCards = deck.cards;
      }
    }
    
    // 저장된 덱 삭제하기
    function deleteDeck(index: number) {
      if (confirm('선택한 덱을 삭제하시겠습니까?')) {
        savedDecks.splice(index, 1);
        localStorage.setItem('savedDecks', JSON.stringify(savedDecks));
        savedDecks = [...savedDecks]; // 배열 업데이트 트리거
      }
    }
  
    onMount(() => {
      // 저장된 덱 목록 불러오기
      const loadedDecks: Deck[] = JSON.parse(localStorage.getItem('savedDecks') || '[]');
      savedDecks = loadedDecks;
    });
  </script>
  
  <div class="deck-builder">
    <div class="container">
      <h1>덱 빌더</h1>
      
      <div class="layout">
        <!-- 카드 목록 섹션 -->
        <div class="card-list-section">
          <h2>카드 목록</h2>
          
          <div class="filters">
            <input 
              type="text" 
              bind:value={searchTerm} 
              placeholder="카드 이름/설명 검색..."
            />
            
            <div class="filter-group">
              <select bind:value={filterType}>
                <option value="all">모든 타입</option>
                <option value="character">캐릭터</option>
                <option value="re-birth">부활</option>
                <option value="partner">파트너</option>
              </select>
              
              <select bind:value={filterSubtype}>
                <option value="all">모든 서브타입</option>
                <option value="member">멤버</option>
                <option value="spark">스파크</option>
                <option value="guard">가드</option>
                <option value="cancel">캔슬</option>
              </select>
            </div>
          </div>
          
          <div class="card-grid">
            {#each filteredCards as card (card.serial_number)}
              <div class="card" on:click={() => addCardToDeck(card)}>
                <div class="card-image">
                  <img src={card.image_url} alt={card.name} />
                </div>
                <div class="card-info">
                  <h3>{card.name}</h3>
                  <div class="card-stats">
                    <span>ATK: {card.atk}</span>
                    <span>HP: {card.hp}</span>
                  </div>
                  <div class="card-type">
                    <span>{card.type}</span>
                    <span>{card.subtype}</span>
                  </div>
                  <p class="card-description">{card.description}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
        
        <!-- 덱 구성 섹션 -->
        <div class="deck-section">
          <h2>내 덱 ({selectedCards.length}/50)</h2>
          
          <div class="deck-header">
            <input 
              type="text" 
              bind:value={deckName} 
              placeholder="덱 이름"
              class="deck-name-input"
            />
            
            <div class="deck-actions">
              <button on:click={saveDeck} class="save-btn">저장하기</button>
              <button on:click={resetDeck} class="reset-btn">초기화</button>
            </div>
          </div>
          
          {#if savingStatus}
            <div class="save-status">{savingStatus}</div>
          {/if}
          
          <div class="deck-cards">
            {#each selectedCards as card, index (index)}
              <div class="deck-card" on:click={() => removeCardFromDeck(index)}>
                <img src={card.image_url} alt={card.name} />
                <div class="deck-card-overlay">
                  <span class="card-name">{card.name}</span>
                  <span class="remove-card">제거</span>
                </div>
              </div>
            {/each}
          </div>
          
          <!-- 카드 타입별 통계 -->
          <div class="deck-stats">
            <h3>덱 통계</h3>
            <div class="stat-item">
              <span>캐릭터:</span>
              <span>{selectedCards.filter(c => c.type === 'character').length}</span>
            </div>
            <div class="stat-item">
              <span>부활:</span>
              <span>{selectedCards.filter(c => c.type === 're-birth').length}</span>
            </div>
            <div class="stat-item">
              <span>파트너:</span>
              <span>{selectedCards.filter(c => c.type === 'partner').length}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 저장된 덱 목록 -->
      <div class="saved-decks">
        <h2>저장된 덱 목록</h2>
        
        {#if savedDecks.length === 0}
          <p>저장된 덱이 없습니다.</p>
        {:else}
          <div class="deck-list">
            {#each savedDecks as deck, index (index)}
              <div class="saved-deck">
                <div class="saved-deck-info">
                  <h3>{deck.name}</h3>
                  <span class="deck-date">
                    {new Date(deck.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div class="saved-deck-actions">
                  <button on:click={() => loadDeck(index)} class="load-btn">불러오기</button>
                  <button on:click={() => deleteDeck(index)} class="delete-btn">삭제</button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
  
  <style>
    .deck-builder {
      font-family: Arial, sans-serif;
      color: #333;
      background-color: #f5f5f5;
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1, h2, h3 {
      margin-bottom: 1rem;
    }
    
    .layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    /* 카드 목록 스타일 */
    .card-list-section {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .filters {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .filter-group {
      display: flex;
      gap: 10px;
    }
    
    input, select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
      max-height: 600px;
      overflow-y: auto;
    }
    
    .card {
      background-color: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s;
      cursor: pointer;
    }
    
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    
    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .card-info {
      padding: 10px;
    }
    
    .card-stats, .card-type {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 12px;
    }
    
    .card-description {
      font-size: 12px;
      color: #666;
    }
    
    /* 덱 구성 스타일 */
    .deck-section {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .deck-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    
    .deck-name-input {
      flex: 1;
      margin-right: 10px;
    }
    
    .deck-actions {
      display: flex;
      gap: 10px;
    }
    
    button {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }
    
    .save-btn {
      background-color: #4CAF50;
      color: white;
    }
    
    .reset-btn {
      background-color: #f44336;
      color: white;
    }
    
    .save-status {
      padding: 10px;
      background-color: #e8f5e9;
      color: #2e7d32;
      border-radius: 4px;
      margin-bottom: 15px;
    }
    
    .deck-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 10px;
      max-height: 400px;
      overflow-y: auto;
      margin-bottom: 20px;
    }
    
    .deck-card {
      position: relative;
      height: 140px;
      border: 1px solid #ddd;
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
    }
    
    .deck-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .deck-card-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(0,0,0,0.7);
      color: white;
      padding: 5px;
      font-size: 12px;
      display: flex;
      flex-direction: column;
    }
    
    .remove-card {
      color: #ff5252;
      font-weight: bold;
    }
    
    .deck-stats {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 6px;
    }
    
    .stat-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }
    
    /* 저장된 덱 목록 스타일 */
    .saved-decks {
      margin-top: 30px;
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .deck-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
    }
    
    .saved-deck {
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 15px;
      display: flex;
      flex-direction: column;
    }
    
    .saved-deck-info {
      flex: 1;
      margin-bottom: 10px;
    }
    
    .deck-date {
      font-size: 12px;
      color: #666;
    }
    
    .saved-deck-actions {
      display: flex;
      gap: 10px;
    }
    
    .load-btn {
      background-color: #2196F3;
      color: white;
    }
    
    .delete-btn {
      background-color: #f44336;
      color: white;
    }
    
    /* 반응형 디자인 */
    @media (max-width: 768px) {
      .layout {
        grid-template-columns: 1fr;
      }
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

<div class="pagination">
  <button on:click={prevPage} disabled={currentPage === 1}>이전</button>
  <span>{currentPage} / {totalPages}</span>
  <button on:click={nextPage} disabled={currentPage === totalPages}>다음</button>
</div>


<div class="header-actions">
    <a href="/" class="back-btn">메인 화면으로 돌아가기</a>
</div>

{#if isLoading}
  <p>로딩 중...</p>
{:else}
  {#each displayedCards as card}
    <!-- 카드 렌더링 -->
  {/each}
{/if}

<VirtualList
    items={items}
    rowHeight={rowHeight}
    {currentPage}
    {pageSize}
    let:item>
    <div class="card">
        <!-- 카드 내용 렌더링 -->
    </div>
</VirtualList>