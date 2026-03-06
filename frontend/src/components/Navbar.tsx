import React, { useState } from "react";
import axios from "axios";
import { Box, Flex, Text, Button, HStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const Navbar = () => {
  const handleLogout = () => {
    localStorage.removeItem("jwt");
    window.location.href = "/login";
  };

  const handleProfile = () => {
    localStorage.removeItem("jwt");
    window.location.href = "/profile";
  };

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      zIndex="1000"
      px={10}
      py={4}
    >
      <Flex justify="space-between" align="center">

        <Text
          fontSize="xl"
          fontWeight="bold"
          bgGradient="linear(to-r, blue.500, purple.500)"
          bgClip="text"
        >
          MiLo
        </Text>

        <HStack spacing={6}>
          <Text as={RouterLink} to="/feed" cursor="pointer">
            Feed
          </Text>

          <Text cursor="pointer">
            Explore
          </Text>

          <Text as={RouterLink} to="/profile" cursor="pointer">
            Profile
          </Text>

          <Button onClick={handleLogout}>
            Logout
          </Button>
        </HStack>

      </Flex>
    </Box>
  );
};

export default Navbar;