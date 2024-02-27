import { useMutation, useQueryClient } from "react-query";
import axios from "axios";

const followUser = async ({ id }) => {
  const res = await axios.post(`/api/user/${id}/follow`);
  return res.data;
};

export const useFollowUser = (userData) => {
  const queryClient = useQueryClient();

  // Check if userData has a followers property and assign it to a variable
  const userFollowers = userData?.followers;

  return useMutation(followUser, {
    onMutate: async (id) => {
      // Cancel any outgoing refetches for the user query
      await queryClient.cancelQueries(["user", id]);

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(["user", id]);

      // Optimistically update the user with the new follower
      // If userFollowers is not null, use it instead of "me"
      queryClient.setQueryData(["user", id], (old) => ({
        ...old,
        followers: [...(old?.followers || []), userFollowers || "me"],
      }));

      // Return a context object with the snapshotted value
      return { previousUser };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["user", id], context.previousUser);
    },
    onSettled: (id) => {
      // After the mutation completes or fails, refetch the user query
      queryClient.invalidateQueries(["user", id]);
    },
  });
};

const unfollowUser = async ({ id }) => {
  const res = await axios.post(`/api/user/${id}/unfollow`);
  return res.data;
};

export const useUnfollowUser = (userData) => {
  const queryClient = useQueryClient();

  // Check if userData has a followers property and assign it to a variable
  const userFollowers = userData?.followers;

  return useMutation(unfollowUser, {
    onMutate: async (id) => {
      // Cancel any outgoing refetches for the user query
      await queryClient.cancelQueries(["user", id]);

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(["user", id]);

      // Optimistically update the user by removing the follower
      queryClient.setQueryData(["user", id], (old) => ({
        ...old,
        followers: old?.followers.filter(
          (follower) => follower !== (userFollowers || "me")
        ),
      }));

      // Return a context object with the snapshotted value
      return { previousUser };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["user", id], context.previousUser);
    },
    onSettled: (id) => {
      // After the mutation completes or fails, refetch the user query
      queryClient.invalidateQueries(["user", id]);
    },
  });
};
