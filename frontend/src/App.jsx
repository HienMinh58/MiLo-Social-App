import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Box, Heading, Text, HStack, Button, Image } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

import Register from './components/Register'
import './App.css'
import Login from './components/Login'
import Feed from './components/Feed'
import Profile from './components/Profile'
import Messenger from './components/Messenger'
import Navbar from './components/Navbar'
import FriendsManager from './components/FriendsManager'
import ForgotPassword from './components/ForgotPassword'

// Utility function to decode JWT and extract user ID
function getUserIdFromToken(token) {
  const payload = jwt_decode(token);
  return payload.sub || payload.nameidentifier || payload.userId || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
}

function Home() {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      w="100vw"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="radial(circle at top left, blue.100, purple.100, white)"
      px={6}
    >
      <Box
        bg="white"
        p={{ base: 8, md: 12 }}
        borderRadius="2xl"
        boxShadow="xl"
        textAlign="center"
        maxW="600px"
        w="100%"
      >
        <HStack justify="center" mb={6} spacing={4}>
          <Image
            src="/milo.jpg"
            alt="MiLo Logo"
            boxSize="70px"
            borderRadius="xl"
            boxShadow="md"
          />
          <Heading
            size="2xl"
            bgGradient="linear(to-r, blue.500, purple.500)"
            bgClip="text"
          >
            MiLo Chat
          </Heading>
        </HStack>

        <Text fontSize="lg" color="gray.600" mb={8}>
          Connect instantly. Chat in real-time. Experience seamless messaging
          with MiLo.
        </Text>

        <HStack spacing={4} justify="center">
          <Button
            as={RouterLink}
            to="/register"
            colorScheme="blue"
            size="lg"
            px={8}
            borderRadius="full"
            boxShadow="md"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
          >
            Get Started
          </Button>

          <Button
            as={RouterLink}
            to="/login"
            variant="outline"
            colorScheme="blue"
            size="lg"
            px={8}
            borderRadius="full"
            _hover={{
              bg: "blue.50",
            }}
          >
            Login
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}

function App() {
  const accessToken = localStorage.getItem("jwt");
  const currentUserId = accessToken ? getUserIdFromToken(accessToken) : null;

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/feed" element={accessToken ? <Feed /> : <Home />} />
        <Route path='/profile' element={accessToken ? <Profile /> : <Home />} />
        <Route path='/profile/:userId' element={accessToken ? <Profile /> : <Home />} />
        <Route path='/friends' element={accessToken ? <FriendsManager /> : <Home />} />
        <Route 
          path='/messenger' 
          element={
            accessToken ? (
              <Messenger />
            ) : (
              <Home />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
