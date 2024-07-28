import React, { useState, useEffect } from "react";
import { collection, addDoc, getDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { database } from "../firebase-config";
import { Box, Input, Textarea, Button, useToast, Stack, IconButton, Select, ButtonGroup } from "@chakra-ui/react";
import { uploadImage } from "../function/UploadImage.jsx";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, HStack, VStack, FormControl, FormLabel, VisuallyHidden } from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";

const StarRating = ({ max = 5, onRatingChange }) => {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(5);

  const handleClick = (value) => {
    setRating(value);
    if (onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <HStack spacing={2}>
      {Array.from({ length: max }, (_, index) => {
        const value = index + 1;
        return (
          <IconButton
            key={value}
            icon={<FaStar />}
            color={value <= (hover || rating) ? "yellow.400" : "gray.300"}
            onClick={() => handleClick(value)}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(0)}
            variant="unstyled"
            aria-label={`${value} Stars`}
          />
        );
      })}
    </HStack>
  );
};

export const CreateForumPost = ({ isOpen, onClose, userID }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [image, setImage] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userDoc, setUserDoc] = useState()
  const toast = useToast();

  useEffect(() => {
    const fetchUserEvents = async () => {
      const userDoc = await getDoc(doc(database, "userProfile", userID));
      console.log(userID);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const eventRefs = userData.events || [];
        const eventPromises = eventRefs.map(ref => getDoc(ref));
        const eventDocs = await Promise.all(eventPromises);
        const eventData = eventDocs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(eventData);
      }
    };

    if (isOpen) {
      fetchUserEvents();
    } else {
      setRating(5);
    }
  }, [isOpen, userID]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newPostData = {
      Title: title,
      Content: content,
      Rate: rating,
      EventID: selectedEvent.id,
      EventCollection: selectedEvent.collection,
      forumPostID: "",
      Contributor: "",
      likes: 0,
      comments: [],
      likedBy:[]
    };

    

    if (image) {
      const imageUrl = await uploadImage(image);
      newPostData.Image = imageUrl;
    }

    try {
        const docRef = await addDoc(collection(database, "forumPost"), newPostData);
    const forumPostID = docRef.id;
    await updateDoc(docRef, { forumPostID });
;
    const userRef = doc(database, "userProfile", userID);
    await updateDoc(docRef, { Contributor: userRef });
    await updateDoc(userRef, {
        forumPosts: arrayUnion(docRef)
    });



    toast({
      title: "Great Post!",
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    setTitle("");
    setContent("");
    setRating(5);
    setImage(null);
    setSelectedEvent("");
    setIsSubmitting(false);
   } catch (error) {
          console.error("Error writing document: ", error);
        } finally {
          setIsSubmitting(false);
        }
   }
    
  

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>SHARE MOODS</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={5}>
            <Box>
              <FormControl isRequired>
                <FormLabel mb="8px" size="xs" textTransform="uppercase">
                  Title
                </FormLabel>
                <Input
                  bg={"white"}
                  color={"black"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  type="text"
                  placeholder="Name your post"
                  width={380}
                />
              </FormControl>
            </Box>
            <Box>
              <FormControl isRequired>
                <FormLabel mb="8px" size="xs" textTransform="uppercase">
                  Your Feelings
                </FormLabel>
                <Textarea
                  bg={"white"}
                  color={"black"}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  type="text"
                  placeholder="Share your feelings"
                  width={380}
                />
              </FormControl>
            </Box>
            <Box>
              <FormControl isRequired>
                <FormLabel mb="8px" size="xs" textTransform="uppercase">
                  Link to Event
                </FormLabel>
                <Select placeholder="Select event" value={selectedEvent?.id || ""}
                onChange={(e) => {
                    const selectedEventId = e.target.value;
                    const selectedEvent = events.find(event => event.id === selectedEventId);
                    setSelectedEvent({
                        id: selectedEvent.id,
                        collection: selectedEvent.collection
                    });
                }}>
                    {events.map(event => (
                        <option key={event.id} value={event.id}>
                            {event.Title}
                            </option>
                    ))}
                </Select>

              </FormControl>
            </Box>
            <Box justifyContent={"flex-start"}>
              <FormControl isRequired>
                <FormLabel mb="8px" size="xs" textTransform="uppercase">
                  Share a Pic
                </FormLabel>
                <Button as="label" htmlFor="file-upload" cursor="pointer">
                  UPLOAD
                </Button>
                <VisuallyHidden>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                </VisuallyHidden>
                {image && <Box mt={2}>Selected file: {image.name}</Box>}
              </FormControl>
            </Box>
            <Box>
              <FormControl isRequired>
                <FormLabel mb="8px" size="xs" textTransform="uppercase">
                  Rate Your Experience
                </FormLabel>
                <StarRating max={5} onRatingChange={(value) => setRating(value)} />
                <Box mt={2}>Selected rating: {rating} stars</Box>
              </FormControl>
            </Box>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
            <Button variant="ghost" colorScheme="blue" mr={3} onClick={handleSubmit} isDisabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Share Your Experience!'}
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
