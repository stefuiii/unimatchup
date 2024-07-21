import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { doc, setDoc, addDoc, collection, getDoc, Timestamp, updateDoc} from 'firebase/firestore';
import { Box, 
         Text,
         Button, 
         FormControl, 
         Container,
         FormLabel, 
         Input, 
         Textarea, 
         NumberInput, 
         NumberInputField, 
         NumberInputStepper, 
         NumberIncrementStepper, 
         NumberDecrementStepper,
         Flex,
         useToast} from '@chakra-ui/react';
import { auth, database } from "../firebase-config";

export const AddGrabPost = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState(new Date());
    const [number, setNumber] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const handleSubmit = async(e) => {
      e.preventDefault();
      if (number <= 0) {
        toast({
          title: "Invalid Number",
          description: "The number must be greater than 0.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      setIsSubmitting(true);
      const user = auth.currentUser;

      if (user) {
        const uid = user.uid;
        try {
          const userProfileRef = doc(database, 'userProfile', uid);

          const docRef = await addDoc(collection(database, "postInfo"), {
            uid: uid,
            Title: title,
            Description: description,
            Location: location,
            Date: Timestamp.fromDate(date),
            Number: parseFloat(number),
            docID: "",
            Joined: 0,
            chatRoomId: "",
            collection: "postInfo",
            Members: [userProfileRef],
            status: "active"
          });

          const docInfo = docRef.id;
          await updateDoc(docRef, { docID: docInfo});

          const userDoc = await getDoc(userProfileRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedEvents = [...userData.events, docRef];
          await updateDoc(userProfileRef, { events: updatedEvents });
        } else {
          await setDoc(userProfileRef, { events: [docRef] });
        }

          console.log("Document successfully written!");
          
          toast({
            title: "Post created.",
            description: "Your post has been successfully created.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
  
          setTitle('');
          setDescription('');
          setLocation('');
          setDate('');
          setNumber(0);
  
        } catch (error) {
          console.error("Error writing document: ", error);
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setIsSubmitting(false); 
      } 
      
      
    }

  
   return (
    <Flex 
    height="100vh" 
    alignItems="center" 
    justifyContent="center"
    bg={"#FFEFDA"}
    >
     <Container width={400}
     backdropBlur={'true'}
     backgroundColor={'lightgray'}
     alignContent={'center'}
     bg='bisque' 
     color='white' 
     border ='2px solid'
     borderRadius={'20px'}
     p={0}
     boxShadow={'lg'}>
      
       <Box
         bg="#F4A460"
         width={396}
         color="white"
         p={0}
         padding={4}
         borderTopRadius="20px"
         textAlign="center"
         alignItems= "center"
       >
         <Text fontSize="2xl" fontWeight="bold">Let's Go TGT</Text>
       </Box>

      <Box maxWidth="1000px" 
           mx="auto" 
           mt="auto" 
           alignItems= 'center'
           alignContent={'center'}
           color={'gray'}
           margin={'20px'}
           display={'flex'}
           flexDirection={'column'}>
       <form style={{ marginTop: '0px' }} onSubmit={handleSubmit}>
         <FormControl id="title" mb="3" isRequired>
           <FormLabel mb={'0'}>Title</FormLabel>
           <Input 
           bg={'white'}
           color={'black'}
           value={title} 
           onChange={(e) => setTitle(e.target.value)}
           type="text" placeholder="Event Title" width={300}/>
         </FormControl>

         <FormControl id="description" mb="3" isRequired>
           <FormLabel mb={'0'}>Description</FormLabel>
           <Textarea value={description} 
           bg={'white'}
           color={'black'}
           onChange={(e) => setDescription(e.target.value)}
           placeholder="Type the event description here." 
           width={300}
           height={100}/>
         </FormControl>

        <FormControl id="location" mb="3" isRequired>
          <FormLabel mb={'0'}>Where to Meet</FormLabel>
          <Input value={location}
          bg={'white'}
          onChange={(e) => setLocation(e.target.value)}
          type="text" placeholder="Location" width={300}/>
        </FormControl>

        <Box display="flex" justifyContent="space-between" mb="5" width="300px">
          <FormControl 
          id="date" 
          mb="3" 
          width="150px"
          color={'white'}
          isRequired>
            <FormLabel mb={'0'}>Date and Time</FormLabel>
            <DatePicker
              selected={date}
              onChange={(date) => setDate(date)}
              showTimeSelect
              dateFormat="Pp"
              customInput={<Input bg="white" color="black"/>}
            />
          </FormControl>

          <FormControl 
          id="number" 
          mb="5" 
          width="100px"
          justifyContent="flex-end" isRequired>
            <FormLabel mb={'0'}>Number</FormLabel>
            <NumberInput
              color={'black'}
              value={number}
              onChange={(value) => setNumber(value)}
              min={0}
              max={100}
              maxW={100}
              maxH={50}
            >
            <NumberInputField bg="white"/>
              <NumberInputStepper sx={{ transform: 'scale(0.75)' }}>
              <NumberIncrementStepper color={'gray'} />
              <NumberDecrementStepper color={'gray'} />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        </Box>
        <Box display="flex" justifyContent="flex-end" width="100%" px={0} color={'black'}>
    <Button
        colorScheme='black' 
        bg={'white'}
        variant='outline' 
        type="submit"
        size='sm'
        height='48px'
        width='150px'
        border='2px'
        borderColor='green.500'
        padding={'0.8rem'} borderRadius={'20px'} w={'200px'} 
        alignItems={'center'}
        mb={5}
        isDisabled={isSubmitting}
        >{isSubmitting ? 'Submitting...' : 'Find Your Buddies!'}</Button>
        </Box>
      </form>
    </Box>
    </Container>
    </Flex>
  );
};