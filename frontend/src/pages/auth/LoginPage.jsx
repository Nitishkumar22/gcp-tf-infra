import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import { ChevronLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const LoginPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const { mutate: loginMutation, isPending, isError, error } = useMutation({
    mutationFn: async ({ username, password }) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        try {
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/login`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
                signal: controller.signal
            });
            console.log('Response headers:', {
              'set-cookie': res.headers.get('set-cookie'),
              'all headers': Array.from(res.headers.entries())
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                const errorData = await res.text();
                try {
                    const jsonError = JSON.parse(errorData);
                    throw new Error(jsonError.error || "Login failed");
                } catch {
                    throw new Error(errorData || "Login failed");
                }
            }

            const data = await res.json();
            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please try again.');
            }
            throw error;
        }
    },
    onSuccess: async (data) => {
        // First invalidate the auth query
        await queryClient.invalidateQueries({ queryKey: ["authUser"] });
        
        // Fetch the latest auth state
        const updatedUser = await queryClient.fetchQuery({ 
            queryKey: ["authUser"],
            staleTime: 0 // Force a fresh fetch
        });

        // Only navigate if we have a valid user
        if (updatedUser) {
            toast.success("Login successful");
            navigate('/posts', { replace: true }); // Using replace to prevent back navigation to login
        } else {
            toast.error("Authentication failed. Please try again.");
        }
    },
    onError: (error) => {
        toast.error(error.message || "Login failed");
    }
  });

  

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="h-screen flex items-center justify-center bg-zinc-800">
      <div className="max-w-md w-full mx-auto py-16 px-8 bg-white rounded-md shadow-md relative">
        <Link to="/" className="absolute flex items-center top-4 right-4">
          <ChevronLeft className="w-4 text-gray-800" /> Home
        </Link>
        <h1 className="text-3xl font-semibold font-mono text-gray-900 pb-4">
          <span className="font-normal">Welcome back to</span> CINEMATES
        </h1>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col">
          <div className="flex flex-col mb-4">
            <div className="flex items-center border border-zinc-500 rounded-lg p-2">
              <MdOutlineMail className="text-gray-400 mr-2" />
              <input
                type="text"
                className="w-full p-1 text-gray-700 focus:outline-none"
                placeholder="Username"
                name="username"
                onChange={handleInputChange}
                value={formData.username}
              />
            </div>
          </div>
          <div className="flex flex-col mb-4">
            <div className="flex items-center border border-zinc-500 rounded-lg p-2">
              <MdPassword className="text-gray-400 mr-2" />
              <input
                type="password"
                className="w-full p-1 text-gray-700 focus:outline-none"
                placeholder="Password"
                name="password"
                onChange={handleInputChange}
                value={formData.password}
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-zinc-900 hover:bg-zinc-100 hover:text-black text-white font-bold py-2 px-4 rounded-lg border border-zinc-900"
          >
            {isPending ? "Loading..." : "Login"}
          </button>
          {isError && <p className="text-red-500 mt-4">{error.message}</p>}
          {isError && console.log("Login error:", error.message)}
        </form>
        <div className="mt-4 flex justify-center gap-4">
          <p className="text-gray-700">{"Don't have an account?"}</p>
          <Link to="/signup">
            <button className="bg-transparent font-semibold hover:underline rounded-lg">
              Sign up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
