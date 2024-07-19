import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

export const TermsOfService = () => {
    return (
        <Box p={4} maxW="800px" mx="auto" >
        <Heading as="h1" size="xl" textAlign="center" mb={6}>
          Terms of Service
        </Heading>
        <Text textAlign="justify">
        By using our services, you agree to UniMatchUp collecting your personal information, such as your email address, student identification details, and other related data.
        </Text>
      </Box>
    );
};
