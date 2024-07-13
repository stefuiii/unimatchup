import React, { useState, useEffect } from "react"
import { Box, ChakraProvider, Flex, HStack, Stack } from '@chakra-ui/react'
import { doc, getDoc} from "firebase/firestore";
import {
  Drawer,
  Button,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Tabs,
  Tab, TabPanel, TabPanels, TabList,
  Heading, Highlight,
  Divider, AbsoluteCenter, Text, ButtonGroup,
  Card, CardBody, Portal
} from '@chakra-ui/react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
} from '@chakra-ui/react'
import { ShowAll } from "./CreatedEvents"
import { ShowAllJoint } from "./JointEvents"
import { ChatIcon } from "@chakra-ui/icons";
import { useNavigate } from 'react-router-dom';
import headIcon from "../icons/工作.svg"
import smalldeco from "../icons/页头箭头.svg"
import grabIcon from "../icons/打车场景.svg"
import foodIcon from "../icons/一起吃饭.svg"
import sportIcon from "../icons/体育锻炼.svg"
import groupIcon from "../icons/工作汇报.svg"
import profile from "../icons/人员.svg"
import { auth, database } from "../firebase-config"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'

export const Home = () =>  {
  const [size, setSize] = React.useState('')
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose
  } = useDisclosure();

  // 第二个 useDisclosure 钩子，用于管理第二个状态
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose
  } = useDisclosure();

  const [nickName, setNickName] = useState('');
  const navigate = useNavigate();
  const user = auth.currentUser;
  const userID = user.uid;
  

  /*
  const profileCard = async() => {
    const profileRef = doc(database, "userProfile", userID);
    const profileSnap = await getDoc(profileRef);
    const profileDetail = profileSnap.data();

    const name = profileDetail.firstName;
    const nickName = profileDetail.nickName;
    const hobbies = profileDetail.hobbies;

    return (
      <Card maxW='sm' width="300px" height="280px" justifyContent={'center'}>
      <CardBody>
        <Stack mt='2' spacing='3'>
          <HStack spacing={100}>
          </HStack>
          <Text className="one-line-description" fontSize="sm">
          Hi
          </Text>
      </Stack>
      <HStack mt={'4'} spacing={'3'}>
      </HStack>
      <HStack mt={'3'} spacing={'3'}>
      </HStack>
      </CardBody>
    </Card>
    )

  }
    */

  const handleClick = (newSize) => {
    setSize(newSize)
    onDrawerOpen()
  }

  const handleGrabClick = () => {
    console.log('Button clicked!'); 
    navigate('/showgrab');
  };

  const handleFoodClick = () => {
    console.log('Button clicked!'); 
    navigate('/showfood');
  };

  const handleSportClick = () => {
    console.log('Button clicked!'); 
    navigate('/showsport');
  };

  const handleGroupClick = () => {
    console.log('Button clicked!'); 
    navigate('/showgroup');
  };

  const handleAddGrabClick = () => {
    console.log('Button clicked!'); 
    navigate('/addpost');
  };

  const handleAddFoodClick = () => {
    console.log('Button clicked!'); 
    navigate('/addfoodpost');
  };

  const handleAddSportClick = () => {
    console.log('Button clicked!'); 
    navigate('/addsportpost');
  };

  const handleAddGroupClick = () => {
    console.log('Button clicked!'); 
    navigate('/addtutpost');
  };

  const handleEditProfile = () => {
    navigate('/createprofile');
  }

  
  useEffect(() => {
    const getNickName = async () => {
      try {
        const userProfileRef = doc(database, 'userProfile', userID);
        const userProfileDoc = await getDoc(userProfileRef);
        if (userProfileDoc.exists()) {
          const userProfileData = userProfileDoc.data();
          setNickName(userProfileData.nickName);
        } else {
            console.log('No such user profile document!');
        }
      } catch (error) {
          console.error('Error getting user profile:', error);
      }
    };
  
    if (userID) {
      getNickName();
    }
    }, [userID]);



  return (
    <ChakraProvider>
      <HStack spacing={2} bg={'#E8D4B8'} display={'flex'} justifyContent={'right'} alignItems={'end'}>
      <>
      <Button onClick={onModalOpen} bg={'none'} mb={5}>
      <img src={profile} alt="Avatar" width="30" height="30"/>
      </Button>
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Your Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          <HStack>
          <Heading size={'sm'}>
            Name
          </Heading>
          <Text>Stephanie</Text>
          </HStack>
          <HStack>
          <Heading size={'sm'}>
            Nick Name
          </Heading>
          <Text>stefuiii</Text>
          </HStack>
          <HStack>
          <Heading size={'sm'}>
            Major
          </Heading>
          <Text>Computer Science</Text>
          </HStack>
          <HStack>
          <Heading size={'sm'}>
            Hobbies
          </Heading>
          </HStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </>
      <ChatIcon boxSize={6} mb={7} color={'white'}/>
      <Button
          onClick={() => handleClick('sm')}
          key={'sm'}
          m={5}
          bg={"white"}
        >{`Your Page`}</Button>
      </HStack>
    <Flex
    bg={"#FFEFDA"}
    width='100vw'
    height='100vh'
    display="flex"
    flexDirection="column"
    justifyContent="center" 
    alignItems="center"
    alignContent="center"
    p={5}
    >
      <Box 
      width="70%"
      height="70%"
      justifyContent={'center'}
      alignContent={'center'}
      mt={-20}>
      <HStack spacing={35}
      position="relative"
      top="-50px">
      <img src={headIcon} alt="Avatar" width="500" height="500"/>
      <Stack marginInline={0} spacing={5}>
      <img src={smalldeco} alt="Avatar" width="50" height="50"/>
      <Heading lineHeight='tall' whiteSpace ='pre-line'>
        <Highlight
        query='Best-fit'
        styles={{ px: '2', py: '1', rounded: 'full', bg: '#FFBF6A'}}
        >
        {`With us to find your\nBest-fit Buddies!`}
        </Highlight>
      </Heading>
      <Popover>
        <PopoverTrigger>
          <Button bg={'white'} borderRadius={'10'}>Post Here</Button>
          </PopoverTrigger>
          <Portal>
            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody>
                <ButtonGroup size='sm'mt={-5} spacing={2}>
                  <Button variant='solid' color='white' bg='#FFD296' 
                  borderRadius={10}
                  onClick={handleAddGrabClick}>
                    Grab Car
                  </Button>
                  <Button variant='solid' color='white' bg='#FFD296' 
                  borderRadius={10}
                  onClick={handleAddFoodClick}>
                    Food
                  </Button>
                  <Button variant='solid' color='white' bg='#FFD296' 
                  borderRadius={10}
                  onClick={handleAddSportClick}>
                    Sport
                  </Button>
                  <Button variant='solid' color='white' bg='#FFD296' 
                  borderRadius={10}
                  onClick={handleAddGroupClick}>
                    Group
                  </Button>
                </ButtonGroup>
              </PopoverBody>
            </PopoverContent>
          </Portal>
      </Popover>
      <Box position='relative' padding='5'>
        <Divider borderColor='gray' />
        <AbsoluteCenter bg='#FFEFDA' px='5'>
          Or
          </AbsoluteCenter>
      </Box>
      <Box mt={-5}>
        <Text color={'gray.500'}  position='relative'>
          Click entries below to search for your events
        </Text>
      </Box>
      </Stack>
      </HStack>
      <Box mt={-20}>
      <HStack spacing={20}>
      <Card maxW='sm' width="200px" height="180px" justifyContent={'center'}>
      <CardBody 
      display="flex"
      flexDirection="column"
      justifyContent="center" 
      alignItems="center"
      alignContent="center">
      <Stack mt='1' spacing='3'>
        <img src={grabIcon} alt="Avatar" width="120" height="120"/>
        <ButtonGroup 
        display="flex"
        flexDirection="column"
        justifyContent="center" 
        alignItems="center"
        alignContent="center"
        size='sm'mt={-5}>
        <Button variant='solid' color='white' bg='#FFD296' borderRadius={20} width={'150px'}
        onClick={handleGrabClick}>
          Grab Car
        </Button>
      </ButtonGroup>
      </Stack>
      </CardBody>
      </Card>
      
      <Card maxW='sm' width="200px" height="180px" justifyContent={'center'}>
      <CardBody 
      display="flex"
      flexDirection="column"
      justifyContent="center" 
      alignItems="center"
      alignContent="center">
      <Stack mt='1' spacing='5'>
        <img src={foodIcon} alt="Avatar" width="180" height="180"/>
        <ButtonGroup 
        display="flex"
        flexDirection="column"
        justifyContent="center" 
        alignItems="center"
        alignContent="center"
        size='sm' mt={-5}>
        <Button variant='solid' color='white' bg='#FFD296' borderRadius={20} width={'150px'}
        onClick={handleFoodClick}>
          Delivery Food
        </Button>
      </ButtonGroup>
      </Stack>
      </CardBody>
      </Card>

      <Card maxW='sm' width="200px" height="180px" justifyContent={'center'}>
      <CardBody 
      display="flex"
      flexDirection="column"
      justifyContent="center" 
      alignItems="center"
      alignContent="center">
      <Stack mt='1' spacing='0'>
        <img src={sportIcon} alt="Avatar" width="180" height="180"/>
        <ButtonGroup 
        display="flex"
        flexDirection="column"
        justifyContent="center" 
        alignItems="center"
        alignContent="center"
        size='sm'
        mt={-10}>
        <Button variant='solid' color='white' bg='#FFD296' borderRadius={20} width={'150px'}
        onClick={handleSportClick}>
          Sports
        </Button>
      </ButtonGroup>
      </Stack>
      </CardBody>
      </Card>

      <Card maxW='sm' width="200px" height="180px" justifyContent={'center'}>
      <CardBody 
      display="flex"
      flexDirection="column"
      justifyContent="center" 
      alignItems="center"
      alignContent="center">
      <Stack mt='0' spacing='0'>
        <img src={groupIcon} alt="Avatar" width="180" height="200%"/>
        <ButtonGroup 
        display="flex"
        flexDirection="column"
        justifyContent="center" 
        alignItems="center"
        alignContent="center"
        size='sm'mt={-10}>
        <Button variant='solid' color='white' bg='#FFD296' borderRadius={20} width={'150px'}
        onClick={handleGroupClick}>
          Tut Group
        </Button>
      </ButtonGroup>
      </Stack>
      </CardBody>
      </Card>

      </HStack>  
      </Box>
      </Box>
      <Drawer onClose={onDrawerClose} isOpen={isDrawerOpen} size={'sm'}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <HStack spacing={0}>
          <DrawerHeader mt={7} width="100"
          whiteSpace="nowrap" textOverflow="ellipsis">
            Hello {nickName}
            </DrawerHeader>
          <Button mt={7} onClick={handleEditProfile} colorScheme="teal" fontSize="sm" variant="link">
          Edit your profile
          </Button>
          </HStack>
          <DrawerBody>
          <Tabs variant='soft-rounded' colorScheme='green'>
  <TabList>
    <Tab>Created</Tab>
    <Tab>Joined</Tab>
    <Tab></Tab>
  </TabList>
  <TabPanels>
    <TabPanel>
      <p><ShowAll /></p>
    </TabPanel>
    <TabPanel>
      <p><ShowAllJoint /></p>
    </TabPanel>
  </TabPanels>
</Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
    </ChakraProvider>
  )
}