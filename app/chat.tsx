import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, Phone, MoveVertical as MoreVertical, User as UserIcon } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'delivery' | 'admin' | 'support';
  message: string;
  timestamp: string;
  type: 'text' | 'system' | 'image';
}

interface ChatRoom {
  id: string;
  participants: string[];
  deliveryId?: string;
  type: 'delivery' | 'support';
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export default function ChatScreen() {
  const { user } = useAuth();
  const { roomId, deliveryId, supportTicket } = useLocalSearchParams<{
    roomId?: string;
    deliveryId?: string;
    supportTicket?: string;
  }>();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadChatData();
    
    // Simular mensajes en tiempo real
    const interval = setInterval(() => {
      // En una implementación real, esto sería WebSocket o similar
      if (Math.random() > 0.95) { // 5% de probabilidad cada segundo
        addMockMessage();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [roomId, deliveryId, supportTicket]);

  const loadChatData = async () => {
    try {
      // Simular carga de datos del chat
      let mockRoom: ChatRoom;
      let mockMessages: ChatMessage[] = [];

      if (supportTicket) {
        // Chat de soporte
        mockRoom = {
          id: 'support-' + supportTicket,
          participants: [user!.id, 'support-agent-1'],
          type: 'support',
          unreadCount: 0,
        };

        mockMessages = [
          {
            id: '1',
            senderId: 'support-agent-1',
            senderName: 'Agente de Soporte',
            senderRole: 'support',
            message: '¡Hola! Soy María del equipo de soporte. ¿En qué puedo ayudarte hoy?',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            type: 'text',
          },
          {
            id: '2',
            senderId: user!.id,
            senderName: user!.name,
            senderRole: user!.role,
            message: 'Hola, tengo un problema con mi última entrega',
            timestamp: new Date(Date.now() - 240000).toISOString(),
            type: 'text',
          },
          {
            id: '3',
            senderId: 'support-agent-1',
            senderName: 'Agente de Soporte',
            senderRole: 'support',
            message: 'Entiendo tu preocupación. ¿Podrías darme más detalles sobre qué ocurrió?',
            timestamp: new Date(Date.now() - 180000).toISOString(),
            type: 'text',
          },
        ];
      } else if (deliveryId) {
        // Chat de entrega
        mockRoom = {
          id: 'delivery-' + deliveryId,
          participants: [user!.id, 'other-user'],
          deliveryId,
          type: 'delivery',
          unreadCount: 0,
        };

        mockMessages = [
          {
            id: '1',
            senderId: 'system',
            senderName: 'Sistema',
            senderRole: 'admin',
            message: 'Chat iniciado para la entrega #' + deliveryId.slice(-6),
            timestamp: new Date(Date.now() - 600000).toISOString(),
            type: 'system',
          },
          {
            id: '2',
            senderId: user!.role === 'delivery' ? 'user-123' : 'delivery-456',
            senderName: user!.role === 'delivery' ? 'Juan Pérez' : 'María García',
            senderRole: user!.role === 'delivery' ? 'user' : 'delivery',
            message: 'Hola, ¿cómo va la entrega?',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            type: 'text',
          },
          {
            id: '3',
            senderId: user!.id,
            senderName: user!.name,
            senderRole: user!.role,
            message: user!.role === 'delivery' 
              ? 'Todo bien, estoy en camino al punto de recogida'
              : 'Perfecto, estaré esperando',
            timestamp: new Date(Date.now() - 240000).toISOString(),
            type: 'text',
          },
        ];
      }

      setChatRoom(mockRoom!);
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMockMessage = () => {
    if (messages.length > 0 && Math.random() > 0.5) {
      const otherParticipant = chatRoom?.type === 'support' 
        ? { id: 'support-agent-1', name: 'Agente de Soporte', role: 'support' as const }
        : { id: 'other-user', name: 'Otro Usuario', role: (user?.role === 'delivery' ? 'user' : 'delivery') as const };

      const mockMessages = [
        '¿Necesitas algo más?',
        'Perfecto, gracias',
        'Estoy llegando en 5 minutos',
        'Todo listo por aquí',
        'Gracias por la información',
      ];

      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        senderId: otherParticipant.id,
        senderName: otherParticipant.name,
        senderRole: otherParticipant.role,
        message: mockMessages[Math.floor(Math.random() * mockMessages.length)],
        timestamp: new Date().toISOString(),
        type: 'text',
      };

      setMessages(prev => [...prev, newMsg]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: user!.id,
      senderName: user!.name,
      senderRole: user!.role,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simular respuesta automática en chat de soporte
    if (chatRoom?.type === 'support') {
      setTimeout(() => {
        const autoReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          senderId: 'support-agent-1',
          senderName: 'Agente de Soporte',
          senderRole: 'support',
          message: 'Gracias por tu mensaje. Estoy revisando tu caso y te responderé en breve.',
          timestamp: new Date().toISOString(),
          type: 'text',
        };
        setMessages(prev => [...prev, autoReply]);
      }, 2000);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.senderId === user?.id;
    const isSystemMessage = item.type === 'system';

    if (isSystemMessage) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.message}</Text>
        </View>
      );
    }

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        {!isOwnMessage && (
          <View style={styles.senderInfo}>
            <View style={[styles.senderAvatar, { backgroundColor: getSenderColor(item.senderRole) }]}>
              <UserIcon size={12} color="#FFFFFF" />
            </View>
            <Text style={styles.senderName}>{item.senderName}</Text>
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.message}
          </Text>
        </View>
        <Text style={styles.messageTime}>
          {new Date(item.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    );
  };

  const getSenderColor = (role: string) => {
    switch (role) {
      case 'support': return '#7C3AED';
      case 'delivery': return '#059669';
      case 'admin': return '#DC2626';
      default: return '#3B82F6';
    }
  };

  const getHeaderTitle = () => {
    if (chatRoom?.type === 'support') {
      return 'Soporte Técnico';
    } else if (chatRoom?.deliveryId) {
      return `Entrega #${chatRoom.deliveryId.slice(-6)}`;
    }
    return 'Chat';
  };

  if (loading) {
    return (
      <AuthGuard>
        <View style={styles.loadingContainer}>
          <Text>Cargando chat...</Text>
        </View>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Stack.Screen
        options={{
          headerShown: true,
          title: getHeaderTitle(),
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerActions}>
              {chatRoom?.type === 'delivery' && (
                <TouchableOpacity style={styles.headerAction}>
                  <Phone size={20} color="#374151" />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.headerAction}>
                <MoreVertical size={20} color="#374151" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Escribe un mensaje..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    padding: 8,
    marginLeft: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  ownMessageBubble: {
    backgroundColor: '#2563EB',
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
});