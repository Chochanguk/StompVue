import { Client } from '@stomp/stompjs';

let stompClient = null;       // ➤ 채팅방 전용 STOMP
let stompClientGlobal = null;     // ➤ 공용 삭제 이벤트 STOMP

/** ================================
 *   1) 채팅방 구독 (기존)
 * ================================= */
export const connectStomp = (roomId, onMessageReceived) => {
  console.log('Opening Web Socket for room...');

  stompClient = new Client({
    brokerURL: 'ws://70.12.107.53:8080/ws-chat',
    reconnectDelay: 5000,
    debug: (msg) => console.log(msg),

    onConnect: () => {
      console.log('🔥 STOMP 룸 연결 성공');

      const topic = `/topic/room.${roomId}`;

      stompClient.subscribe(topic, (message) => {
        const body = JSON.parse(message.body);
        onMessageReceived(body);
      });
    },

    onStompError: (frame) => {
      console.error('❌ STOMP Error:', frame.headers['message'], frame.body);
    },
    onWebSocketClose: () => {
      console.log('💥 WebSocket closed (room)');
    },
  });

  stompClient.activate();
};

/** ================================
 *   2) 공용 삭제 이벤트 구독 (/topic/rooms)
 * ================================= */
export const connectStompGlobal = (onRoomDeleted) => {
  stompClientGlobal = new Client({
    brokerURL: 'ws://70.12.107.53:8080/ws-chat',
    reconnectDelay: 5000,
    debug: (msg) => console.log("[GLOBAL]", msg),

    onConnect: () => {
      console.log("🌐 GLOBAL STOMP 연결됨");

      stompClientGlobal.subscribe("/topic/rooms", (message) => {
        const deletedRoomId = JSON.parse(message.body);
        console.log("🚨 방 삭제 이벤트 수신:", deletedRoomId);
        onRoomDeleted(deletedRoomId);
      });
    }
  });

  stompClientGlobal.activate();
};


/** ================================
 *   3) 연결 종료
 * ================================= */
export const disconnectStomp = () => {
  if (stompClient && stompClient.active) {
    stompClient.deactivate();
    console.log('🔌 STOMP 룸 연결 종료');
  }
};

/** ================================
 *   4) 메시지 발송
 * ================================= */
export const sendMessage = (payload) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(payload),
    });
  }
};
