import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase-config.js";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { Box, Heading, FormControl, FormLabel, Input, InputRightElement, Button, Flex, FormErrorMessage, InputGroup, IconButton, useToast } from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

export const Register = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if email ends with @u.nus.edu
    if (!email.endsWith("@u.nus.edu")) {
      setEmailError("You must use an email that ends with @u.nus.edu.");
      return;
    }

    try {
      // Register the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;

      // Send email verification
      await sendEmailVerification(currentUser);

      toast({
        title: "Registration successful!",
        description: "Please check your email for verification.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate('/login');
    } catch (error) {
      toast({
        title: "Registration failed.",
        description: `Error: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }

  const handleLoginClick = () => {
    props.onFormSwitch('login');
    navigate('/login');
  }

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value.endsWith("@u.nus.edu")) {
      setEmailError('');
    } else {
      setEmailError('You must use an email that ends with @u.nus.edu.');
    }
  }

  return (
    <Flex
      bg={"#FFEFDA"}
      width='100vw'
      height='100vh'
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      alignContent="center"
    >
      <Box
        p={10}
        borderWidth={3}
        borderRadius="20px"
        width={400}
        bg="white"
      >
        <Heading as="h2" mb={5}>Register</Heading>
        <form onSubmit={handleSubmit}>
          <FormControl id="name" mb={4} isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input
              bg={'white'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Your Name"
            />
          </FormControl>
          <FormControl id="email" mb={4} isRequired isInvalid={!!emailError}>
            <FormLabel>Your Email</FormLabel>
            <Input
              bg={'white'}
              value={email}
              onChange={handleEmailChange}
              type="email"
              placeholder="youremail@u.nus.edu"
              name="email"
            />
            {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
          </FormControl>
          <FormControl id="password" mb={4} isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                bg={'white'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="********"
                name="password"
              />
              <InputRightElement width="4.5rem">
                <IconButton
                  h="1.75rem"
                  size="sm"
                  mt={2}
                  mr={-5}
                  bg={'none'}
                  onClick={() => setShowPassword(!showPassword)}
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <Button type="submit" colorScheme="blue" w="full" mb={4}>
            <strong>Register</strong>
          </Button>
        </form>
        <Button onClick={handleLoginClick} colorScheme="teal" variant="link" w="full">
          Already have an account? Login here!
        </Button>
      </Box>
    </Flex>
  );
};
