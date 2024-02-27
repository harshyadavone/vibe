// // queries/posts.js

// import { useQuery } from "react-query";
// import axios from "axios";

// export const fetchPosts = async () => {
//   const limit = 8;
//   try {
//     const response = await axios.get(`/api/post/getposts?limit=${limit}`);
//     return response.data;
//   } catch (error) {
//     throw new Error(`Error fetching posts: ${error.message}`);
//   }
// };

// export const usePosts = () => {
//   return useQuery(["posts"], () => fetchPosts(), {
//     refetchOnWindowFocus: false,
//   });
// };
