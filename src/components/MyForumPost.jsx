import React, { useEffect, useState } from "react";
//import "./Registration.css";
import { auth, database } from "../firebase-config.js";
import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { Box, Heading, Button, 
         Stack, Text,  ButtonGroup,
         HStack, 
         ChakraProvider, Grid, Spinner } from "@chakra-ui/react";
import { CalendarIcon, InfoIcon } from "@chakra-ui/icons";
import { Card, CardBody, CardFooter, useDisclosure, useToast, IconButton, Image } from '@chakra-ui/react'
import { FaRegThumbsUp, FaStar } from "react-icons/fa6";
import "../format/oneLineDescription.css"
import EventDetailsModal from "./EventDetailsModal.jsx";
import { AiOutlineTeam } from "react-icons/ai";
import ForumDetailModal from "./ForumPostDetailsModal.jsx";

const StarRating = ({ max = 5, rating }) => {
    return (
      <HStack spacing={-5}>
        {Array.from({ length: max }, (_, index) => {
          const value = index + 1;
          return (
            <IconButton
              key={value}
              icon={<FaStar />}
              color={value <= rating ? "yellow.400" : "gray.300"}
              variant="unstyled"
              ml={value > 1 ? '-5' : '0'}
              aria-label={`${value} Stars`}
            />
          );
        })}
      </HStack>
    );
};

const FPost = ({ post, onRemovePost }) => {
    const {
        isOpen: isModalOpen,
        onOpen: onModalOpen,
        onClose: onModalClose
    } = useDisclosure();

    
    return (
        <Card maxW="sm" width="150px" height="270px" justifyContent="flex-start" overflow="hidden">
            <CardBody >
                <Stack mt="2" spacing="1" height="auto">
                    <Heading size="sm" noOfLines={1}>
                        {post.Title}
                    </Heading>
                    <StarRating rating={post.Rate} />
                    <Box height="32px" display="flex">
                        <Text fontSize="xs" lineHeight="16px" minHeight="32px" noOfLines={2}>
                            {post.Content}
                        </Text>
                    </Box>
                    {post.Image && (
                        <Image
                            src={post.Image}
                            alt="Post Image"
                            objectFit="cover"
                            width="100%"
                            height="80px"
                            borderRadius="md"
                        />
                    )}
                    <CardFooter justifyContent="center" alignContent="right" p={3}>
                        <HStack>
                            <Button onClick={onModalOpen} variant="ghost" colorScheme="blue" fontSize="xs">View Details</Button>
                            <ForumDetailModal isOpen={isModalOpen} onClose={onModalClose} forumData={post} />
                        </HStack>
                    </CardFooter>
                </Stack>
            </CardBody>
        </Card>
    );
};


export const ShowAllForum = () => {
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

          if (profileData.forumPosts) {
            const posts = [];
            for (const forumRef of profileData.forumPosts) {
              const forumDoc = await getDoc(forumRef);
              if (forumDoc.exists()) {
                const forumData = forumDoc.data();
                posts.push(forumData);
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
      setPosts(posts.filter(post => post.forumPostID !== postId));
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
            <FPost key={index} post={post} onRemovePost={removePost} />
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
