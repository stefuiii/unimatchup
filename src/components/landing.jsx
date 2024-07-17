import React, { useState }from "react"
import { Box, ChakraProvider, Flex, HStack, Stack, Link } from '@chakra-ui/react'
import {
  Button,
  Heading, Highlight,
  Checkbox, Tooltip
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom';
import headIcon from "../icons/工作.svg"
import smalldeco from "../icons/页头箭头.svg"


export const Landing = () =>  {
  const [isChecked, setIsChecked] = useState(true);
  const navigate = useNavigate();
  
  const handleLogin = () => {
    if (isChecked) {
      console.log("Click to login");
      navigate('/login');
    } else {
      console.log('Not Checked');
    }
    
  }

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

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
        query='Best-fit'
        styles={{ px: '2', py: '1', rounded: 'full', bg: '#FFBF6A'}}
        >
        {`With UniMatchUp to\nfind your Best-fit Buddies!`}
        </Highlight>
      </Heading>
          <Button  isDisabled={!isChecked} onClick={handleLogin} bg={'white'} borderRadius={'10'}>Start Your Journey</Button>
      <Box mt={2}>
        <Tooltip hasArrow bg="white" color="black" label="Please agree to the terms of service" aria-label="A tooltip">
        <Checkbox defaultChecked={isChecked} onChange={handleCheckboxChange} color={"gray"}>
          You are agreed with our{" "}
          <Link href="/terms-of-service" textDecoration="underline">
            Terms of Service
          </Link>
        </Checkbox>
        </Tooltip>
      </Box>
      </Stack>
      </HStack>
      </Box>
    </Flex>
    </ChakraProvider>
  )
}