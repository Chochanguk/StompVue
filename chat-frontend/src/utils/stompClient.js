import { Client } from '@stomp/stompjs';

let stompClient = null;

export const connectStomp = (roomId, onMessageReceived) => {
  console.log('Opening Web Socket...');

  stompClient = new Client({
    brokerURL: 'ws://localhost:8080/ws-chat',
    reconnectDelay: 5000,
    debug: (msg) => console.log(msg),

    onConnect: () => {
      console.log('🔥 STOMP 연결 성공');

      const topic = `/topic/room.${roomId}`;   // ✅ 여기만 변경

      stompClient.subscribe(topic, (message) => {
        const body = JSON.parse(message.body);
        onMessageReceived(body);
      });
    },

    onStompError: (frame) => {
      console.error('❌ STOMP Error:', frame.headers['message'], frame.body);
    },
    onWebSocketClose: () => {
      console.log('💥 WebSocket closed');
    },
  });

  stompClient.activate();
};


export const disconnectStomp = () => {
  if (stompClient && stompClient.active) {
    stompClient.deactivate();
    console.log('🔌 STOMP 연결 종료');
  }
};

export const sendMessage = (payload) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(payload),
    });
  }
};
