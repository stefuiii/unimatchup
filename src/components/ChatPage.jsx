import React, { useState, useEffect, useRef } from 'react';
import {
  ChakraProvider,
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Avatar,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Heading
} from '@chakra-ui/react';
import { ArrowRightIcon } from '@chakra-ui/icons';
import dayjs from 'dayjs';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, database } from '../firebase-config';
import { useParams } from 'react-router-dom';

export const ChatPage = () => {
  const { chatRoomId } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [eventDetails, setEventDetails] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const messagesEndRef = useRef(null);
  const user = auth.currentUser;

  useEffect(() => {
    console.log('ChatRoomId:', chatRoomId); 
    let unsubscribe;

    const fetchChatData = async () => {
      if (!chatRoomId) {
        console.error('chatRoomId is undefined or null');
        return;
      }

      console.log('User object:', user);

      if (user) {
        const userProfileRef = doc(database, 'userProfile', user.uid);
        const userProfileDoc = await getDoc(userProfileRef);
        if (userProfileDoc.exists()) {
          setUserProfile(userProfileDoc.data());
        } else {
          console.error('User profile not found');
        }
      }

      const messagesRef = collection(database, 'chatRooms', chatRoomId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const msgs = [];
        querySnapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() });
        });
        setMessages(msgs);
      });

      const chatRoomRef = doc(database, 'chatRooms', chatRoomId);
      const chatRoomDoc = await getDoc(chatRoomRef);
      const chatRoomData = chatRoomDoc.data();
      if (chatRoomData) {
        const { postId, collection: eventCollection } = chatRoomData; 

        console.log('Event Collection:', eventCollection);
        console.log('Post ID:', postId);

        if (eventCollection && postId) {
          try {
            const eventRef = doc(database, eventCollection, postId);
            const eventDoc = await getDoc(eventRef);
            if (eventDoc.exists()) {
              setEventDetails(eventDoc.data());
            } else {
              console.error('Event not found');
            }
          } catch (error) {
            console.error('Error fetching event details:', error);
          }
        } else {
          console.error('Invalid collection or postId');
        }
        
        const participantPromises = chatRoomData.members.map(async (uid) => {
          const userProfileRef = doc(database, 'userProfile', uid);
          const userProfileDoc = await getDoc(userProfileRef);
          return userProfileDoc.data();
        });
        const participantData = await Promise.all(participantPromises);
        setParticipants(participantData);
      }
    };

    fetchChatData();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [chatRoomId, user]);

  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (chatRoomId) {
        const chatRoomRef = doc(database, 'chatRooms', chatRoomId);
        await updateDoc(chatRoomRef, {
          [`unreadMessages.${user.uid}`]: 0
        });
      }
    };
  
    markMessagesAsRead();
  }, [chatRoomId, user]);
  

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        const senderName = userProfile ? userProfile.nickName : 'Anonymous'; 
        const chatRoomRef = doc(database, 'chatRooms', chatRoomId);
        const chatRoomDoc = await getDoc(chatRoomRef);
        const chatRoomData = chatRoomDoc.data();
        const updatedUnreadMessages = { ...chatRoomData.unreadMessages };
  
        chatRoomData.members.forEach(member => {
          if (member !== user.uid) {
            updatedUnreadMessages[member] = (updatedUnreadMessages[member] || 0) + 1;
          }
        });

        console.log('Sending message with sender:', senderName);
        console.log('Message content:', message);
  
        if (!senderName || !message) {
          console.error('Invalid data: sender or message is undefined');
          return;
        }
  
        await addDoc(collection(database, 'chatRooms', chatRoomId, 'messages'), {
          sender: senderName,
          text: message,
          timestamp: Timestamp.fromDate(new Date())
        });

        await updateDoc(doc(database, 'chatRooms', chatRoomId), {
            lastMessage: message,
            lastMessageSender: senderName,
            lastMessageTime: Timestamp.fromDate(new Date()),
            unreadMessages: updatedUnreadMessages
          });

        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    } else {
      console.error('Message is empty');
    }
  };
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <ChakraProvider>
      <Flex minH="100vh" p={5} bg="#FFEFDA">
        {/* Event Info Box */}
        <Box bg="white" p={5} borderRadius="md" boxShadow="md" w="20%" mr={5}>
          <Heading size="md" mb={4}>Event Info</Heading>
          {eventDetails ? (
            <>
              <Text>
               <Text as="span" fontWeight="bold">Event: </Text> {eventDetails.Title}
              </Text>
              <Text>
               <Text as="span" fontWeight="bold">Time: </Text> {dayjs(eventDetails.Date.toDate()).format('HH:mm DD MMM')}
              </Text>
              <Text>
               <Text as="span" fontWeight="bold">Location: </Text> {eventDetails.Location}
              </Text>
              <Text>
               <Text as="span" fontWeight="bold">Description: </Text> {eventDetails.Description}
              </Text>
            </>
          ) : (
            <Text>Loading...</Text>
          )}
        </Box>

        {/* Main Chat Box */}
        <Flex direction="column" bg="white" p={5} borderRadius="md" boxShadow="md" flex="1" mx={5}>
          <Heading size="md" mb={4}>Chat Room</Heading>
          <VStack spacing={4} align="stretch" mb={2} overflowY="auto" flex="1" maxH="75vh">
            {messages.map(msg => (
              <Box
                key={msg.id}
                bg={msg.sender === (userProfile ? userProfile.nickName : 'Anonymous') ? 'blue.50' : 'gray.50'}
                p={3}
                borderRadius="md"
                alignSelf={msg.sender === (userProfile ? userProfile.nickName : 'Anonymous') ? 'flex-end' : 'flex-start'}
                maxW="70%"
              >
                <Text fontWeight="bold">
                  {msg.sender}
                  <Text as="span" fontWeight="normal" ml={2} fontSize="sm" color="gray.500">{dayjs(msg.timestamp.toDate()).format('HH:mm')}</Text>
                </Text>
                <Text>{msg.text}</Text>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </VStack>
          <Box>
            <InputGroup>
              <Input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={handleSendMessage}>
                  <ArrowRightIcon />
                </Button>
              </InputRightElement>
            </InputGroup>
          </Box>
        </Flex>

        {/* Participant List */}
        <Box bg="white" p={5} borderRadius="md" boxShadow="md" w="20%" ml={5}>
          <Heading size="md" mb={4}>Participants</Heading>
          <VStack spacing={4} align="stretch">
            {participants.map(participant => (
              <HStack key={participant.uid} spacing={3}>
                <Avatar src={participant.avatar} name={participant.name} />
                <Text>
                  {participant.nickName}
                  {participant.uid === user.uid && ( // Replace 'currentUserUID' with the actual current user ID
                    <Text as="span" fontSize="sm" color="gray.500" ml={2}>
                      YOU
                    </Text>
                  )}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      </Flex>
    </ChakraProvider>
  );
};