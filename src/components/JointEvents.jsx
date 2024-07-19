import React, { useEffect, useState } from "react";
//import "./Registration.css";
import { auth, database } from "../firebase-config.js";
import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { Box, Heading, Button, 
         Stack, Text,  ButtonGroup,
         HStack, 
         ChakraProvider, Grid, Spinner } from "@chakra-ui/react";
import { CalendarIcon, InfoIcon } from "@chakra-ui/icons";
import { Card, CardBody, CardFooter, useDisclosure, useToast } from '@chakra-ui/react'
import "../format/oneLineDescription.css"
import EventDetailsModal from "./EventDetailsModal.jsx";
import { AiOutlineTeam } from "react-icons/ai";

const ShowPosts = ({post, onRemovePost}) => {
  const user = auth.currentUser;
  const toast = useToast();

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose
  } = useDisclosure();
    
  const quitEvent = async() => {
    try {
      console.log('Clicked!')
      //ref of profile
      const userProfileRef = doc(database, 'userProfile', user.uid);
      const userProfileDoc = await getDoc(userProfileRef);

      if (userProfileDoc.exists()) {
        const userProfile = userProfileDoc.data();
        console.log(userProfile.uid);

        // ref of post
        const docRef = doc(database, post.collection, post.docID);
        const docCollect = await getDoc(docRef);
        const docData = docCollect.data();

        if (docData.Joined === docData.Number) {
          toast({
            title: 'Quit Failed',
            description: 'You cannot quit the event as it has successfully built up',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        // update the event array in the userProfile ref
        const updatedEvents = userProfile.events.filter(eventRef => eventRef.id !== docRef.id);
        await updateDoc(userProfileRef, { events: updatedEvents });

        // update the member array in the postRef
        const updatedMembers = docData.Members.filter(memberRef => memberRef.id !== userProfileRef.id);
        await updateDoc(docRef, { Members: updatedMembers });
        await updateDoc(docRef, { Joined: increment(-1) });

        onRemovePost(post.docID);


        toast({
          title: 'Event Quit',
          description: 'You have successfully quit the event.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error quitting event: ", error);
      toast({
        title: 'Error',
        description: 'There was an error quitting the event.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }

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
        <CalendarIcon boxSize={4} color={"gray.600"}/>
        <Text fontSize="xs">{date}</Text>
      </HStack>
      <HStack mt={'3'} spacing={'3'}>
        <InfoIcon boxSize={4} color={"gray.600"}/>
        <Text fontSize="xs">{post.Location}</Text>
      </HStack>
      <HStack mt={'3'} spacing={'3'}>
          <AiOutlineTeam size={20} color={"gray.600"} />
          <Text fontSize="xs">{`${post.Joined} / ${post.Number}`}</Text>
        </HStack>
      </CardBody>
      <CardFooter style={{ marginTop: '-30px' }}
        justifyContent={'left'}>
        <ButtonGroup spacing='2' justifyContent={'flex-start'}>
          <>
          <Button size={'xs'} onClick={onModalOpen} colorScheme='blue' fontSize="xs">
            Details
          </Button>
          </>
          <Button onClick={quitEvent} size={'xs'} colorScheme="red" fontSize="xs" width={50}>
            Quit
          </Button>
          <EventDetailsModal isOpen={isModalOpen} onClose={onModalClose} post={post} />
        </ButtonGroup>
      </CardFooter>
    </Card>
    );
    
}

export const ShowAllJoint = () => {
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [search] = useState('');
    const [loading, setLoading] = useState(true);
    const postsPerPage = 4;
    const user = auth.currentUser;
    const uid = user.uid;

    useEffect (() => {
        const fetchPosts = async () => {
        const profile = doc(database, 'userProfile', uid);
        const profileDoc = await getDoc(profile);
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();

          if (profileData.events) {
            const posts = [];
            for (const eventRef of profileData.events) {
              const eventDoc = await getDoc(eventRef);
              if (eventDoc.exists()) {
                const eventData = eventDoc.data();
                if (eventData.uid !== uid) {
                  posts.push(eventData);
                } else {
                  console.log('Skipping event from current user');
                }
              } else {
                console.log('No such event document!');
              }
            }
            setPosts(posts);
            setLoading(false);
          } else {
            console.log('No joined events found!');
          }
        } else {
          console.log('No such user profile document!');
        }
        }
        fetchPosts();
    }, [uid]);

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

    if (loading) {
      return <Spinner size="xl" />;
    }

    const handlePrevPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };

    return (
        <ChakraProvider>
          <Box 
            style={{ display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            flexDirection: 'column'}}>
           <Grid templateColumns="repeat(2, 1fr)" gap={6} marginTop={5}>
            {currentPosts.map((post, index) => (
            <ShowPosts key={index} post={post} onRemovePost={removePost} />
          ))}
        </Grid>
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
          </Box>
        </ChakraProvider>
    );
}