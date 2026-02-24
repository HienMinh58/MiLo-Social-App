import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Box, Heading, Text, HStack, Button, Image } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import Register from './components/Register'
import './App.css'
import Login from './components/Login'
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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
