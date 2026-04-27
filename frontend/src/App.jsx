import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
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

// Utility function to decode JWT and extract user ID
function getUserIdFromToken(token) {
  const payload = jwt_decode(token);
  return payload.sub || payload.nameidentifier || payload.userId || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
}

function Home() {
  return (
    <Box textAlign={"center"} 
    py={10} 
    px={4} 
    minH="100vh" 
    display="flex" 
    bg="white"
    flexDirection="column"
    justifyContent={"center"}>
      <HStack 
        spacing={5} 
        justify="center" 
        mb={8}
        alignItems="center"
      >
        <Image
          src="/milo.jpg"
          alt="MiLo Logo"
          boxSize={{ base: "52px", md: "68px" }}
          objectFit="contain"
          borderRadius="md"
        />
        <Heading 
          size="3xl" 
          color="gray.800"
          lineHeight="1.1"
        >
          MiLo Chat App
        </Heading>
      </HStack>
      <Text mb={10} fontSize="lg" color="gray.600">
          Welcome to MiLo. A real time chat app
      </Text>
      <HStack spacing={4} justify={"center"}>
        <Button
          as={RouterLink}
          to={"/register"}
          colorScheme='blue'
          variant={'outline'}
          size="lg"
          minW="140px"
        >
          Register
        </Button>
        <Button
          as={RouterLink}
          to="/login"
          colorScheme="blue"
          variant="outline"
          size="lg"
          minW="140px"
        >
          Login
        </Button>
      </HStack>
    </Box>
  )
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
  )
}

export default App
