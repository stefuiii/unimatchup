import React, { useState } from 'react';
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


export const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Jackson Wang', text: 'Fishee I love you', time: dayjs().format('HH:mm') },
    { id: 2, sender: 'Fishee', text: 'I love you too', time: dayjs().format('HH:mm') },
    { id: 3, sender: 'Stephanie', text: 'Je suis touched', time: dayjs().format('HH:mm') }
  ]);
  const [participants] = useState([
    { id: 1, name: 'Jackson Wang', avatar: 'https://www.nme.com/wp-content/uploads/2022/06/got7-jackson-wang-nanana-solo-single-july-release-magic-man-september-1392x884.jpg' },
    { id: 2, name: 'Fishee', avatar: Avatar },
    { id: 3, name: 'Stephanie', avatar: Avatar },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { id: Date.now(), sender: 'You', text: message, time: dayjs().format('HH:mm') }]);
      setMessage('');
    }
  };

  return (
    <ChakraProvider>
      <Flex minH="100vh" p={5} bg="#FFEFDA">
        {/* Event Info Box */}
        <Box bg="white" p={5} borderRadius="md" boxShadow="md" w="20%" mr={5}>
          <Heading size="md" mb={4}>Event Info</Heading>
          <Text>
           <Text as="Description" fontWeight="bold">Event: </Text> Dinner at Lau Pa Sat.
          </Text>
          <Text>
           <Text as="Description" fontWeight="bold">Time: </Text> 17:30 11 July.
          </Text>
          <Text>
           <Text as="Description" fontWeight="bold">Location: </Text> Lau Pa Sat.
          </Text>
          <Text>
           <Text as="Description" fontWeight="bold">Description: </Text> sik faan.
          </Text>
        </Box>

        {/* Main Chat Box */}
        <Flex direction="column" bg="white" p={5} borderRadius="md" boxShadow="md" flex="1" mx={5}>
          <Heading size="md" mb={4}>Chat Room</Heading>
          <VStack spacing={4} align="stretch" mb={5} overflowY="auto" flex="1">
            {messages.map(msg => (
              <Box
                key={msg.id}
                bg={msg.sender === 'You' ? 'blue.50' : 'gray.50'}
                p={3}
                borderRadius="md"
                alignSelf={msg.sender === 'You' ? 'flex-end' : 'flex-start'}
                maxW="70%"
              >
                <Text fontWeight="bold">
                  {msg.sender}
                  <Text as="span" fontWeight="normal" ml={2} fontSize="sm" color="gray.500">{msg.time}</Text>
                </Text>
                <Text>{msg.text}</Text>
              </Box>
            ))}
          </VStack>
          <Box mt="auto">
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
              <HStack key={participant.id} spacing={3}>
              <Avatar src={participant.avatar} name={participant.name} />
              <Text>
                {participant.name}
                {participant.isAuth && (
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