import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { ChevronLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {mutate, isError, isPending, error} = useMutation({
    mutationFn: async({email, password}) => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/signup`, {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const errorData = await res.text();
          try {
            const jsonError = JSON.parse(errorData);
            throw new Error(jsonError.error || "Signup failed");
          } catch {
            throw new Error(errorData || "Signup failed");
          }
        }

        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Signup error:", error);
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

      // Only show success if we have a valid user
      if (updatedUser) {
        toast.success("Account created successfully!");
        navigate('/onboarding', { replace: true });
      } else {
        toast.error("Account created but login failed. Please try logging in.");
        navigate('/login');
      }
    },
    onError: (error) => {
      toast.error(error.message || "Signup failed");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault(); //page wont reload
    
    // Validate passwords match before submission
    if (formData.password !== passwordConfirmation) {
      toast.error("Passwords don't match!");
      return;
    }
    
    // Temporarily store password for onboarding form
    sessionStorage.setItem('tempPassword', formData.password);
    
    mutate(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // If password field is being changed, check if it matches confirmation
    if (e.target.name === "password") {
      if (passwordConfirmation) {
        setPasswordMatch(e.target.value === passwordConfirmation);
      }
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setPasswordConfirmation(e.target.value);
    setPasswordMatch(formData.password === e.target.value);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-zinc-800">
      <div className="max-w-md w-full mx-auto py-16 px-8 bg-white rounded-md shadow-md relative">
        <Link to="/" className="absolute flex items-center top-4 right-4">
          <ChevronLeft className="w-4 text-gray-800" /> Home
        </Link>
        <h1 className="text-3xl font-semibold font-mono text-gray-900 pb-4"><span className=" font-normal">Join</span> CINEMATES</h1>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col ">
          <div className="flex flex-col mb-4">
            <div className="flex items-center border border-zinc-500 rounded-lg p-2">
              <MdOutlineMail className="text-gray-400 mr-2" />
              <input
                type="email"
                className="w-full p-1 text-gray-700 focus:outline-none"
                placeholder="Email"
                name="email"
                onChange={handleInputChange}
                value={formData.email}
              />
            </div>
          </div>
          {/* <div className="flex flex-col mb-4">
            <div className="flex items-center border border-zinc-500 rounded-lg p-2">
              <FaUser className="text-gray-400 mr-2" />
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
              <MdDriveFileRenameOutline className="text-gray-400 mr-2" />
              <input
                type="text"
                className="w-full p-1 text-gray-700 focus:outline-none"
                placeholder="Full Name"
                name="fullName"
                onChange={handleInputChange}
                value={formData.fullName}
              />
            </div>
          </div> */}
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
          <div className="flex flex-col mb-4">
            <div className="flex items-center border border-zinc-500 rounded-lg p-2">
              <MdPassword className="text-gray-400 mr-2" />
              <input
                type="password"
                className="w-full p-1 text-gray-700 focus:outline-none"
                placeholder="Confirm Password"
                name="passwordConfirmation"
                onChange={handleConfirmPasswordChange}
                value={passwordConfirmation}
              />
            </div>
            {passwordConfirmation && (
              <p className={`text-sm mt-1 ${passwordMatch ? 'text-green-500' : 'text-red-500'}`}>
                {passwordMatch ? 'Passwords match!' : 'Passwords do not match'}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="bg-zinc-900 hover:bg-zinc-600 hover:text-black text-white font-bold py-2 px-4 rounded-lg border border-zinc-900"
            disabled={isPending || (passwordConfirmation && !passwordMatch)}
          >
            {isPending ? "Loading..." : "Sign up"}
          </button>
          {isError && <p className="text-red-500 mt-4">{error.message}</p>}
        </form>
        <div className="mt-4 flex justify-center gap-4">
          <p className="text-gray-700">Already have an account?</p>
          <Link to="/login">
            <button
              className="bg-transparent font-semibold hover:underline rounded-lg"
            >
              Sign in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;