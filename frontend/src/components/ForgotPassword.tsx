import React, { useState } from "react";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import { API_URL } from "../config/api";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetToken("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/account/forgot-password`, { email });
      setMessage(res.data?.message || "Please check your email for reset instructions.");
      if (res.data?.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
      px={4}
      py={12}
    >
      <Box
        maxW="md"
        w="full"
        p={8}
        borderRadius="28px"
        boxShadow="0 26px 80px rgba(23, 32, 51, 0.14)"
        bg="rgba(255, 255, 255, 0.92)"
        border="1px solid"
        borderColor="whiteAlpha.800"
      >
        <Heading mb={3} textAlign="center" color="#172033">
          Forgot password
        </Heading>
        <Text color="gray.600" textAlign="center" mb={8}>
          Enter your email and we will prepare password reset instructions.
        </Text>

        {error && (
          <Alert status="error" mb={5} borderRadius="16px">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert status="success" mb={5} borderRadius="16px">
            <AlertIcon />
            <AlertDescription>
              {message}
              {resetToken && (
                <Text mt={3} fontSize="xs" wordBreak="break-all">
                  Dev reset token: {resetToken}
                </Text>
              )}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <VStack spacing={5} align="stretch">
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                bg="#fbfaf7"
                borderRadius="16px"
                borderColor="blackAlpha.100"
                _focus={{ borderColor: "#26cba3", boxShadow: "0 0 0 3px rgba(38, 203, 163, 0.16)" }}
              />
            </FormControl>

            <Button
              type="submit"
              bg="#172033"
              color="white"
              size="lg"
              borderRadius="full"
              isLoading={loading}
              _hover={{ bg: "#25324d" }}
            >
              Send reset instructions
            </Button>
          </VStack>
        </form>

        <Text mt={6} textAlign="center" color="gray.600">
          Remember your password?{" "}
          <Link as={RouterLink} to="/login" color="#16866d" fontWeight="800">
            Login
          </Link>
        </Text>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
