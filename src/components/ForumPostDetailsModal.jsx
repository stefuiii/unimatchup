import React, { useEffect, useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, ModalFooter, Button, HStack, VStack, Heading, Text, ButtonGroup, IconButton, useDisclosure } from "@chakra-ui/react";
import { Tabs, Tab, TabPanel, TabPanels, TabList, Spinner, Tag, Image, Input } from "@chakra-ui/react";
import { getDoc, doc, updateDoc, onSnapshot, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { database } from "../firebase-config.js";
import { FaStar, FaThumbsUp } from "react-icons/fa";

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

const ForumDetailModal = ({ isOpen, onClose, forumData }) => {
  const [eventData, setEventData] = useState(null);
  const [conData, setConData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [currentUserNickname, setCurrentUserNickname] = useState("");
  const auth = getAuth();
  const currentUserId = auth.currentUser.uid;

  useEffect(() => {
    const fetchOrganizerData = async () => {
      setLoading(true);
      try {
        const eventRef = doc(database, forumData.EventCollection, forumData.EventID);
        const eventCol = await getDoc(eventRef);
        setEventData(eventCol.data());
        const contriCollect = await getDoc(forumData.Contributor);
        if (contriCollect.exists()) {
          setConData(contriCollect.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching organizer data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchLikesAndComments = () => {
      const likesRef = doc(database, "forumPost", forumData.forumPostID);
      onSnapshot(likesRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setLikes(data.likes || 0);
          setComments(data.comments || []);
          setUserHasLiked(data.likedBy?.includes(currentUserId) || false);
        }
      });
    };

    const fetchCurrentUserNickname = async () => {
      if (currentUserId) {
        const userRef = doc(database, "users", currentUserId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUserNickname(userData.nickName || "");
        }
      }
    };

    if (isOpen) {
      fetchOrganizerData();
      fetchLikesAndComments();
      fetchCurrentUserNickname();
    }
  }, [isOpen, forumData, currentUserId]);

  const handleLike = async () => {
    const postRef = doc(database, "forumPost", forumData.forumPostID);

    if (userHasLiked) {
      // Remove like
      await updateDoc(postRef, {
        likes: likes - 1,
        likedBy: arrayRemove(currentUserId)
      });
    } else {
      // Add like
      await updateDoc(postRef, {
        likes: likes + 1,
        likedBy: arrayUnion(currentUserId)
      });
    }
    setUserHasLiked(!userHasLiked);
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;

    const postRef = doc(database, "forumPost", forumData.forumPostID);
    const updatedComments = [...comments, { text: newComment, nickname: currentUserNickname }];
    await updateDoc(postRef, {
      comments: updatedComments
    });

    setNewComment("");
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            {loading ? (
              <Spinner />
            ) : (
              <Tabs>
                <TabList>
                  <Tab>Post</Tab>
                  <Tab>Contributor Info</Tab>
                  <Tab>Linked Event</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <HStack mt={3}>
                      <Heading size={'lg'}>{forumData.Title}</Heading>
                      <StarRating rating={forumData.Rate} />
                    </HStack>
                    <VStack alignItems={'left'} spacing={2} mt={3} mb={3}>
                      <Text>{forumData.Content}</Text>
                    </VStack>
                    <VStack mb={3} alignItems={'left'}>
                      <Heading size={'sm'}>Image</Heading>
                      {forumData.Image && (
                        <Image
                          src={forumData.Image}
                          alt="Post Image"
                          objectFit="cover"
                          width="100%"
                          height="100%"
                          borderRadius="md"
                        />
                      )}
                    </VStack>
                    <HStack mt={3} mb={3}>
                      <Button onClick={handleLike} leftIcon={<FaThumbsUp />}>
                        {userHasLiked ? `Unlike (${likes})` : `Like (${likes})`}
                      </Button>
                    </HStack>
                   

                  </TabPanel>
                  <TabPanel>
                    {conData ? (
                      <>
                        <HStack mt={3} mb={3}>
                          <Heading size={'sm'}>Name</Heading>
                          <Text>{conData.firstName}</Text>
                        </HStack>
                        <HStack mb={3}>
                          <Heading size={'sm'}>Gender</Heading>
                          <Text>{conData.Gender}</Text>
                        </HStack>
                        <HStack mb={3}>
                          <Heading size={'sm'}>Major</Heading>
                          <Text>{conData.Major}</Text>
                        </HStack>
                        <VStack alignItems={'left'} spacing={2} mb={3}>
                          <Heading size={'sm'}>Hobbies</Heading>
                          <HStack spacing={2}>
                            {conData.hobbies.map((hobby, index) => (
                              <Tag key={index} size="md" colorScheme="blue">{hobby}</Tag>
                            ))}
                          </HStack>
                        </VStack>
                      </>
                    ) : (
                      <Text>No data available</Text>
                    )}
                  </TabPanel>
                  <TabPanel>
                    {eventData ? (
                      <>
                        <HStack mt={3} mb={3}>
                          <Heading size={'sm'}>Title</Heading>
                          <Text>{eventData.Title || "No Title"}</Text>
                        </HStack>
                        <VStack alignItems={'left'} spacing={2} mb={3}>
                          <Heading size={'sm'}>Description</Heading>
                          <Text>{eventData.Description || "No Description"}</Text>
                        </VStack>
                        <HStack mb={3}>
                          <Heading size={'sm'}>Date</Heading>
                          <Text>{eventData.Date ? eventData.Date.toDate().toLocaleString() : "No Date"}</Text>
                        </HStack>
                        <HStack>
                          <Heading size={'sm'}>Location</Heading>
                          <Text>{eventData.Location || "No Location"}</Text>
                        </HStack>
                      </>
                    ) : (
                      <Text>Loading event data...</Text>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button variant='ghost' colorScheme='blue' mr={3} onClick={onClose}>
                Close
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ForumDetailModal;
