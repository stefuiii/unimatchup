
import React, { useState, useEffect } from 'react';
import { Box, ChakraProvider, Flex, Heading, VStack, Text, Avatar,
         Input, InputGroup, InputLeftElement, Button, Drawer, DrawerBody,
         DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, Highlight,
         useDisclosure, Tooltip
        } from '@chakra-ui/react';
import { SearchIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { auth, database } from '../firebase-config';
import myAvatar from "../icons/avatar13.svg";
import dayjs from 'dayjs';
import '../format/chatStyles.css'; 

export const Chatsoverview = () => {
  const [search, setSearch] = useState('');
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const navigate = useNavigate();
  const user = auth.currentUser;
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchChats = () => {
      const user = auth.currentUser;
      if (user) {
        const userProfileRef = doc(database, 'userProfile', user.uid);

        const unsubscribeUserProfile = onSnapshot(userProfileRef, (userProfileSnap) => {
          if (userProfileSnap.exists()) {
            const userProfileData = userProfileSnap.data();
            const chatRoomIds = userProfileData.chatRooms || [];

            if (chatRoomIds.length > 0) {       
              const chatsQuery = query(collection(database, 'chatRooms'), where('__name__', 'in', chatRoomIds));
              const unsubscribeChatRooms = onSnapshot(chatsQuery, (querySnapshot) => {
                const chatsData = querySnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data(),
                }));

                const sortedChats = chatsData.sort((a, b) => {
                  const timeA = a.lastMessageTime ? a.lastMessageTime.toDate() : new Date(0);
                  const timeB = b.lastMessageTime ? b.lastMessageTime.toDate() : new Date(0);
                  return timeB - timeA;
                });

                setChats(sortedChats);
                setFilteredChats(sortedChats); 
              });

              return () => unsubscribeChatRooms();
            } else {
              setChats([]);
              setFilteredChats([]);
            }
          }
        });

        return () => unsubscribeUserProfile();
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (search === '') {
      setFilteredChats(chats);
    } else {
      setFilteredChats(
        chats.filter(chat =>
          chat.name?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, chats]);

  const handleChatClick = (chatId) => {
    navigate(`/chatpage/${chatId}`);
  };

  const handleFilterEvents = (eventType) => {
    if (eventType === 'all') {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter(chat => chat.collection === eventType);
      setFilteredChats(filtered);
    }
  };
  

  return (
    <ChakraProvider>
      <Box bg="#FFEFDA" minH="100vh" p={5}>
        <Flex justify="space-between" align="center" mb={5}>
          <Tooltip hasArrow label="Return Home" aria-label="Chat Tooltip" bg="white" color="black">
            <ArrowBackIcon color="#E3C195" boxSize={10} onClick={() => navigate('/home')}/>
          </Tooltip>
          <Heading lineHeight='tall' whiteSpace='pre-line'>
            <Highlight
              query='Chat List'
              styles={{ px: '8', py: '1', rounded: 'full', bg: '#CCAC81', color: "#FFF9F2", textShadow: '1px 1px 2px #E3C195',
                border: 'white'
              }}
            >
              {`Chat List`}
            </Highlight>
          </Heading>
          <Button
            colorScheme="teal"
            onClick={onOpen}
            bg="#E3C195"
            color="white"
            _hover={{ bg: '#F2E6D6' }}
            boxShadow="none"
            borderRadius={20}
            textShadow={'gray'}
          >
            Filter by Events
          </Button>
        </Flex>
        <Drawer placement="right" bg="FFBF6A" onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay>
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Filter by Events</DrawerHeader>
              <DrawerBody>
                <Button onClick={() => handleFilterEvents('all')} mb={3} w="100%" variant="outline">
                  All
                </Button>
                <Button onClick={() => handleFilterEvents('postInfo')} mb={3} w="100%" variant="outline">
                  Grab
                </Button>
                <Button onClick={() => handleFilterEvents('foodPost')} mb={3} w="100%" variant="outline">
                  Food
                </Button>
                <Button onClick={() => handleFilterEvents('sportPost')} mb={3} w="100%" variant="outline">
                  Sport
                </Button>
                <Button onClick={() => handleFilterEvents('groupPost')} mb={3} w="100%" variant="outline">
                  Tut Group
                </Button>
              </DrawerBody>
            </DrawerContent>
          </DrawerOverlay>
        </Drawer>
        <InputGroup mb={5}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" mt={3} />
          </InputLeftElement>
          <Input
            type="text"
            placeholder="Search Chats"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg={'white'}
            borderRadius={10}
          />
        </InputGroup>
        <VStack spacing={4} align="stretch" className="chat-container">
          {filteredChats.map(chat => (
            <Box
              key={chat.id}
              bg="white"
              p={4}
              borderRadius="md"
              boxShadow="sm"
              position="relative"
              onClick={() => handleChatClick(chat.id)}
              _hover={{ bg: 'gray.50', cursor: 'pointer' }}
            >
              <Flex align="center" w="100%">
                <Avatar src={chat.avatar || myAvatar} name={chat.name || "Chat Room"} />
                <Box ml={4} flex="1">
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="bold">{chat.name || "Chat Room"}</Text>
                    <Text fontSize="sm" color="gray.400">{chat.lastMessageTime ? dayjs(chat.lastMessageTime.toDate()).format('HH:mm') : ""}</Text>
                  </Flex>
                  <Flex align="center" mt={1}>
                    <Box flex="1">
                      <Text fontSize="sm" color="gray.500">
                        {chat.lastMessageSender
                          ? `${chat.lastMessageSender}: ${chat.lastMessage || "No message"}`
                          : "Say hi to your buddies!"}
                      </Text>
                    </Box>
                    {chat.unreadMessages?.[user.uid] > 0 && (
                      <Box
                        bg="red.500"
                        color="white"
                        borderRadius="full"
                        boxSize={6}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        right={1}
                        bottom={-1} 
                      >
                        <Text fontSize="xs">{chat.unreadMessages[user.uid]}</Text>
                      </Box>
                    )}
                  </Flex>
                </Box>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>
    </ChakraProvider>
  );
};
