// server.ts
import express from "express";
import http from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import cors from "cors";
import { v4 as uuidv4 } from "uuid"; // uuid import

const app = express();
const server = http.createServer(app); // Express 앱으로 http 서버 생성

// Socket.IO 서버 설정 (CORS 설정 포함)
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // ★ 개발 중에는 모든 출처 허용 (*), 배포 시에는 Svelte 앱 주소로 변경!
    methods: ["GET", "POST"],
  },
});

// (선택) CORS 미들웨어 사용 (Express 경로 사용 시)
app.use(cors());

const PORT = process.env.PORT || 3000; // 서버 포트 설정 (기본 3000)

// 기본 경로 설정 (테스트용)
app.get("/", (req, res) => {
  res.send("카드 게임 서버 실행 중!");
});

// Socket.IO 연결 처리
io.on("connection", (socket) => {
  console.log(`[Socket Connected] 유저 접속: ${socket.id}`); // 연결된 소켓의 고유 ID 출력

  // 연결 해제 처리
  socket.on("disconnect", () => {
    console.log(`[Socket Disconnected] 유저 연결 해제: ${socket.id}`);
    // TODO: 연결 해제 시 필요한 로직 (예: 게임 방에서 나가기)
  });

  // TODO: 클라이언트로부터 메시지(이벤트) 수신 및 처리 로직 추가
  // 예: socket.on('findMatch', () => { ... });
  // 예: socket.on('playerAction', (actionData) => { ... });
});

// ★★★ 매치메이킹 관련 변수 추가 ★★★
let waitingPlayers: string[] = []; // 대기 중인 플레이어의 socket.id 저장 배열

io.on("connection", (socket: Socket) => {
  console.log(`[Socket Connected] 유저 접속: ${socket.id}`);

  // ★★★ 'findMatch' 이벤트 리스너 추가 ★★★
  socket.on("findMatch", () => {
    console.log(`[findMatch] 요청 받음: ${socket.id}`);

    // 이미 대기열에 있는지 확인 (중복 방지)
    if (waitingPlayers.includes(socket.id)) {
      console.log(`[findMatch] ${socket.id} 는 이미 대기 중입니다.`);
      return; // 이미 대기 중이면 아무것도 안 함
    }

    // 대기열에 추가
    waitingPlayers.push(socket.id);
    console.log("[Waiting Queue] 현재 대기열:", waitingPlayers);

    // 대기열에 2명 이상 있으면 매칭 시도
    if (waitingPlayers.length >= 2) {
      // 대기열에서 2명 추출
      const player1Id = waitingPlayers.shift()!; // non-null assertion (!) 사용 또는 undefined 체크
      const player2Id = waitingPlayers.shift()!;
      const gameId = uuidv4(); // 고유 게임 ID 생성

      console.log(
        `[Match Found!] ${player1Id} vs ${player2Id}, Game ID: ${gameId}`
      );

      // (선택) 두 플레이어를 같은 방(room)에 참가시키기
      const socket1 = io.sockets.sockets.get(player1Id);
      const socket2 = io.sockets.sockets.get(player2Id);

      if (socket1 && socket2) {
        socket1.join(gameId);
        socket2.join(gameId);

        // 각 플레이어에게 매칭 정보 및 게임 시작 정보 전송
        // 플레이어 1에게 전송
        socket1.emit("matchFound", {
          gameId: gameId,
          yourPlayerNum: 1, // 당신은 플레이어 1
          opponentId: player2Id,
        });

        // 플레이어 2에게 전송
        socket2.emit("matchFound", {
          gameId: gameId,
          yourPlayerNum: 2, // 당신은 플레이어 2
          opponentId: player1Id,
        });

        // TODO: 서버 측에 게임 상태 객체 생성 및 초기화 로직 추가
        // games[gameId] = { player1: player1Id, player2: player2Id, turn: 1, ... }
      } else {
        console.error("매칭된 소켓 중 하나를 찾을 수 없습니다.");
        // TODO: 플레이어를 다시 대기열에 넣는 등의 오류 처리
      }
    } else {
      // 상대방 기다리는 중 알림 (선택 사항)
      socket.emit("waitingForOpponent");
      console.log(`[findMatch] ${socket.id} 상대방 대기 중...`);
    }
  });

  // ★★★ 'cancelFindMatch' 이벤트 리스너 추가 ★★★
  socket.on("cancelFindMatch", () => {
    console.log(`[cancelFindMatch] 요청 받음: ${socket.id}`);
    // 대기열에서 해당 유저 제거
    const index = waitingPlayers.indexOf(socket.id);
    if (index !== -1) {
      waitingPlayers.splice(index, 1); // 배열에서 제거
      console.log(
        `[Waiting Queue] ${socket.id} 제거됨. 현재 대기열:`,
        waitingPlayers
      );
      // (선택사항) 클라이언트에게 취소 확인 메시지 보내기
      // socket.emit('matchmakingCanceled');
    } else {
      console.log(`[cancelFindMatch] ${socket.id} 는 대기열에 없습니다.`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket Disconnected] 유저 연결 해제: ${socket.id}`);
    // 연결 끊기면 대기열에서도 제거
    const index = waitingPlayers.indexOf(socket.id);
    if (index !== -1) {
      waitingPlayers.splice(index, 1);
      console.log(
        `[Waiting Queue] 연결 해제로 ${socket.id} 제거됨. 현재 대기열:`,
        waitingPlayers
      );
    }
    // TODO: 게임 중이었다면 상대방에게 알림 등 처리
  });

  // ... (다른 이벤트 리스너들) ...
});

server.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
