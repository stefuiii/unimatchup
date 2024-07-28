import React, { useState } from "react";
import { database } from "../firebase-config.js";
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { query, collection, where, getDocs} from "firebase/firestore";
import { Box, Heading, FormControl, FormLabel, Input, Button, Flex, useToast } from "@chakra-ui/react";

export const Login = (props) => {
    const auth = getAuth();
    const toast = useToast();
    const [email, setEmail] = useState('');
    const [password, setPass] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(email);

        try {
          // Sign in user
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          // Check if email is verified
          if (user.emailVerified) {
              // Check if user profile exists
              const userProfileQuery = query(collection(database, "userProfile"), where("uid", "==", user.uid));
              const querySnapshot = await getDocs(userProfileQuery);
              
              if (querySnapshot.empty) {
                  // If no user profile exists, navigate to createProfile
                  toast({
                      title: "Login successful!",
                      description: "Welcome! Please create your profile.",
                      status: "success",
                      duration: 5000,
                      isClosable: false,
                  });
                  setTimeout(() => {
                      navigate('/createprofile'); // Redirect to createProfile
                  }, 1000);
              } else {
                  // If user profile exists, navigate to guide
                  toast({
                      title: "Login successful!",
                      description: "Welcome back!",
                      status: "success",
                      duration: 5000,
                      isClosable: false,
                  });
                  setTimeout(() => {
                      navigate('/home'); // Redirect to guide
                  }, 1000);
              }
          } else {
              // Email is not verified, prompt the user to verify their email
              toast({
                  title: "Verify your email",
                  description: "Please verify your email address. A verification link has been sent to your email.",
                  status: "warning",
                  duration: 7000,
                  isClosable: true,
              });
              await sendEmailVerification(userCredential.user);
              // Optional: Sign out the user or redirect them to a page informing them to check their email
              await auth.signOut();
              navigate('/login'); // Redirect back to login
          }
      } catch (error) {
          console.log(error);
          toast({
              title: "Login failed",
              description: "Login failed. Please check your email and password and try again.",
              status: "error",
              duration: 7000,
              isClosable: true,
          });
      }
  };

    const handleRegisterClick = () => {
        console.log('Button clicked!'); 
        props.onFormSwitch('register');
        navigate('/register');
    };

    return (
        <Flex 
          bg={"#FFEFDA"}
          width='100vw'
          height='100vh'
          display="flex"
          flexDirection="column"
          justifyContent="center" 
          alignItems="center"
          alignContent="center">
        <Box className="auth-form-container" 
        p={10} 
        borderWidth={3} 
        borderRadius="20px"
        width={400}>
            <Heading as="h1" mb={4}>Login</Heading>
            <form className="login-form" action="" onSubmit={handleSubmit}>
              <FormControl id="email" mb={4} isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  bg={'white'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="yourname@email.com"
                  name="email"
                />
              </FormControl>
              <FormControl id="password" mb={4} isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  bg={'white'}
                  value={password}
                  onChange={(e) => setPass(e.target.value)}
                  type="password"
                  placeholder="********"
                  name="password"
                />
              </FormControl>
              <Button className="login-btn" type="submit" colorScheme="blue" w="full" mb={4}>
                <strong>Log In</strong>
              </Button>
            </form>
            <Button className="link-btn" onClick={handleRegisterClick} colorScheme="teal" variant="link" w="full">
              Don't have an account? Register here!
            </Button>
        </Box>
        </Flex>
    );
};