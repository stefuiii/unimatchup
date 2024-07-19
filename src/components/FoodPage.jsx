import React, { useEffect, useState } from "react";
//import "./Registration.css";
import { auth, database } from "../firebase-config.js";
import { collection, doc, updateDoc, getDoc, getDocs, orderBy, query, arrayUnion, addDoc } from "firebase/firestore";
import { Box, Heading, Button, Stack, Text, ButtonGroup,
         HStack, InputGroup, InputLeftElement,
         ChakraProvider, Input,
         Flex, useToast, useDisclosure, Spinner } from "@chakra-ui/react";
import { CalendarIcon, InfoIcon, SearchIcon } from "@chakra-ui/icons";
import { Card, CardBody, CardFooter } from '@chakra-ui/react'
import "../format/oneLineDescription.css"
import postAvatar from "../icons/avatar13.svg"
import foodHeading from "../icons/一起吃饭.svg"
import EventDetailsModal from "./EventDetailsModal.jsx";

const ShowPosts = ({post}) => {
  const [added, setAdded] = useState(post.Joined);
  const user = auth.currentUser;
  const date = post.Date.toDate().toLocaleString();
  const toast = useToast();

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose
  } = useDisclosure();

  const createChatRoom = async (postId, members) => {
    try {
        const eventRef = doc(database, 'foodPost', postId);
        const eventDoc = await getDoc(eventRef);
        const eventData = eventDoc.data();
        const eventTitle = eventData.Title; 
  
        const unreadMessages = members.reduce((acc, member) => {
          acc[member] = 0;
          return acc;
        }, {});
  
        const chatRoomRef = await addDoc(collection(database, 'chatRooms'), {
            postId: postId,
            collection: 'foodPost',
            members: [...members, user.uid],
            name: eventTitle, 
            lastMessage: '',
            lastMessageSender: '',
            lastMessageTime: new Date(),
            unreadMessages
        });
  
        const chatRoomId = chatRoomRef.id;
        const messagesCollectionRef = collection(chatRoomRef, 'messages');
        await addDoc(messagesCollectionRef, {}); 
  
        await updateDoc(eventRef, {
            chatRoomId: chatRoomId
        });
  
        await updateDoc(chatRoomRef, {
            chatRoomId: chatRoomId
        });
      
        for (const member of [...members, user.uid]) {
            const userProfileRef = doc(database, 'userProfile', member);
            await updateDoc(userProfileRef, {
                chatRooms: arrayUnion(chatRoomId)
            });
        }
  
        console.log('Chat room created successfully with ID:', chatRoomId);
    } catch (error) {
        console.error('Error creating chat room:', error);
    }
  };

  const handleAddedMember = async() => {
    try {
        const docRef = doc(database, 'foodPost', post.docID);
        const docCollect = await getDoc(docRef);
        const docData = docCollect.data();

        const memberDocs = await Promise.all(docData.Members.map(memberRef => getDoc(memberRef)));
        const isUserAlreadyJoined = memberDocs.some(memberDoc => {
            console.log("Checking member ID:", memberDoc.data().uid, "against user ID:", user.uid); 
            return memberDoc.data().uid === user.uid;
        });

        if (isUserAlreadyJoined) {
            toast({
                title: "Join Failed",
                description: "You have already joined this event",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        if (user.uid === docData.uid) {
            toast({
                title: "Join Failed",
                description: "You cannot join your event ",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } else if (docData.Joined < post.Number) {
            const newlyAdded = docData.Joined + 1;
            setAdded(newlyAdded);
            await updateDoc(docRef, { Joined: newlyAdded });
            const userProfileRef = doc(database, 'userProfile', user.uid);
            await updateDoc(userProfileRef, {
                events: arrayUnion(docRef)
            });
            await updateDoc(docRef, {
                Members: arrayUnion(userProfileRef)
            });

        toast({
          title: "Join Successful.",
          description: "You have succesfully joined this event! ",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        if (newlyAdded === post.Number) {
          console.log('Creating chat room...');
          await createChatRoom(post.docID, [...docData.Members.map(memberRef => memberRef.id),]);
        }


            console.log("Newly added members:", newlyAdded);

            if (newlyAdded === post.Number) {
                console.log('Creating chat room...');
                await createChatRoom(post.docID, [...docData.Members.map(memberRef => memberRef.id),]);
            }

        } else {
            console.log('The event is already full');
            toast({
                title: "Join Failed",
                description: "The event is already full",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    } catch (error) {
        console.error('Fail to join', error);
    }

   
  }
    return (
    <Card maxW='sm' width="300px" height="280px" justifyContent={'center'}>
      <CardBody>
        <Stack mt='2' spacing='3'>
          <HStack spacing={100}>
            <Heading size='md'>{post.Title}</Heading>
            <img src={postAvatar} alt="Avatar" width="50" height="50"/>
          </HStack>
          <Text className="one-line-description" fontSize="sm">
            {post.Description}
          </Text>
      </Stack>
      <HStack mt={'4'} spacing={'3'}>
        <CalendarIcon boxSize={4} color={"gray.600"}/>
        <Text fontSize="sm">{date}</Text>
      </HStack>
      <HStack mt={'3'} spacing={'3'}>
        <InfoIcon boxSize={4} color={"gray.600"}/>
        <Text fontSize="sm">{post.Location}</Text>
      </HStack>
      </CardBody>
      <CardFooter style={{ marginTop: '-20px' }}
        justifyContent={'left'} mt={'0'}>
        <ButtonGroup spacing='4' justifyContent={'flex-start'}>
          <Button onClick={handleAddedMember}
          variant='solid' colorScheme='blue' fontSize="xs">
            Join Us({added}/{post.Number})
          </Button>
          <>
          <Button onClick={onModalOpen} variant='ghost' colorScheme='blue' fontSize="xs">
            View Event Details
          </Button>
          <EventDetailsModal isOpen={isModalOpen} onClose={onModalClose} post={post} />
          </>
        </ButtonGroup>
      </CardFooter>
    </Card>
    );
}

export const ShowFood = () => {
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const postsPerPage = 4;

    useEffect (() => {
        const fetchPosts = async () => {
            const postsCollection = query(collection(database, "foodPost"), orderBy("Date", "asc"));
            const querySnapshot = await getDocs(postsCollection);
            const postsData = querySnapshot.docs.map(doc => doc.data());
            setPosts(postsData);
            setLoading(false);
        };
        fetchPosts();
    }, []);

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    
    const filteredPosts = posts.filter(post => 
      post.Title.toLowerCase().includes(search.toLowerCase())
    );
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    //const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

    const handleNextPage = () => {
      if (currentPage < Math.ceil(posts.length / postsPerPage)) {
        setCurrentPage(currentPage + 1);
      }
    };

    const handlePrevPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
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
          p={10}>
          <Box 
            style={{ display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            flexDirection: 'column', 
            marginTop: '100px',
            gap: '20px', height: '80vh' }}>
            <Box mt={0}>
              <img src={foodHeading} alt="Avatar" width="200" height="100"/>
            </Box>
            <HStack spacing={'4'}>
            <InputGroup>
              <InputLeftElement pointerEvents='none'>
                <SearchIcon marginTop={'3'}color='gray.300' />
              </InputLeftElement>
              <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)} 
              width={'600px'}
              borderRadius={'15'}
              bg={"white"}
              placeholder='Search for Your Buddies' />
            </InputGroup>
            </HStack>
            {loading ? (
            <Spinner size="xl" />
          ) : (
            <>
          <HStack marginTop={5} spacing={4} overflowX="auto">
            {currentPosts.map((post, index) => (
            <ShowPosts key={index} post={post} />
            ))}
          </HStack>
          <Box style={{ display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            flexDirection: 'column',
            marginTop: '30px'}}>
          <ButtonGroup spacing='4'>
          <Button onClick={handlePrevPage} disabled={currentPage === 1}>
            Previous
          </Button>
          <Button onClick={handleNextPage} disabled={currentPage === Math.ceil(posts.length / postsPerPage)}>
            Next
          </Button>
        </ButtonGroup>
          </Box>
          </>
          )}
          </Box>
          </Flex>
        </ChakraProvider>
    );
}