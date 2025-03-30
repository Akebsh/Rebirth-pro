<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  // ★★★ socket 인스턴스를 가져올 방법 필요 (예: layout에서 만든 socket을 store로 관리) ★★★
  import { socket } from '$lib/stores/socketStore'; // 가상의 스토어 경로
  import { gameInfo } from '$lib/stores/gameStore'; // 가상의 게임 정보 스토어

  let isFindingMatch = false; // 매칭 중 상태 표시용

  function findMatch() {
    if ($socket && $socket.connected && !isFindingMatch) {
      console.log('[Socket Client] 서버로 findMatch 요청 보냄');
      $socket.emit('findMatch'); // 서버로 이벤트 전송
      isFindingMatch = true; // 매칭 시작 상태로 변경
    } else if (isFindingMatch) {
       console.log("이미 매칭 중입니다...");
    } else {
        console.error("소켓이 연결되지 않았습니다.");
    }
  }

  function cancelFindMatch() {
    if ($socket && $socket.connected && isFindingMatch) {
        console.log('[Socket Client] 서버로 cancelFindMatch 요청 보냄');
        $socket.emit('cancelFindMatch'); // 서버에 취소 요청
        isFindingMatch = false; // 즉시 상태 변경 (UX 개선)
    } else {
        console.error("소켓이 연결되지 않았거나 매칭 중이 아닙니다.");
    }
  }


  onMount(() => {
      // 이 컴포넌트가 마운트될 때 서버로부터 오는 'matchFound' 이벤트 리스너 설정
      // (주의: 이 리스너는 socket 연결이 설정된 후에 추가되어야 함 - layout에서 처리하거나,
      //       socket 스토어 구독을 통해 socket이 null이 아닐 때 리스너 추가)

      // socketStore 구독을 통해 리스너 설정 예시
      const unsubscribe = socket.subscribe(currentSocket => {
          if (currentSocket) {
              currentSocket.on('matchFound', (data) => {
                  console.log('[Socket Client] 매치 발견!', data);
                  // 받은 게임 정보를 스토어에 저장
                  gameInfo.set({
                      gameId: data.gameId,
                      myPlayerNum: data.yourPlayerNum,
                      opponentId: data.opponentId
                  });
                  isFindingMatch = false; // 매칭 완료 상태로 변경
                  goto('/game'); // 게임 화면으로 이동
              });

              currentSocket.on('waitingForOpponent', () => {
                  console.log('[Socket Client] 상대방을 기다리는 중...');
                  // TODO: 사용자에게 대기 중임을 알리는 UI 업데이트
              });

              // 컴포넌트 파괴 시 리스너 제거 (메모리 누수 방지) - layout에서 연결 해제하므로 불필요할 수도 있음
              // return () => {
              //     currentSocket.off('matchFound');
              //     currentSocket.off('waitingForOpponent');
              // }
          }
      });

      // onDestroy에 unsubscribe 추가 필요 시
      // onDestroy(unsubscribe);
  });
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
      {#if !isFindingMatch}
        <button on:click={findMatch}>
          게임 찾기
        </button>
      {:else}
        <button on:click={cancelFindMatch} class="secondary">
          매칭 취소
        </button>
      {/if}
      <button on:click={createRoom}>방 생성</button>
      <button on:click={createDeck}>덱 생성</button>
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