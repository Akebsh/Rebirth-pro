<script lang="ts">
    import { onMount } from 'svelte';
    import { cardDatabase, getCardDefinition, type CardDefinition } from '$lib/data/cardDatabase'; 

   // --- 타입 정의 ---
  // 덱에 저장될 카드 항목 타입 (카드 종류와 개수만 저장)
  interface DeckEntry {
    serial_number: string;
    count: number;
  }
  // 저장될 덱 데이터 타입
  interface Deck {
    name: string;
    cards: DeckEntry[]; // ★ 타입 변경!
    createdAt: string;
  }
  let isLoading = false;
  let selectedCards: DeckEntry[] = []; // ★ 타입 변경! (현재 만들고 있는 덱)
  let searchTerm = '';
  let filterType: CardDefinition['type'] | 'all' = 'all'; // ★ Card -> CardDefinition
  let filterSubtype: CardDefinition['subtype'] | 'all' = 'all'; // ★ Card -> CardDefinition
  let deckName = '새 덱';
  let savingStatus = '';
  let savedDecks: Deck[] = [];


// 1. cardDatabase에 의존 (가장 먼저 계산됨)
$: allCardEntries = Object.entries(cardDatabase) as [string, CardDefinition][];

// 2. allCardEntries, searchTerm, filterType, filterSubtype에 의존
$: filteredCards = allCardEntries.filter(([serial, cardDef]) => {
  const matchesSearch = cardDef.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       cardDef.description.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesType = filterType === 'all' || cardDef.type === filterType;
  const matchesSubtype = filterSubtype === 'all' || cardDef.subtype === filterSubtype;
  return matchesSearch && matchesType && matchesSubtype;
});


// 4. filteredCards에 의존 (페이지네이션 관련)
$: totalPages = Math.ceil(filteredCards.length / pageSize);

let currentPage = 1;
const pageSize = 50;
let displayedCards: [string, CardDefinition][] = [];

  function loadPageCards() {
      const startIndex = (currentPage - 1) * pageSize;
      displayedCards = filteredCards.slice(startIndex, startIndex + pageSize);
  }
  function nextPage() { if (currentPage < totalPages) { currentPage++; loadPageCards(); } }
  function prevPage() { if (currentPage > 1) { currentPage--; loadPageCards(); } }

  // 필터/검색어 변경 시 또는 처음 로드 시 페이지 카드 업데이트
  $: if (filteredCards) { // filteredCards가 준비되면 실행
      currentPage = 1; // 필터 변경 시 첫 페이지로
      loadPageCards();
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

   
    let rowHeight = 100; // 카드 높이

    $: console.log('Total Pages:', totalPages);
    $: console.log('Current Page:', currentPage);




    // 현재 덱의 총 카드 수 계산
  $: totalCardsInDeck = selectedCards.reduce((sum, entry) => sum + entry.count, 0);

  // 덱에 카드 추가 (CardDefinition을 인자로 받음)
  function addCardToDeck(serialNumberToAdd: string) { // ★ 인자를 serial_number 문자열로 받음
    const totalCardsInDeck = selectedCards.reduce((sum, entry) => sum + entry.count, 0);
    if (totalCardsInDeck >= 53) {
        alert('덱은 최대 53장까지만 구성할 수 있습니다.');
        return;
    }

    // 인자로 받은 serialNumberToAdd 사용
    const existingEntry = selectedCards.find(entry => entry.serial_number === serialNumberToAdd);

    if (existingEntry) { // 이미 덱에 있는 카드 종류
        if (existingEntry.count < 4) { // 4장 제한 체크
            existingEntry.count++;
            selectedCards = [...selectedCards]; // 변경 감지
        } else {
            alert('같은 카드는 덱에 최대 4장까지만 추가할 수 있습니다.');
        }
    } else { // 처음 추가하는 카드 종류
        // 인자로 받은 serialNumberToAdd 직접 사용
        selectedCards = [...selectedCards, { serial_number: serialNumberToAdd, count: 1 }];
    }
}

  // 덱에서 카드 제거 (serial_number를 인자로 받음)
  function removeCardFromDeck(serialNumberToRemove: string) {
    const entryIndex = selectedCards.findIndex(entry => entry.serial_number === serialNumberToRemove);
    if (entryIndex !== -1) {
      selectedCards[entryIndex].count--;
      if (selectedCards[entryIndex].count <= 0) {
        selectedCards = selectedCards.filter((_, index) => index !== entryIndex);
      } else {
        selectedCards = [...selectedCards];
      }
    }
  }
  // 덱 저장하기
  function saveDeck(): void {
    // ★ 50장 체크 로직 변경
    if (totalCardsInDeck !== 53) {
      alert('덱은 정확히 53장으로 구성해야 합니다.');
      return;
    }
    if (!deckName.trim()) {
      alert('덱 이름을 입력해주세요.');
      return;
    }

    const deckToSave: Deck = { // ★ Deck 타입 사용
      name: deckName.trim(),
      cards: selectedCards, // ★ 이제 DeckEntry[] 타입
      createdAt: new Date().toISOString()
    };

    try {
        const currentSavedDecks: Deck[] = JSON.parse(localStorage.getItem('savedDecks') || '[]');
        // TODO: 만약 같은 이름의 덱이 있다면 덮어쓰기 또는 다른 이름 요구 로직 추가?
        currentSavedDecks.push(deckToSave);
        localStorage.setItem('savedDecks', JSON.stringify(currentSavedDecks));
        savedDecks = currentSavedDecks; // 화면 목록 업데이트
        savingStatus = '덱이 성공적으로 저장되었습니다!';
    } catch (e) {
        console.error("덱 저장 실패:", e);
        savingStatus = '덱 저장 중 오류가 발생했습니다.';
    } finally {
        setTimeout(() => { savingStatus = ''; }, 3000);
    }
  }

  // 덱 초기화
  function resetDeck() {
    if (confirm('현재 작업 중인 덱을 초기화하시겠습니까?')) {
      selectedCards = [];
      deckName = '새 덱'; // 덱 이름도 초기화
    }
  }
    
    
   // 저장된 덱 불러오기
  function loadDeck(index: number) {
    if (index < 0 || index >= savedDecks.length) return;
    // ★ 경고: 이전 버전에서 저장된 덱은 형식이 달라 문제가 발생할 수 있음!
    if (confirm('현재 작업 중인 덱을 버리고 선택한 덱을 불러오시겠습니까? (이전 버전 덱은 오류가 날 수 있습니다)')) {
      const deckToLoad = savedDecks[index];
      // 불러온 데이터 형식이 DeckEntry[] 인지 간단히 확인 (더 확실한 검증 필요)
      if (Array.isArray(deckToLoad.cards) && (deckToLoad.cards.length === 0 || (deckToLoad.cards[0] && typeof deckToLoad.cards[0].serial_number === 'string'))) {
          deckName = deckToLoad.name;
          // ★ 깊은 복사를 통해 새 배열 할당 (원본 localStorage 데이터 보호)
          selectedCards = JSON.parse(JSON.stringify(deckToLoad.cards));
      } else {
          alert('선택한 덱 데이터 형식이 올바르지 않아 불러올 수 없습니다.');
      }
    }
  }

  // 저장된 덱 삭제하기
  function deleteDeck(index: number) {
    if (confirm('선택한 덱을 삭제하시겠습니까?')) {
      savedDecks.splice(index, 1);
      localStorage.setItem('savedDecks', JSON.stringify(savedDecks));
      savedDecks = [...savedDecks]; // 배열 업데이트 강제
    }
  }

  // 컴포넌트 마운트 시 저장된 덱 목록 불러오기
  onMount(() => {
    try {
        const loadedDecks: Deck[] = JSON.parse(localStorage.getItem('savedDecks') || '[]');
        // ★ 데이터 형식 검증 로직 추가하면 더 안전함
        savedDecks = loadedDecks;
    } catch (e) {
        console.error("저장된 덱 목록 로딩 실패:", e);
        savedDecks = [];
    }
  });
  </script>
  
  
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

<div class="deck-builder">
  <div class="container">
    <h1>덱 빌더</h1>
    <div class="layout">

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
        


       
        <div class="pagination">
          <button on:click={prevPage} disabled={currentPage <= 1}>이전</button>
          <span>페이지 {currentPage} / {totalPages}</span>
          <button on:click={nextPage} disabled={currentPage >= totalPages}>다음</button>
        </div>
       

        
        <div class="card-grid">
          {#each displayedCards as [serial, cardDef] (serial)} 
            <div class="card" on:click={() => addCardToDeck(serial)}> 
              <div class="card-image">
                <img src={cardDef.image_url} alt={cardDef.name} />
              </div>
              <div class="card-info">
                <h3>{cardDef.name}</h3>
                <div class="card-stats">
                  <span>ATK: {cardDef.atk}</span>
                  <span>HP: {cardDef.hp}</span>
                </div>
                <div class="card-type">
                  <span>{cardDef.type}</span>
                  <span>{cardDef.subtype}</span>
                </div>
                <p class="card-description">{cardDef.description}</p>
              </div>
            </div>
          {/each}
        </div>
       

      </div> 


      <div class="deck-section">
        <h2>내 덱 ({totalCardsInDeck}/53)</h2>

        
        <div class="deck-header">
          <input
            type="text"
            bind:value={deckName}
            placeholder="덱 이름"
            class="deck-name-input"
            aria-label="덱 이름 입력"
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
          {#each selectedCards as entry (entry.serial_number)}
            {@const cardDef = getCardDefinition(entry.serial_number)}
            {#if cardDef}
              <div class="deck-card" on:click={() => removeCardFromDeck(entry.serial_number)} title={cardDef.description}>
                <img src={cardDef.image_url} alt={cardDef.name} />
                <div class="deck-card-overlay">
                  <span class="card-name">{cardDef.name} (x{entry.count})</span>
                  <span class="remove-card">제거</span>
                </div>
              </div>
            {/if}
          {/each}
        </div>
       


      
        <div class="deck-stats">
          <h3>덱 통계</h3>
          {#each ['character', 're-birth', 'partner'] as typeName}
            {@const count = selectedCards.reduce((sum, entry) => {
                const def = getCardDefinition(entry.serial_number);
                return def && def.type === typeName ? sum + entry.count : sum;
            }, 0)}
            {#if count > 0}
              <div class="stat-item">
                <span>{typeName}:</span>
                <span>{count}</span>
              </div>
            {/if}
          {/each}
        </div>
       

      </div> 
    </div> 

    <div class="saved-decks">
      <h2>저장된 덱 목록</h2>
      {#if savedDecks.length === 0}
        <p>저장된 덱이 없습니다.</p>
      {:else}
        <div class="deck-list">
          {#each savedDecks as deck, index (deck.createdAt + deck.name)}
            <div class="saved-deck">
              
               <div class="saved-deck-info">
                   <h3>{deck.name}</h3>
                   {#if deck.createdAt}
                       <span class="deck-date">
                           {new Date(deck.createdAt).toLocaleDateString()}
                       </span>
                   {/if}
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

<div class="header-actions">
    <a href="/" class="back-btn">메인 화면으로 돌아가기</a>
</div>