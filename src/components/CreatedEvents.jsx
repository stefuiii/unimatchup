import React, { useEffect, useState } from "react";
import { auth, database } from "../firebase-config.js";
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore";
import { Box, Heading, Button, Stack, Text, ButtonGroup, HStack, ChakraProvider, Grid } from "@chakra-ui/react";
import { CalendarIcon, InfoIcon } from "@chakra-ui/icons";
import { Card, CardBody, CardFooter, useDisclosure, useToast } from '@chakra-ui/react';
import "../format/oneLineDescription.css";
import EventDetailsModal from "./EventDetailsModal.jsx";

const ShowPosts = ({ post, onDelete }) => {
  const toast = useToast();

  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();

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

  const date = post.Date.toDate().toLocaleString();
  return (
    <Card maxW='sm' width="150px" height="200px" justifyContent={'center'}>
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
      </CardBody>
      <CardFooter style={{ marginTop: '-30px' }} justifyContent={'left'}>
        <ButtonGroup spacing='2' justifyContent={'flex-start'}>
          <>
            <Button size={'xs'} onClick={onModalOpen} colorScheme='blue' fontSize="xs">
              Details
            </Button>
          </>
          <Button onClick={deleteEvent} size={'xs'} colorScheme="red" fontSize="xs">
            Delete
          </Button>
          <EventDetailsModal isOpen={isModalOpen} onClose={onModalClose} post={post} />
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}

export const ShowAll = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search] = useState('');
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
      }
    };
    fetchPosts();
  }, [user]);

  const removePost = (postId) => {
    setPosts(posts.filter(post => post.docID !== postId));
  };

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