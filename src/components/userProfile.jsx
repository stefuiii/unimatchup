import React, { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
import { auth, database} from "../firebase-config";
import { doc, setDoc, getDoc, updateDoc} from 'firebase/firestore';
import { Box, Heading, FormControl, FormLabel, 
         Input, Button, Card, CardHeader, CardBody, Stack, Flex,
         Select, HStack, useToast, InputGroup, InputRightElement} from "@chakra-ui/react";
import myAvatar from "../icons/avatar13.svg"
import {
  Tag,
  TagLabel,
  TagCloseButton,
} from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'

export const CreateProfile = () => {
    const [uid] = useState('');
    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [gender, setGender] = useState('');
    const [major, setMajor] = useState('');
    const [nickName, setNickName] = useState('');
    const [hobby, setHobby] = useState('');
    const [hobbies, setHobbies] = useState([]);
    const toast = useToast();
    const user = auth.currentUser;
    const navigate = useNavigate();

    useEffect(() => {
      const fetchProfile = async () => {
        const profileRef = doc(database, "userProfile", user.uid);
        const profileSnap = await getDoc(profileRef);
  
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setLastName(data.lastName || "");
          setFirstName(data.firstName || "");
          setNickName(data.nickName || "");
          setGender(data.Gender || "");
          setMajor(data.Major || "");
          setHobbies(data.hobbies || []);
        }
      };
  
      fetchProfile();
    }, [uid]);

    const handleAddHobby = async () => {
      if (hobby.trim() !== '') {
        console.log("Button Clicked");
        const newHobbies = [...hobbies, hobby.trim()];
        setHobbies(newHobbies);
        setHobby('');
      }
    };

    const handleRemoveHobby = async (index) => {
      const newHobbies = hobbies.filter((_, i) => i !== index);
      setHobbies(newHobbies);
    };

    const handleSubmit = async(e) => {
      console.log('Button Clicked');
      e.preventDefault();
      if (user) {
        const uid = user.uid;
        const profile = doc(database, 'userProfile', uid);
        const checkExistence = await getDoc(profile);
        
        if (!checkExistence.exists()) {
          try {
            await setDoc(profile, {
              uid: uid,
              lastName: lastName,
              firstName: firstName,
              nickName: nickName,
              Gender: gender,
              Major: major,
              events: [],
              hobbies: hobbies
            });
            console.log("Document successfully written!");
            
            toast({
              title: "Profile Created.",
              description: "Your profile has been successfully created.",
              status: "success",
              duration: 2000,
              isClosable: true,
              onCloseComplete: () => {
                navigate('/home');
              },
            });

  
          } catch (error) {
            console.error("Error writing document: ", error);
            toast({
              title: "Failed to Create",
              description: "Your are failed to write your profile",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        } else {
            await updateDoc(profile, {
              lastName: lastName,
              firstName: firstName,
              nickName: nickName,
              Gender: gender,
              Major: major,
              hobbies: hobbies
            });

            toast({
              title: "Profile Updated.",
              description: "Your profile has been successfully updated",
              status: "success",
              duration: 2000,
              isClosable: true,
              onCloseComplete: () => {
                navigate('/home');
              },
            });
        }
        
        
      }
      
    }

  
   return (
    <Flex 
    height="100vh" 
    alignItems="center" 
    justifyContent="center"
    bg={'#E8D4B8'}
    >
     <Card border={'gray'} borderRadius={20} width={500}>
  <CardHeader>
    <Heading size='md' mt={5} mb={-3} >Show Your Profile to Your Buddies!</Heading>
  </CardHeader>
  <CardBody>
    <Stack>
      <HStack spacing={10}>
      <Box>
        <FormControl isRequired>
        <FormLabel mb='8px' size='xs' textTransform='uppercase'>
          First Name
        </FormLabel>
        <Input 
           bg={'white'}
           color={'black'}
           value={firstName} 
           onChange={(e) => setFirstName(e.target.value)}
           type="text" placeholder="your first name" width={300}/>
        </FormControl>
      </Box>
      <img src={myAvatar} alt="Avatar" width="100" height="100"/>
      </HStack>
      <Box>
        <FormControl isRequired>
        <FormLabel mb='8px' size='xs' textTransform='uppercase'>
          Last Name
        </FormLabel>
        <Input 
           bg={'white'}
           color={'black'}
           value={lastName} 
           onChange={(e) => setLastName(e.target.value)}
           type="text" placeholder="your last name" width={300} />
        </FormControl>
      </Box>     
      <Box >
        <FormControl isRequired>
        <FormLabel mb='8px' size='xs' textTransform='uppercase'>
          Nick Name
        </FormLabel>
        <Input 
           bg={'white'}
           color={'black'}
           value={nickName} 
           onChange={(e) => setNickName(e.target.value)}
           type="text" placeholder="what will be shown to your buddies" width={300}/>
        </FormControl>
      </Box> 
      <Box>
        <FormControl isRequired>
        <FormLabel mb='8px' size='xs' textTransform='uppercase'>
          Major
        </FormLabel>
        <Input 
           isRequired
           bg={'white'}
           color={'black'}
           value={major} 
           onChange={(e) => setMajor(e.target.value)}
           type="text" placeholder="your major" width={300}/>
        </FormControl>
      </Box>
      <Box>
        <FormControl isRequired>
        <FormLabel mb='8px' size='xs' textTransform='uppercase'>
          Gender
        </FormLabel>
        <Select placeholder='select option' color={'gray'} width={300}
        onChange={(e) => setGender(e.target.value)}>
          <option value='Male'>Male</option>
          <option value='Female'>Female</option>
          <option value='Unknown'>Unknown</option>
        </Select>
        </FormControl>
      </Box>
      <Box>
        <FormControl isRequired>
        <FormLabel mb='8px' size='xs' textTransform='uppercase'>
          Hobbies
        </FormLabel>
        <InputGroup>
          <Input 
             isRequired
             bg={'white'}
             color={'black'}
             value={hobby} 
             onChange={(e) => setHobby(e.target.value)}
             type="text" placeholder="add your hobbies" width={300}/>  
          <InputRightElement pointerEvents="auto" mr={160}>
            <Button mt={3} size="xs" onClick={handleAddHobby}>
              <AddIcon color="gray" />
            </Button>
          </InputRightElement>
        </InputGroup>
        <HStack spacing={2} wrap="wrap" mt={2}>
          {hobbies.map((tag, index) => (
            <Tag
              size="lg"
              key={index}
              borderRadius="full"
              variant="solid"
              colorScheme="teal" >
            <TagLabel>{tag}</TagLabel>
            <TagCloseButton onClick={() => handleRemoveHobby(index)} />
            </Tag>))}
        </HStack>
        </FormControl>
      </Box>

      <Button onClick={handleSubmit}
      p={3} mt={5}>Save Your Profile</Button>
    </Stack>
  </CardBody>
</Card>
    </Flex>
  );
};