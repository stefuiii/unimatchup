import React, { useEffect, useState }from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, HStack, VStack, Heading, Text, ButtonGroup } from "@chakra-ui/react";
import { Tabs, Tab, TabPanel, TabPanels, TabList, Spinner } from "@chakra-ui/react";
import { getDoc, doc } from 'firebase/firestore';
import { database } from "../firebase-config.js";
import { Tag } from '@chakra-ui/react'

const EventDetailsModal = ({ isOpen, onClose, post }) => {
    const [orgData, setOrgData] = useState(null);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      const fetchOrganizerData = async () => {
        if (!post.uid) return;
  
        setLoading(true);
        try {
          const organizerRef = doc(database, 'userProfile', post.uid);
          const orgCollect = await getDoc(organizerRef);
          if (orgCollect.exists()) {
            setOrgData(orgCollect.data());
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching organizer data:", error);
        } finally {
          setLoading(false);
        }
      };
  
      if (isOpen) {
        fetchOrganizerData();
      }
    }, [post.uid, isOpen]);
  
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader ml={3}>Event Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loading ? (
              <Spinner />
            ) : (
              <Tabs>
                <TabList>
                  <Tab>General Info</Tab>
                  <Tab>Organizer Info</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <HStack mt={3} mb={3}>
                      <Heading size={'sm'}>Title</Heading>
                      <Text>{post.Title}</Text>
                    </HStack>
                    <VStack alignItems={'left'} spacing={2} mb={3}>
                      <Heading size={'sm'}>Description</Heading>
                      <Text>{post.Description}</Text>
                    </VStack>
                    <HStack mb={3}>
                      <Heading size={'sm'}>Date</Heading>
                      <Text>{post.Date.toDate().toLocaleString()}</Text>
                    </HStack>
                    <HStack>
                      <Heading size={'sm'}>Location</Heading>
                      <Text>{post.Location}</Text>
                    </HStack>
                  </TabPanel>
                  <TabPanel>
                    {orgData ? (
                      <>
                        <HStack mt={3} mb={3}>
                          <Heading size={'sm'}>Name</Heading>
                          <Text>{orgData.firstName}</Text>
                        </HStack>
                        <HStack mb={3}>
                          <Heading size={'sm'}>Gender</Heading>
                          <Text>{orgData.Gender}</Text>
                        </HStack>
                        <HStack mb={3}>
                          <Heading size={'sm'}>Major</Heading>
                          <Text>{orgData.Major}</Text>
                        </HStack>
                        <VStack alignItems={'left'} spacing={2} mb={3}>
                          <Heading size={'sm'}>Hobbies</Heading>
                          <HStack spacing={2}>
                            {orgData.hobbies.map((hobby, index) => (
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
    );
  };
  
export default EventDetailsModal;
/*
const EventDetailsModal = ({ isOpen, onClose, post}) => {
    const [orgData, setOrgData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOrganizerData = async () => {
          if (!post.uid) return;
    
          setLoading(true);
          try {
            const organizerRef = doc(database, 'userProfile', post.uid);
            const orgCollect = await getDoc(organizerRef);
            if (orgCollect.exists()) {
              setOrgData(orgCollect.data());
            } else {
              console.log("No such document!");
            }
          } catch (error) {
            console.error("Error fetching organizer data:", error);
          } finally {
            setLoading(false);
          }
        };
    
        if (isOpen) {
          fetchOrganizerData();
        }
      }, [post.uid, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Event Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>General Info</Tab>
              <Tab>Organizer Info</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <HStack mt={3} mb={3}>
                  <Heading size={'sm'}>Title</Heading>
                  <Text>{post.Title}</Text>
                </HStack>
                <VStack alignItems={'left'} spacing={2} mb={3}>
                  <Heading size={'sm'}>Description</Heading>
                  <Text>{post.Description}</Text>
                </VStack>
                <HStack mb={3}>
                  <Heading size={'sm'}>Date</Heading>
                  <Text>{post.Date.toDate().toLocaleString()}</Text>
                </HStack>
                <HStack>
                  <Heading size={'sm'}>Location</Heading>
                  <Text>{post.Location}</Text>
                </HStack>
              </TabPanel>
              <TabPanel>
              <HStack mt={3} mb={3}>
                  <Heading size={'sm'}>Name</Heading>
                  <Text>{orgData.firstName}</Text>
                </HStack>
                <HStack mb={3}>
                  <Heading size={'sm'}>Major</Heading>
                  <Text>{orgData.Major}</Text>
                </HStack>
                <HStack alignItems={'left'} spacing={2} mb={3}>
                  <Heading size={'sm'}>Hobbies</Heading>
                  <HStack spacing={2}>
                        {orgData.hobbies.map((hobby, index) => (
                          <Tag key={index} size="md" colorScheme="blue">{hobby}</Tag>
                        ))}
                      </HStack>
                </HStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
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
  );
};

export default EventDetailsModal;
*/