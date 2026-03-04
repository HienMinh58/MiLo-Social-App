import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Box, Heading, Text, HStack, Button, Image } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import Register from "./components/Register";
import "./App.css";
import Login from "./components/Login";
import Feed from "./components/Feed";
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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/feed" element={<Feed />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
