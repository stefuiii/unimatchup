import React, { useState, useEffect } from "react"
import { Box, ChakraProvider, Flex, HStack, Stack, Tooltip, Image } from '@chakra-ui/react'
import { collection, doc, getDoc, getDocs, query} from "firebase/firestore";
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
  Card, CardBody, Portal, Spinner
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
import { ShowAllForum } from "./MyForumPost";
import { ChatIcon } from "@chakra-ui/icons";
import { useNavigate } from 'react-router-dom';
import headIcon from "../icons/工作.svg"
import smalldeco from "../icons/页头箭头.svg"
import grabIcon from "../icons/car-svgrepo-com.svg"
import foodIcon from "../icons/food-location-svgrepo-com.svg"
import sportIcon from "../icons/catch-svgrepo-com.svg"
import groupIcon from "../icons/group-talk-svgrepo-com (1).svg"
import profile from "../icons/人员.svg"
import logoutIcon from "../icons/退出.svg"
import { auth, database } from "../firebase-config"
import ProfileCard from "./ProfileCard";
import "../App.css";

export const Home = () => {
  const [size, setSize] = React.useState('');
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const [nickName, setNickName] = useState('');
  const [userID, setUserID] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [shouldRenderProfileCard, setShouldRenderProfileCard] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const uid = user.uid;
        setUserID(uid);

        try {
          const userProfileRef = doc(database, 'userProfile', uid);
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
      }
      setLoadingUser(false);
    };

    const checkUnreadMessages = async () => {
      if (userID) {
        const chatRoomsRef = collection(database, 'chatRooms');
        const chatRoomsQuery = query(chatRoomsRef);
        
        const chatRoomsSnapshot = await getDocs(chatRoomsQuery);
        let hasUnread = false;

        for (const doc of chatRoomsSnapshot.docs) {
          const chatRoomData = doc.data();
          if (chatRoomData.unreadMessages && chatRoomData.unreadMessages[userID] > 0) {
            hasUnread = true;
            break;
          }
        }

        setHasUnreadMessages(hasUnread);
      }
    };

    fetchUserData();
    checkUnreadMessages();
  }, [userID]);

  const handleModalOpen = () => {
    setShouldRenderProfileCard(true);
    onModalOpen();
  };

  if (loadingUser) {
    return <Spinner alignContent={'center'} />;
  }

  const handleClick = (newSize) => {
    setSize(newSize);
    onDrawerOpen();
  };

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
  };

  const handleChatClick = () => {
    navigate('/chatsoverview');
  };

  const handleLogout = () => {
    navigate('/landing');
  };

  const handleForum = () => {
    navigate('/forum');
  };

  return (
    <ChakraProvider>
      <HStack spacing={3} bg={'#E8D4B8'} display={'flex'} justifyContent={'right'} alignItems={'end'}>
       <>
       <Tooltip hasArrow label="Log Out" aria-label="Log Out Tooltip" bg="white" color="black">
        <Button onClick={handleLogout} bg="none" mb={5} mr={-5}>
          <img src={logoutIcon} alt="Avatar" width="25" height="25"/>
        </Button>
       </Tooltip>
       <Tooltip hasArrow label="Profile" aria-label="Profile Tooltip" bg="white" color="black">
         <Button onClick={handleModalOpen} bg={'none'} mb={5} marginEnd={-3}>
          <img src={profile} alt="Avatar" width="30" height="30" />
         </Button>
       </Tooltip>
       {shouldRenderProfileCard && (
          <ProfileCard isOpen={isModalOpen} onClose={onModalClose} userID={userID} />
        )}
       </>
       <Tooltip hasArrow label="Chat" aria-label="Chat Tooltip" bg="white" color="black">
    <Button
      position="relative"
      onClick={handleChatClick}
      bg="none"
      p={0}
      top="-20px"
    >
      <ChatIcon boxSize={6} color={'white'}/>
      {hasUnreadMessages && (
        <Box
          position="absolute"
          top={0}
          right={0}
          width="12px"
          height="12px"
          borderRadius="50%"
          bg="red.500"
        />
      )}
    </Button>
  </Tooltip>
     <Button
      onClick={() => handleClick('sm')}
      key={'sm'}
      m={5}
      bg={"white"}
    >
      {`Your Page`}
      </Button>
    </HStack>
      <Flex
        bg={"#FFEFDA"}
        width='100vw'
        height='100vh'
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="center"
        alignContent="center"
        overflow="auto"
        className="container"
      >
        <Box 
      width="1300px"
      height="auto"
      justifyContent={'center'}
      alignContent={'center'}
      display={'flex'}
      p={4}
      mt={8}
      borderRadius={20}
      bg="rgba(255, 255, 255, 0.4)"
      boxShadow="md">
        <Box
          width="70%"
          height="70%"
          justifyContent={'center'}
          alignContent={'center'}
          mt={10}
        >
          <HStack spacing={35} position="relative" top="-50px">
            <img src={headIcon} alt="Avatar" width="500" height="550" />
            <Stack marginInline={0} spacing={5} mb={-10}>
              <img src={smalldeco} alt="Avatar" width="50" height="50" />
              <Heading lineHeight='tall' whiteSpace='pre-line' fontSize="4xl">
                <Highlight
                  query='Best-fit'
                  styles={{ px: '2', py: '1', rounded: 'full', bg: '#FFBF6A' }}
                >
                  {`With us to find your\n Best-fit  Buddies`}
                </Highlight>
              </Heading>
              <ButtonGroup spacing={5} width="320px">
              <Popover>
                <PopoverTrigger>
                  <Button width="100%" bg={'white'} borderRadius={'10'}>Post Here</Button>
                </PopoverTrigger>
                <Portal>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverBody>
                      <ButtonGroup size='sm' mt={-5} spacing={2}>
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
              <Button width="100%" bg={'white'} borderRadius={'10'} onClick={handleForum}>
                View Community
              </Button>
              </ButtonGroup>
              
              <Box justifyContent={'center'} alignContent={'center'}>
              <Box position='relative' padding='5'>
                <Divider borderColor='gray' />
                <AbsoluteCenter  bg="rgba(253, 246, 234)" px='5'>
                  Or
                </AbsoluteCenter>
              </Box>
              <Box ml={5}>
                <Text color={'gray.500'} position='relative' fontSize="sm">
                  Click entries below to search for your events
                </Text>
                </Box>
              </Box>
            </Stack>
          </HStack>
          <Box>
            <HStack spacing={[3, 6, 9, 12]} wrap="wrap" justify="center" mt={-20}>
              {[
                { src: grabIcon, alt: "Grab Car", buttonText: "Grab Car", onClick: handleGrabClick },
                { src: foodIcon, alt: "Delivery Food", buttonText: "Delivery Food", onClick: handleFoodClick },
                { src: sportIcon, alt: "Sports", buttonText: "Sports", onClick: handleSportClick },
                { src: groupIcon, alt: "Tut Group", buttonText: "Tut Group", onClick: handleGroupClick }
              ].map((item, index) => (
                <Card key={index} maxW="sm" width={["20%", "20%", "20%", "20%"]} height="180px" justifyContent="center">
                  <CardBody display="flex" flexDirection="column" justifyContent="center" alignItems="center" alignContent="center">
                    <Stack mt='1' spacing='3' align="center">
                      <Image height={"80%"} src={item.src} alt={item.alt} width="80%" objectFit="contain" />
                      <ButtonGroup display="flex" flexDirection="column" justifyContent="center" alignItems="center" alignContent="center" size='sm' >
                        <Button variant='solid' color='white' bg='#FFD296' borderRadius={20} width={'120px'} onClick={item.onClick} >
                          {item.buttonText}
                        </Button>
                      </ButtonGroup>
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </HStack>
            </Box>
          </Box>
        </Box>
        <Drawer onClose={onDrawerClose} isOpen={isDrawerOpen} size={'sm'}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <HStack spacing={0}>
              <DrawerHeader mt={7} width="100" whiteSpace="nowrap" textOverflow="ellipsis">
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
                  <Tab>Forum Posts</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <p><ShowAll /></p>
                  </TabPanel>
                  <TabPanel>
                    <p><ShowAllJoint /></p>
                  </TabPanel>
                  <TabPanel>
                    <p><ShowAllForum /></p>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Flex>
    </ChakraProvider>
  );
};