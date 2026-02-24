import React, { useState } from "react";
import axios from "axios";
import { API_URL } from '../config/api';
import { AlertDescription, Box, Button, FormControl, FormLabel, Input, Heading, Alert, AlertIcon} from '@chakra-ui/react';
interface LoginForm {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const [form, setForm] = useState<LoginForm>({email: '', password: ''});
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setErrors([]);
        setMessage('');

        const validationErrors: string[] = [];
        if (!form.email.trim()) validationErrors.push("Please enter your name.");
        if (!form.password) validationErrors.push("Please enter your password.");

        if (validationErrors.length){
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/account/register`, form);
            const { token } = response.data;
            localStorage.setItem('jwt', token);
            alert('Login successful!');
        }  catch (err: any) {
            if (err.response?.status === 401) {
                setErrors(['Invalid email or password.']);
            } else {
                setErrors(['Something went wrong. Please try again.']);
            }
        } finally {
            setLoading(false);
        }
    }

return (
        <Box
            minH="100vh"                    // ← Full screen height
            bg="white"                      // ← White background (removes black bar)
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
                borderWidth={1}
                borderRadius="lg"
                boxShadow="lg"
                bg="white"
            >
                <Heading mb={8} textAlign="center" color="gray.800">
                    Login
                </Heading>

                {/* Error alert – only shows when there are errors */}
                {errors.length > 0 && (
                    <Alert status="error" mb={6} borderRadius="md">
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
                            required
                        />
                    </FormControl>

                    <FormControl mb={6}>
                        <FormLabel>Password</FormLabel>
                        <Input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </FormControl>

                    <Button
                        type="submit"
                        colorScheme="teal"
                        width="full"
                        size="lg"
                        isLoading={loading}
                    >
                        Login
                    </Button>
                </form>
            </Box>
        </Box>
    );

};

export default Login;