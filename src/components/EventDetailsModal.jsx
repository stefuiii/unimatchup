import React, { useEffect, useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, HStack, VStack, Heading, Text, ButtonGroup, IconButton, useDisclosure } from "@chakra-ui/react";
import { Tabs, Tab, TabPanel, TabPanels, TabList, Spinner, Tag } from "@chakra-ui/react";
import { getDoc, doc } from 'firebase/firestore';
import { database } from "../firebase-config.js";
import { AiOutlineTeam, AiOutlineUser } from 'react-icons/ai'; // 使用 AiOutlineUser 作为图标
import ProfileCard from './ProfileCard'; // 假设 ProfileCard 位于同一目录下

const EventDetailsModal = ({ isOpen, onClose, post }) => {
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [memberData, setMemberData] = useState([]);
  const [selectedMemberID, setSelectedMemberID] = useState(null); // 用于存储选中的成员ID
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false); // 控制ProfileCard模态框的打开和关闭

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

    const fetchMemberData = async () => {
      if (!post.Members || post.Members.length === 0) return;

      setLoading(true);
      try {
        const members = await Promise.all(post.Members.map(async (memberRef) => {
          const memberSnap = await getDoc(memberRef);
          return memberSnap.exists() ? { uid: memberRef.id, ...memberSnap.data() } : null;
        }));

        // 过滤掉组织者自己
        const filteredMembers = members.filter(member => member !== null && member.uid !== post.uid);
        setMemberData(filteredMembers);
      } catch (error) {
        console.error("Error fetching member data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchOrganizerData();
      fetchMemberData();
    }
  }, [post.uid, post.Members, isOpen]);

  const handleMemberClick = (memberID) => {
    setSelectedMemberID(memberID); // 设置选中的成员ID
    setIsProfileCardOpen(true); // 打开ProfileCard模态框
  };

  const handleProfileCardClose = () => {
    setIsProfileCardOpen(false); // 关闭ProfileCard模态框
    setSelectedMemberID(null); // 清除选中的成员ID
  };

  return (
    <>
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
                  <Tab>Member Info</Tab>
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
                  <TabPanel>
                    {memberData.length > 0 ? (
                      <VStack alignItems={'left'} spacing={2}>
                        {memberData.map((member, index) => (
                          <HStack key={index} justifyContent="space-between" w="100%">
                            <HStack>
                              <Text>{member.firstName}</Text>
                            </HStack>
                            <IconButton
                              aria-label="View Profile"
                              icon={<AiOutlineUser />}
                              onClick={() => handleMemberClick(member.uid)}
                            />
                          </HStack>
                        ))}
                      </VStack>
                    ) : (
                      <Text>No members data available</Text>
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

      {/* ProfileCard 模态框 */}
      {selectedMemberID && (
        <ProfileCard isOpen={isProfileCardOpen} onClose={handleProfileCardClose} userID={selectedMemberID} />
      )}
    </>
  );
};

export default EventDetailsModal;