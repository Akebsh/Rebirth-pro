<script lang="ts">
    import { goto } from '$app/navigation';
    
    function startGame() {
      goto('/game');  // 게임 화면으로 이동
    }

    function createDeck() {
      goto('/deck');
    }

    function createRoom() {
      goto('/room');
    }
  </script>
  
  <main>
    <h1>프로젝트 리버스 프로</h1>
    <div class="menu">
      <button on:click={startGame}>게임 시작</button>
      <button on:click={createRoom}>방 생성</button>
      <button on:click={createDeck}>덱 생성</button>
      <!-- 다른 메뉴 버튼들 -->
    </div>
  </main>
  
  <style>
    main {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    
    .menu {
      margin-top: 2rem;
    }
    
    button {
      padding: 0.8rem 1.5rem;
      font-size: 1.2rem;
      cursor: pointer;
    }
  </style>