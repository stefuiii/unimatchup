import React from "react"
import { Box, ButtonGroup, ChakraProvider, Flex, HStack, Text, Stack } from '@chakra-ui/react'
import { Button, Heading, Highlight } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom';
import headIcon from "../icons/工作.svg"
import smalldeco from "../icons/页头箭头.svg"


export const Guide = () =>  {
  const navigate = useNavigate();
  
  const handleHome = () => {
    console.log("Click to land home");
    navigate('/home');
  }

  const handleProfile = () => {
    console.log("Click to profile");
    navigate('/createprofile');
  }

  return (
    <ChakraProvider>
    <Flex
    bg={"#FFEFDA"}
    width='100vw'
    height='100vh'
    display="flex"
    flexDirection="column"
    justifyContent="center" 
    alignItems="center"
    alignContent="center"
    >
      <Box 
      width="1200px"
      height="auto"
      justifyContent={'center'}
      alignContent={'center'}
      display={'flex'}
      p={20}
      borderRadius={20}
      bg="rgba(255, 255, 255, 0.4)"
      boxShadow="md">
      <HStack spacing={35}
      position="relative"
      top="-50px"
      marginRight={10}>
      <img src={headIcon} alt="Avatar" width="600" height="600"/>
      <Stack marginInline={0} spacing={5}>
      <img src={smalldeco} alt="Avatar" width="80" height="80"/>
      <Heading lineHeight='tall' whiteSpace ='pre-line'>
        <Highlight
        query='UniMatchUp'
        styles={{ px: '2', py: '1', rounded: 'full', bg: '#FFBF6A'}}
        >
        {`Welcome To UniMatchUp`}
        </Highlight>
      </Heading>
        <ButtonGroup spacing={50}>
          <Button variant='solid' colorScheme='blue'
          onClick={handleProfile} borderRadius={'10'} width={180}>I'm a new user</Button>
          <Button variant='ghost' colorScheme='blue'
          onClick={handleHome} bg={'white'} borderRadius={'10'}>I've been your buddy</Button>
        </ButtonGroup>
        <Box width={450} textDecoration="underline">
        <Text color={'gray'}>
            If you are a new user, you must click "I'm a new user" button to create your profile first.
        </Text>
        </Box>
      </Stack>
      </HStack>
      </Box>
    </Flex>
    </ChakraProvider>
  )
}