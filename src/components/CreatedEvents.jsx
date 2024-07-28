import React, { useEffect, useState } from "react";
import { auth, database } from "../firebase-config.js";
import { addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore";
import { Box, Heading, Button, Stack, Text, ButtonGroup, HStack, ChakraProvider, Grid, Spinner } from "@chakra-ui/react";
import { CalendarIcon, InfoIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { Card, CardBody, CardFooter, useDisclosure, useToast } from '@chakra-ui/react';
import "../format/oneLineDescription.css";
import EventDetailsModal from "./EventDetailsModal.jsx";
import { AiOutlineTeam } from "react-icons/ai";


const ShowPosts = ({ post, onDelete }) => {
  const toast = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDiscussionAllowed, setIsDiscussionAllowed] = useState(false);

  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();

  useEffect(() => {
    const eventTime = post.Date.toDate();
    const oneHourBeforeEvent = new Date(eventTime.getTime() - 60 * 60 * 1000);
    
    if (currentDate >= oneHourBeforeEvent && currentDate <= eventTime) {
      setIsDiscussionAllowed(true);
    } else {
      setIsDiscussionAllowed(false);
    }
  }, [currentDate, post.Date]);

  const deleteEvent = async () => {
    try {
      const eventRef = doc(database, post.collection, post.docID);
      const eventDoc = await getDoc(eventRef);
      const eventData = eventDoc.data();

      await updateDoc(eventRef, { status: 'deleted' });

      if (eventData.chatRoomId) {
        const chatRoomRef = doc(database, 'chatRooms', eventData.chatRoomId);
        await deleteDoc(chatRoomRef);

        for (const memberRef of eventData.Members) {
          const memberDoc = await getDoc(memberRef);
          if (memberDoc.exists()) {
            const memberData = memberDoc.data();
            const updatedEvents = memberData.events.filter(event => event.id !== eventRef.id);
            const updatedChatRooms = memberData.chatRooms.filter(chatRoom => chatRoom.id !== chatRoomRef.id);
            await updateDoc(memberRef, { events: updatedEvents, chatRooms: updatedChatRooms });
          }
        }
      } else {
        for (const memberRef of eventData.Members) {
          const memberDoc = await getDoc(memberRef);
          if (memberDoc.exists()) {
            const memberData = memberDoc.data();
            const updatedEvents = memberData.events.filter(event => event.id !== eventRef.id);
            await updateDoc(memberRef, { events: updatedEvents });
          }
        }
      }

      await deleteDoc(eventRef);

      toast({
        title: 'Event Deleted',
        description: 'The event has been successfully deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onDelete(post.docID);
    } catch (error) {
      console.error("Error deleting event: ", error);
      toast({
        title: 'Error',
        description: 'There was an error deleting the event.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }

  const handleStartDiscussion = async () => {
    try {
      const eventRef = doc(database, post.collection, post.docID);
      const eventDoc = await getDoc(eventRef);
      const eventData = eventDoc.data();
  
      if (eventData.chatRoomId) {
        toast({
          title: 'Discussion Already Started',
          description: 'The chat room for this event has already been created.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const members = post.Members.map(memberRef => memberRef.id);
        await createChatRoom(post.docID, members);
        toast({
          title: 'Discussion Started',
          description: 'Chat room created successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error starting discussion:', error);
      toast({
        title: 'Error',
        description: 'There was an error starting the discussion.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  

  const createChatRoom = async (postId, members) => {
    try {
      const user = auth.currentUser;
      const eventRef = doc(database, post.collection, postId);
      const eventDoc = await getDoc(eventRef);
      const eventData = eventDoc.data();
      const eventTitle = eventData.Title; 
  
      const unreadMessages = members.reduce((acc, member) => {
        acc[member] = 0;
        return acc;
      }, {});
  
      const chatRoomRef = await addDoc(collection(database, 'chatRooms'), {
          postId: postId,
          collection: post.collection,
          members: [...members,],
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

        toast({
            title: "Chat Room Created",
            description: `The chatroom for "${eventTitle}" has been built up.`,
            status: "success",
            duration: null,
            isClosable: true,
        });
    }
      console.log('Chat room created successfully with ID:', chatRoomId);
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  };

  const date = post.Date.toDate().toLocaleString();
  return (
    <Card maxW='sm' width="150px" height="250px" justifyContent={'center'}>
      <CardBody>
        <Stack spacing='3'>
          <HStack spacing={100}>
            <Heading size='xs'>{post.Title}</Heading>
          </HStack>
        </Stack>
        <HStack mt={'4'} spacing={'3'}>
          <CalendarIcon boxSize={4} color={"gray.600"} />
          <Text fontSize="xs">{date}</Text>
        </HStack>
        <HStack mt={'3'} spacing={'3'}>
          <InfoIcon boxSize={4} color={"gray.600"} />
          <Text fontSize="xs">{post.Location}</Text>
        </HStack>
        <HStack mt={'3'} spacing={'3'}>
          <AiOutlineTeam size={20} color={"gray.600"} />
          <Text fontSize="xs">{`${post.Joined} / ${post.Number}`}</Text>
        </HStack>
      </CardBody>
      <CardFooter style={{ marginTop: '-30px' }} justifyContent={'left'}>
        <Stack spacing={2} align="flex-start">
          <HStack spacing={2}>
            <Button size={'xs'} onClick={onModalOpen} colorScheme='blue' fontSize="xs">
              Details
            </Button>
            <Button onClick={deleteEvent} size={'xs'} colorScheme="red" fontSize="xs">
              Delete
            </Button>
          </HStack>
          <Button
            onClick={handleStartDiscussion}
            size={'xs'}
            fontSize="xs"
            colorScheme={isDiscussionAllowed ? "orange" : "gray"}
            isDisabled={!isDiscussionAllowed}
            alignSelf="center"
            width="full"
          >
            Start Discussion
          </Button>
        </Stack>
        <EventDetailsModal isOpen={isModalOpen} onClose={onModalClose} post={post} />
      </CardFooter>
    </Card>
  );
}

export const ShowAll = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search] = useState('');
  const [loading, setLoading] = useState(true);
  const postsPerPage = 4;
  const user = auth.currentUser;

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        let allPosts = [];
        const collections = ["postInfo", "foodPost", "sportPost", "groupPost"];

        for (const perCollect of collections) {
          const postsCollection = query(collection(database, perCollect),
            where("uid", "==", user.uid),
            orderBy("Date", "asc"));
          const querySnapshot = await getDocs(postsCollection);
          const postsData = querySnapshot.docs.map(doc => ({ ...doc.data(), docID: doc.id, collection: perCollect }));
          allPosts = [...allPosts, ...postsData];
        }
        setPosts(allPosts);
        setLoading(false);
      }
    };
    fetchPosts();
  }, [user]);

  const removePost = (postId) => {
    setPosts(posts.filter(post => post.docID !== postId));
  };

  if (loading) {
    return <Spinner size="xl" />;
  }

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const filteredPosts = posts.filter(post =>
    post.Title.toLowerCase().includes(search.toLowerCase())
  );
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

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
      <Box
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column'
        }}>
        <Grid templateColumns="repeat(2, 1fr)" gap={6} marginTop={5}>
          {currentPosts.map((post, index) => (
            <ShowPosts key={index} post={post} onDelete={removePost} />
          ))}
        </Grid>
        <Box style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          marginTop: '30px'
        }}>
          <ButtonGroup spacing='4'>
            <Button onClick={handlePrevPage} disabled={currentPage === 1}>
              Previous
            </Button>
            <Button onClick={handleNextPage} disabled={currentPage === Math.ceil(posts.length / postsPerPage)}>
              Next
            </Button>
          </ButtonGroup>
        </Box>
      </Box>
    </ChakraProvider>
  );
}