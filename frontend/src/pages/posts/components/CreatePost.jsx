import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [imgs, setImgs] = useState([]);
  const imgRef = useRef(null);

  const {data: authUser} = useQuery({queryKey: ['authUser']});
  const queryClient = useQueryClient();

  const { mutate: createPost, isPending, isError, error } = useMutation({
    mutationFn: async ({ text, imgs }) => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/posts/create`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ text, imgs }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      setText("");
      setImgs([]);
      toast.success("Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPost({ text, imgs });
  };

  const handleImgChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImgs((prevImgs) => [...prevImgs, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImgs((prevImgs) => prevImgs.filter((_, i) => i !== index));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4'
    >
      <div className='flex items-start gap-4'>
        <div className='flex-shrink-0'>
          <Avatar className="h-10 w-10 border border-primary">
            <AvatarImage
              src={authUser.profileImg} 
              alt={authUser.fullName}
            />
            <AvatarFallback>
              {authUser.fullName?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <form className='flex-grow' onSubmit={handleSubmit}>
          <textarea
            className='w-full p-2 text-base resize-none border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white transition duration-200'
            placeholder='What is happening?!'
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
          />
          <AnimatePresence>
            {imgs.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className='flex flex-wrap gap-2 mt-2'
              >
                {imgs.map((img, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className='relative w-24 h-24'
                  >
                    <button
                      className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition duration-200'
                      onClick={() => removeImage(index)}
                    >
                      <IoCloseSharp className='w-4 h-4' />
                    </button>
                    <img src={img} className='w-full h-full object-cover rounded-md' alt={`Uploaded preview ${index + 1}`} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <div className='flex justify-between items-center mt-2'>
            <div className='flex gap-2 items-center'>
              <button
                type="button"
                className='text-primary hover:text-primary-dark transition duration-200'
                onClick={() => imgRef.current.click()}
              >
                <CiImageOn className='w-6 h-6' />
              </button>
              <button
                type="button"
                className='text-primary hover:text-primary-dark transition duration-200'
              >
                <BsEmojiSmileFill className='w-5 h-5' />
              </button>
            </div>
            <button
              type="submit"
              className='px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={isPending || text.trim() === ''}
            >
              {isPending ? "Posting..." : "Post"}
            </button>
          </div>
          <input type='file' accept='image/*' multiple hidden ref={imgRef} onChange={handleImgChange} />
        </form>
      </div>
      {isError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='mt-2 text-red-500 text-sm'
        >
          {error.message}
        </motion.div>
      )}
    </motion.div>
  );
}

export default CreatePost;
