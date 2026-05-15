import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { API_URL } from '../config/api';
import { Alert, AlertDescription, AlertIcon, Box, Button, FormControl, FormLabel, Heading, Input, Link, Text } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

interface IdentityError {
  code: string;
  description: string;
}

const Register: React.FC = () => {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors([]);
    setMessage("");
  };

  const parseApiErrors = (data: unknown): string[] => {
    if (
      Array.isArray(data) &&
      data.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          "description" in (item as any)
      )
    ) {
      return (data as IdentityError[]).map((i) => i.description);
    }

    if (data && typeof data === "object" && "message" in (data as any)) {
      return [(data as any).message];
    }

    if (typeof data === "string") return [data];

    return ["Error. Please try again."];
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrors([]);
    setMessage("");

    // Client-side validation
    const validationErrors: string[] = [];
    if (!form.name.trim()) validationErrors.push("Please Enter Your Name.");
    if (!form.email.trim()) validationErrors.push("Please Enter Your email.");
    if (!form.password) validationErrors.push("Please Enter Your password.");
    if (form.password && form.password.length < 6)
      validationErrors.push("Password must have at least 6 characters.");
    if (form.password !== form.confirmPassword)
      validationErrors.push("Confirm password does not match.");

    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userName: form.name,
        email: form.email,
        password: form.password,
      };
      const res = await axios.post(`${API_URL}/account/register`, payload);
      if (res && res.data && typeof res.data.message === 'string') {
        setMessage(res.data.message + " Redirecting to login...");
      } else {
        setMessage("Registration successful! Redirecting to login...");
      }
      setForm({ name: '', email: '', password: '', confirmPassword: '' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const error = err as AxiosError;
      if (error.response && error.response.data) {
        const parsed = parseApiErrors(error.response.data as unknown);
        setErrors(parsed);
      } else {
        setErrors(["Cannot connect to server. Please try again."]);
      }
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
      display={"flex"}
      alignItems={"center"}
      justifyContent={"center"}
      px={4}
      py={12}
    >
      <Box
        position={"relative"}
        maxW={"md"}
        w={"full"}
        p={8}
        borderRadius={"28px"}
        boxShadow={"0 26px 80px rgba(23, 32, 51, 0.14)"}
        bg={"rgba(255, 255, 255, 0.92)"}
        border="1px solid"
        borderColor="whiteAlpha.800"
      >
        <Heading mb={2} textAlign={"center"} color={"#172033"}>
          Register
        </Heading>
        <Text color="gray.600" textAlign="center" mb={8}>
          Create your MiLo account.
        </Text>
        {/* Success Message */}
        {message && (
          <Alert status="success" mb={6} borderRadius="16px">
            <AlertIcon />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {/*Error messages*/}
        {errors.length > 0 && (
          <Alert status="error" mb={6} borderRadius="16px">
            <AlertIcon />
            <AlertDescription>
              {errors.map((err, index) => (
                <div key={index}>{err}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <FormControl mb={5}>
            <FormLabel>Name</FormLabel>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
              bg="#fbfaf7"
              borderRadius="16px"
              borderColor="blackAlpha.100"
              _focus={{ borderColor: "#26cba3", boxShadow: "0 0 0 3px rgba(38, 203, 163, 0.16)" }}
              required
            />
          </FormControl>

          <FormControl mb={5}>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@example.com"
              bg="#fbfaf7"
              borderRadius="16px"
              borderColor="blackAlpha.100"
              _focus={{ borderColor: "#26cba3", boxShadow: "0 0 0 3px rgba(38, 203, 163, 0.16)" }}
              required
            />
          </FormControl>

          <FormControl mb={5}>
            <FormLabel>Password</FormLabel>
            <Input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              bg="#fbfaf7"
              borderRadius="16px"
              borderColor="blackAlpha.100"
              _focus={{ borderColor: "#26cba3", boxShadow: "0 0 0 3px rgba(38, 203, 163, 0.16)" }}
              required
            />
          </FormControl>

          <FormControl mb={8}>
            <FormLabel>Validate Password</FormLabel>
            <Input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
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
            borderRadius="full"
            isLoading={loading}
            loadingText="Sending..."
            _hover={{ bg: "#25324d" }}
          >
            Register
          </Button>
        </form>

        <Text mt={6} textAlign="center" color="gray.600">
          Already have an account?{" "}
          <Link as={RouterLink} to="/login" color="#16866d" fontWeight="800">
            Login
          </Link>
        </Text>
      </Box>
    </Box>
  );
};

export default Register;
