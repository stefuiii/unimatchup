import React, { useState, useEffect } from "react";
import { FaRegThumbsUp } from "react-icons/fa6";
import { collection, orderBy, getDocs, query } from "firebase/firestore";
import { auth, database } from "../firebase-config";
import { Box, Heading, Button, Stack, Text, ButtonGroup,
    HStack, ChakraProvider, Image, IconButton,
    Flex, useToast, useDisclosure, Spinner, Tooltip, Grid, GridItem } from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardFooter, InputGroup, InputLeftElement, Input } from '@chakra-ui/react';
import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import { CreateForumPost } from "../function/CreateForumPost.jsx";
import { FaStar } from "react-icons/fa";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ForumDetailModal from "./ForumPostDetailsModal.jsx";
import forumHeading from "../icons/community-comments-svgrepo-com.svg";

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

const FPost = ({ post }) => {
    const {
        isOpen: isModalOpen,
        onOpen: onModalOpen,
        onClose: onModalClose
    } = useDisclosure();

    return (
        <Card maxW="sm" width="200px" height="300px" justifyContent="flex-start" overflow="hidden">
            <CardBody p={3}>
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
                            height="100px"
                            borderRadius="md"
                        />
                    )}
                    <CardFooter justifyContent="center" alignContent="flex-end" mt="auto">
                        <HStack>
                            <HStack spacing={2}>
                                <FaRegThumbsUp aria-label="Like post" variant="ghost" colorScheme="blue" fontSize="xs" />
                                <Text fontSize="sm" color="gray.500">{post.likes}</Text>
                            </HStack>
                            <Button onClick={onModalOpen} variant="ghost" colorScheme="blue" fontSize="xs">View Details</Button>
                            <ForumDetailModal isOpen={isModalOpen} onClose={onModalClose} forumData={post} />
                        </HStack>
                    </CardFooter>
                </Stack>
            </CardBody>
        </Card>
    );
};

export const Forum = () => {
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [userLoading, setUserLoading] = useState(true); // 用户加载状态
    const [userID, setUserID] = useState(null);
    const navigate = useNavigate();
    const postsPerPage = 12; // 每页显示 14 个帖子 (2 行)
    const postsPerRow = 6; // 每行显示 7 个帖子

    // 检查用户登录状态
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserID(user.uid);
                setUserLoading(false);
            } else {
                setUserLoading(false);
                // 可以显示登录提示或占位符而不是直接跳转
                // navigate('/login');
            }
        });

        // 清理订阅
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const postsCollection = query(collection(database, "forumPost"), orderBy("Rate", "desc"));
                const querySnapshot = await getDocs(postsCollection);
                const postsData = querySnapshot.docs.map(doc => doc.data());
                setPosts(postsData);
            } catch (error) {
                console.error("Error fetching posts: ", error);
            } finally {
                setLoading(false); // Ensure loading is set to false even if there's an error
            }
        };
        fetchPosts();
    }, []);

    const {
        isOpen: isModalOpen,
        onOpen: onModalOpen,
        onClose: onModalClose
    } = useDisclosure();

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    
    const filteredPosts = posts.filter(post =>
        post.Title.toLowerCase().includes(search.toLowerCase())
    );
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

    const handleNextPage = () => {
        if (currentPage < Math.ceil(filteredPosts.length / postsPerPage)) {
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
            <HStack p={3} bg={'#E8D4B8'} display={'flex'} justifyContent={'right'} alignItems={'center'}>
                <Box mr="auto">
                    <Tooltip hasArrow label="Return Home" aria-label="Chat Tooltip" bg="white" color="black">
                        <ArrowBackIcon color="#E3C195" boxSize={10} onClick={() => navigate('/home')} />
                    </Tooltip>
                </Box>
                <Box mt={0}>
                    <img src={forumHeading} alt="Avatar" width="100" height="50" />
                </Box>
                <HStack spacing={'2'} ml={10} mr={5}>
                    <InputGroup>
                        <InputLeftElement pointerEvents='none'>
                            <SearchIcon marginTop={'3'} color='gray.300' />
                        </InputLeftElement>
                        <Input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)} 
                            width={'600px'}
                            borderRadius={'15'}
                            bg={"white"}
                            placeholder='Find out your buddies` experience' 
                        />
                    </InputGroup>
                </HStack>
                <Box mr={10}>
                <>
                    <AddIcon boxSize={6} color={'white'} onClick={onModalOpen} />
                    <CreateForumPost isOpen={isModalOpen} onClose={onModalClose} userID={userID} />
                </>
                </Box>
            </HStack>
            <Flex bg={"#FFEFDA"} width='100vw' height='100vh' display="flex"
                flexDirection="column" justifyContent="flex-start"
                alignItems="flex-start" alignContent="center" p={10}>

                <HStack>
                </HStack>
                <>
                    {loading ? (
                        <Box textAlign="center" p={4}>
                            <Spinner size="lg" />
                            <Text mt={4}>Loading posts...</Text>
                        </Box>
                    ) : (
                        <>
                            <Grid templateColumns={`repeat(${postsPerRow}, 1fr)`} gap={10} marginTop={5}>
                                {currentPosts.map((post, index) => (
                                    <GridItem key={index}>
                                        <FPost post={post} />
                                    </GridItem>
                                ))}
                            </Grid>
                            <Box position="absolute" bottom="10" width="100%" py={4}>
                                <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" marginTop="30px">
                                    <ButtonGroup spacing='4'>
                                        <Button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</Button>
                                        <Button onClick={handleNextPage} disabled={currentPage === Math.ceil(filteredPosts.length / postsPerPage)}>Next</Button>
                                    </ButtonGroup>
                                </Box>
                            </Box>
                        </>
                    )}
                </>
                <HStack width="1300px" spacing={3} bg={'#E8D4B8'} display={'flex'} justifyContent={'left'} alignItems={'start'}>
                </HStack>
            </Flex>
        </ChakraProvider>
    );
};
