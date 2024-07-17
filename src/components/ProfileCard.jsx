import React, { useEffect, useState }from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, HStack, VStack, Heading, Text, ButtonGroup } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
import { getDoc, doc } from 'firebase/firestore';
import { database } from "../firebase-config.js";
import { Tag } from '@chakra-ui/react'

const ProfileCard = ({ isOpen, onClose, userID}) => {
    const [orgData, setOrgData] = useState(null);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      const fetchOrganizerData = async () => {
        if (!userID) return;
  
        setLoading(true);
        try {
          const organizerRef = doc(database, 'userProfile', userID);
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
    }, [userID, isOpen]);
  
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Profile</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loading ? (
              <Spinner />
            ) : orgData ? (
              <>
                <HStack mt={3} mb={3}>
                  <Heading size={'sm'}>First Name</Heading>
                  <Text>{orgData.firstName}</Text>
                </HStack>
                <HStack mt={3} mb={3}>
                  <Heading size={'sm'}>Last Name</Heading>
                  <Text>{orgData.lastName}</Text>
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
              <Text>No profile data available</Text>
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
  
export default ProfileCard;