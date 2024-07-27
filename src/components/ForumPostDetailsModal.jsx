import React, { useEffect, useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, HStack, VStack, Heading, Text, ButtonGroup, IconButton, useDisclosure } from "@chakra-ui/react";
import { Tabs, Tab, TabPanel, TabPanels, TabList, Spinner, Tag, Image, Textarea, Input } from "@chakra-ui/react";
import { getDoc, doc, updateDoc, collection, addDoc, onSnapshot } from 'firebase/firestore';
import { database } from "../firebase-config.js";
import { AiOutlineTeam, AiOutlineUser } from 'react-icons/ai'; // 使用 AiOutlineUser 作为图标
import ProfileCard from './ProfileCard'; // 假设 ProfileCard 位于同一目录下
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
          setLikes(doc.data().likes || 0);
          setComments(doc.data().comments || []);
        }
      });
    };

    if (isOpen) {
      fetchOrganizerData();
      fetchLikesAndComments();
    }
  }, [isOpen, forumData]);

  const handleLike = async () => {
    const postRef = doc(database, "forumPost", forumData.forumPostID);
    await updateDoc(postRef, {
      likes: likes + 1
    });
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;

    const postRef = doc(database, "forumPost", forumData.forumPostID);
    const updatedComments = [...comments, newComment];
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
                        Like ({likes})
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
                      <Text>No organizer data available</Text>
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
