import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { API_URL } from "../config/api";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Alert,
  AlertIcon,
  AlertDescription,
  IconButton,
} from "@chakra-ui/react";

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
      if (res && res.data && typeof res.data.message === "string")
        setMessage(res.data.message);
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
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
      bgGradient="radial(circle at top left, blue.100, purple.100, white)"
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
        borderWidth={1}
        borderRadius={"lg"}
        boxShadow={"lg"}
        bg={"white"}
      >
        <Heading mb={8} textAlign={"center"} color={"gray.800"}>
          Register
        </Heading>
        {/* Success Message */}
        {message && (
          <Alert status="success" mb={6} borderRadius="md">
            <AlertIcon />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {/*Error messages*/}
        {errors.length > 0 && (
          <Alert status="error" mb={6} borderRadius="md">
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
              required
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="teal"
            width="full"
            size="lg"
            isLoading={loading}
            loadingText="Sending..."
          >
            Register
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default Register;
