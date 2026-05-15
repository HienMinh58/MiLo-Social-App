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
  HStack,
  Input,
  Link,
  Text,
} from "@chakra-ui/react";
import { API_URL } from "../config/api";

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrors([]);

    const validationErrors: string[] = [];
    if (!form.email.trim()) validationErrors.push("Please enter your email.");
    if (!form.password) validationErrors.push("Please enter your password.");

    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/account/login`, form);
      const { token } = response.data;
      localStorage.setItem("jwt", token);
      window.location.href = "/feed";
    } catch (err: any) {
      if (err.response?.status === 401) {
        setErrors(["Invalid email or password."]);
      } else {
        setErrors(["Something went wrong. Please try again."]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box position="fixed" top="0" left="0" w="100vw" h="100vh" display="flex" alignItems="center" justifyContent="center" px={4} py={12}>
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
        <Heading mb={2} textAlign="center" color="#172033">
          Login
        </Heading>
        <Text color="gray.600" textAlign="center" mb={8}>
          Welcome back to MiLo.
        </Text>

        {errors.length > 0 && (
          <Alert status="error" mb={6} borderRadius="16px">
            <AlertIcon />
            <AlertDescription>
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <FormControl mb={5}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              bg="#fbfaf7"
              borderRadius="16px"
              borderColor="blackAlpha.100"
              _focus={{ borderColor: "#26cba3", boxShadow: "0 0 0 3px rgba(38, 203, 163, 0.16)" }}
              required
            />
          </FormControl>

          <FormControl mb={3}>
            <HStack justify="space-between" mb={2}>
              <FormLabel mb={0}>Password</FormLabel>
              <Link as={RouterLink} to="/forgot-password" color="#16866d" fontWeight="800" fontSize="sm">
                Forgot password?
              </Link>
            </HStack>
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              bg="#fbfaf7"
              borderRadius="16px"
              borderColor="blackAlpha.100"
              _focus={{ borderColor: "#26cba3", boxShadow: "0 0 0 3px rgba(38, 203, 163, 0.16)" }}
              required
            />
          </FormControl>

          <Button
            type="submit"
            bg="#172033"
            color="white"
            width="full"
            size="lg"
            mt={4}
            borderRadius="full"
            isLoading={loading}
            _hover={{ bg: "#25324d" }}
          >
            Login
          </Button>
        </form>

        <Text mt={6} textAlign="center" color="gray.600">
          Don't have an account?{" "}
          <Link as={RouterLink} to="/register" color="#16866d" fontWeight="800">
            Register
          </Link>
        </Text>
      </Box>
    </Box>
  );
};

export default Login;
