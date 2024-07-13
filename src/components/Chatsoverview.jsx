import React, { useState, useEffect } from 'react';
import {
  Box,
  ChakraProvider,
  Flex,
  Heading,
  VStack,
  Text,
  Avatar,
  HStack,
  Highlight,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import myAvatar from "../icons/avatar13.svg";

const chatData = [
  { id: 1, name: 'Grab to Changi', lastMessage: 'I love Jackson Wang', avatar: myAvatar, time: '21:56' },
  { id: 2, name: 'Flight to TPE', lastMessage: 'Hello Stephanie', avatar: myAvatar, time: '21:00' },
  { id: 3, name: 'Cartier SG 2024', lastMessage: 'Fishee YOU ARE INVITED', avatar: myAvatar, time:'18:00' },
  { id: 4, name: 'NU Class of 2026 Prom', lastMessage: 'Alen Wong YOU ARE NOT INVITED', avatar: myAvatar, time:'FOREVER' },
];

export const Chatsoverview = () => {
  const [search, setSearch] = useState('');
  const [chats, setChats] = useState(chatData);
  const navigate = useNavigate();

  useEffect(() => {
    if (search === '') {
      setChats(chatData);
    } else {
      setChats(
        chatData.filter(chat =>
          chat.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search]);

  const handleChatClick = (chatId) => {
    navigate(`/chatpage/${chatId}`);
  };

  return (
    <ChakraProvider>
      <Box bg="#FFEFDA" minH="100vh" p={5}>
       <Flex justify="center" mb={5}>
          <Heading lineHeight='tall' whiteSpace ='pre-line'>
            <Highlight
              query='Chat List'
              styles={{ px: '8', py: '1', rounded: 'full', bg: '#FFBF6A' }}
            >
              {`Chat List`}
            </Highlight>
          </Heading>
        </Flex>
        <InputGroup mb={5}>
          <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.300" />} />
          <Input
            type="text"
            placeholder="Search Chats"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        <VStack spacing={4} align="stretch">
          {chats.map(chat => (
            <Box
              key={chat.id}
              bg="white"
              p={4}
              borderRadius="md"
              boxShadow="sm"
              onClick={() => handleChatClick(chat.id)}
              _hover={{ bg: 'gray.50', cursor: 'pointer' }}
            >
              <HStack spacing={4}>
                <Avatar src={chat.avatar} name={chat.name} />
                <Flex justify="space-between" align="center" w="100%">
                <Box>
                  <Text fontWeight="bold">{chat.name}</Text>
                  <Text fontSize="sm" color="gray.500">{chat.lastMessage}</Text>
                </Box>
                  <Text fontSize="sm" color="gray.400" alignSelf="flex-start">{chat.time}</Text>
                </Flex>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>
    </ChakraProvider>
  );
};