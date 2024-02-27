import React, { useEffect, useState, useRef } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "react-query";
import axios from "axios";
import { formatTimeAgo } from "../helpers/convertdatestring";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { truncateText } from "../helpers/TruncateText";
import { Reply } from "lucide-react";

const fetchComments = async (postId, page, limit) => {
  const response = await axios.get(
    `/api/comment/${postId}/comments?page=${page}&limit=${limit}`
  );
  return response.data.comments;
};

const CommentSection = ({ postId, numberOfComments }) => {
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10; // Number of comments per page
  const queryClient = useQueryClient();
  const { theme } = useSelector((state) => state.theme);
  const bgColor = theme === "light" ? "#EFEFEF" : "#1F1F22";
  const textColor = theme === "light" ? "#1F1F22" : "#FFFFFF";
  const tagColor = theme === "light" ? "#5C5C7B" : "#7878A3";

  const { currentUser } = useSelector((state) => state.user);

  const {
    data: comments,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    ["comments", postId],
    ({ pageParam = 1 }) => fetchComments(postId, pageParam, limit),
    {
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length === 0) return undefined;
        return allPages.length + 1;
      },
    }
  );

  const commentsEndRef = useRef(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createCommentMutation = useMutation(
    (content) =>
      axios.post(`/api/comment/${postId}/createcomment`, { content }),
    {
      onMutate: (newComment) => {
        // Optimistically update the UI
        const optimisticComment = {
          _id: Date.now(), // Use temporary ID
          content: newComment.content,
          createdAt: new Date().toISOString(),
          author: currentUser, // Assuming currentUser has all necessary fields
          likes: [],
          replies: [],
          depth: 0,
        };

        queryClient.setQueryData(["comments", postId], (oldData) => ({
          // Add the new comment optimistically
          pages: [
            [{ ...optimisticComment }, ...oldData.pages[0]], // Add the new comment to the first page
            ...oldData.pages.slice(1), // Keep other pages unchanged
          ],
          pageParams: oldData.pageParams,
        }));

        return { optimisticComment }; // Pass the optimistic comment to rollback in case of error
      },
      onError: (error, newComment, context) => {
        // Rollback the optimistic update
        queryClient.setQueryData(["comments", postId], (oldData) => ({
          pages: oldData.pages.map((page) =>
            page.filter(
              (comment) => comment._id !== context.optimisticComment._id
            )
          ),
          pageParams: oldData.pageParams,
        }));

        toast.error("Failed to add comment");
      },
      onSettled: () => {
        // Invalidate the query to refetch the latest data
        queryClient.invalidateQueries(["comments", postId]);
      },
    }
  );

  const updateCommentMutation = useMutation(
    ({ commentId, content }) =>
      axios.put(`/api/comment/updatecomment/${commentId}`, { content }),
    {
      onSuccess: () => {
        // Invalidate the query to refetch the latest data
        queryClient.invalidateQueries(["comments", postId]);
      },
      onError: (error) => {
        toast.error(`Error updating comment: ${error.toString()}`);
      },
    }
  );

  const replyCommentMutation = useMutation(
    ({ content, parentCommentId }) =>
      axios.post(`/api/comment/${parentCommentId}/reply`, { content }),
    {
      onMutate: ({ content, parentCommentId }) => {
        // Optimistically update the UI
        const optimisticReply = {
          _id: Date.now(), // Use temporary ID
          content,
          createdAt: new Date().toISOString(),
          author: currentUser, // Assuming currentUser has all necessary fields
          likes: [],
          depth: 1, // Assuming replies are always one level deep
        };

        queryClient.setQueryData(["comments", postId], (oldData) => ({
          pages: oldData.pages.map((page) =>
            page.map((comment) =>
              comment._id === parentCommentId
                ? {
                    ...comment,
                    replies: [optimisticReply, ...comment.replies], // Add the new reply optimistically
                  }
                : comment
            )
          ),
          pageParams: oldData.pageParams,
        }));

        return { optimisticReply }; // Pass the optimistic reply to rollback in case of error
      },
      onError: (error, newReply, context) => {
        // Rollback the optimistic update
        queryClient.setQueryData(["comments", postId], (oldData) => ({
          pages: oldData.pages.map((page) =>
            page.map((comment) =>
              comment._id === context.optimisticReply._id
                ? {
                    ...comment,
                    replies: comment.replies.filter(
                      (reply) => reply._id !== context.optimisticReply._id
                    ), // Remove the optimistic reply
                  }
                : comment
            )
          ),
          pageParams: oldData.pageParams,
        }));

        toast.error("Failed to add reply");
      },
      onSettled: () => {
        // Invalidate the query to refetch the latest data
        queryClient.invalidateQueries(["comments", postId]);
      },
    }
  );

  const handleChangeReplyTo = (commentId) => {
    setReplyTo(commentId);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
    setReplyContent("");
    toast("Reply canceled");
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center">
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );

  if (isError)
    return (
      <div className="text-red-500">
        {toast.error(`Error fetching comments: ${error.toString()}`)}
      </div>
    );

  const renderNestedComments = (currentComments, depth) => (
    <ul className={`pl-${depth * 2} list-none`}>
      {currentComments.map((comment, index) => (
        <li key={comment?._id || index}>
          <CommentItem
            comment={{ ...comment, depth: comment?.depth + 1 }}
            setReplyTo={handleChangeReplyTo}
            bgColor={bgColor}
            textColor={textColor}
            tagColor={tagColor}
          />
          {comment?.replies?.length > 0 && (
            <ul className="pl-4 list-none">
              {renderNestedComments(comment?.replies, depth + 1)}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );

  const wrappedComments = comments.pages.flatMap((page) =>
    page.map((comment) =>
      !comment.parentComment ? (
        <li key={comment._id}>
          <CommentItem
            comment={comment}
            setReplyTo={handleChangeReplyTo}
            bgColor={bgColor}
            textColor={textColor}
            tagColor={tagColor}
          />
          {comment.replies?.length > 0 && (
            <ul className="pl-4 list-none">
              {renderNestedComments(comment.replies, comment.depth + 1)}
            </ul>
          )}
        </li>
      ) : null
    )
  );

  return (
    <div className="shadow overflow-hidden sm:rounded-lg comment-section-container relative">
      <div style={{ backgroundColor: bgColor }} className="px-4 py-5 sm:px-6">
        <div className="flex gap-5">
          {numberOfComments === 0 ? (
            <div className="text-lg leading-6 font-medium">
              <p className="text-bold">Ready to drop some wisdom? </p>
            </div>
          ) : (
            <div className="text-sm my-5 flex items-center gap-4">
              <div className="flex items-center">
                <p
                  className={`font-medium text-lg text-${textColor} dark:text-${tagColor} text-bold`}
                >
                  Comments:
                </p>
              </div>
              <div
                className={`bg-${tagColor} dark:bg-${bgColor} border border-${tagColor} dark:border-${bgColor} rounded-full  px-4 py-2`}
              >
                <p className={`text-${textColor} dark:text-${textColor}`}>
                  {numberOfComments}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        className="border-t border-gray-200 pb-3"
        style={{ backgroundColor: bgColor }}
      >
        <dl>
          <ul className="list-none">{wrappedComments}</ul>
        </dl>
      </div>
      {hasNextPage && (
        <div className="flex justify-center" ref={commentsEndRef}>
          <button
            className="btn btn-outline btn-sm font-extralight hover:text-whiteInverted mt-3 mb-6 flex justify-center items-center"
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <svg
                className="animate-spin h-5 w-5 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : hasNextPage ? (
              "Load More"
            ) : (
              <div>
                <h1 className="font-bold ">Nothing more to load</h1>
              </div>
            )}
          </button>
        </div>
      )}
      <div className="px-4 py-3 sm:px-6 flex justify-center items-center">
        {replyTo && (
          <CommentForm
            key={replyTo}
            postId={postId}
            parentCommentId={replyTo}
            createCommentMutation={replyCommentMutation}
            setReplyTo={setReplyTo}
            setReplyContent={setReplyContent}
            replyContent={replyContent}
          />
        )}

        {!replyTo && (
          <CommentForm
            key="root"
            className="mt-5"
            postId={postId}
            createCommentMutation={createCommentMutation}
            setReplyTo={setReplyTo}
            setReplyContent={setReplyContent}
            replyContent={replyContent}
          />
        )}
      </div>
    </div>
  );
};

const CommentItem = ({
  comment,
  setReplyTo,
  bgColor,
  textColor,
  tagColor,
  postId,
}) => {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(""); // Initialize as empty string
  const { currentUser } = useSelector((state) => state.user);
  const truncatedUsername = truncateText(comment?.author?.username, 10);
  const [isLiked, setIsLiked] = useState(
    comment?.likes?.includes(currentUser?._id)
  );

  const queryClient = useQueryClient();
  const likeMutation = useMutation(
    () => axios.post(`/api/comment/${comment._id}/like`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["comments", postId]);
        setIsLiked(!isLiked); // Move this line here
      },
      onError: (error) => {
        toast.error(`Error liking comment: ${error.toString()}`);
      },
      staleTime: Infinity,
    }
  );

  const updateCommentMutation = useMutation(
    ({ commentId, content, userId }) =>
      axios.put(`/api/comment/updatecomment/${commentId}`, {
        content,
        userId,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["comments", comment._id]);
        setIsEditing(false); // Reset isEditing state after successful update
      },
      onError: (error) => {
        console.log(error.message);
      },
    }
  );

  const handleSave = async () => {
    try {
      await updateCommentMutation.mutateAsync({
        commentId: comment._id,
        content: editedContent,
        userId: currentUser._id,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleLike = async () => {
    // Optimistically update like
    setIsLiked(!isLiked);
    await likeMutation.mutateAsync();
  };

  // Set editedContent when editing starts
  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(comment.content); // Set the current comment content
  };

  const deleteCommentMutation = useMutation(
    () => axios.delete(`/api/comment/deletecomment/${comment._id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["comments", postId]);
        toast.success("Comment deleted successfully");
        setShowConfirmationModal(false); // Close the confirmation modal after successful deletion
      },
      onError: (error) => {
        toast.error(`Error deleting comment: ${error.toString()}`);
      },
    }
  );

  const handleDeleteComment = async () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await deleteCommentMutation.mutateAsync();
    }
  };

  const commentDepthClass = `depth-${comment.depth}`;

  return (
    <article
      className={`comment-item mb-4 rounded pl-8 ${
        comment.depth > 0 ? "nested-comment" : ""
      } ${commentDepthClass}`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="divider"></div>
      <header className="flex justify-between items-center">
        <div className="flex items-center">
          <img
            className="w-8 h-8 rounded-full"
            src={
              comment?.author?.avatar || "/assets/icons/profile-placeholder.svg"
            }
            alt={truncatedUsername}
          />
          <div className="ml-3">
            <strong className="text-sm font-semibold">
              {truncatedUsername}
            </strong>
            <small className="block text-gray-500">
              {formatTimeAgo(comment.createdAt)}
            </small>
          </div>
        </div>
        {/* Edit button */}
        {currentUser?._id === comment?.author?._id && (
          <button
            type="button"
            className="flex items-center text-gray-500 hover:text-blue-600 pr-4"
            onClick={handleEdit}
          >
            <img
              className="h-4 w-4 mr-1"
              src={"/assets/icons/edit.svg"}
              alt="Edit"
            />
            <span>Edit</span>
          </button>
        )}
      </header>

      <div className={`mt-2 pl-2 content ${commentDepthClass}`}>
        {isEditing ? (
          <div className="flex flex-col">
            <textarea
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 mb-2"
              value={editedContent}
              onChange={(e) => {
                setEditedContent(e.target.value);
              }}
            />
            <div className="flex justify-end">
              <button
                className="text-gray-500 hover:text-blue-600 mr-2"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="text-gray-500 hover:text-blue-600 pr-4"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="">{comment.content}</p>
        )}
        <div className="flex items-center mt-2">
          <img
            src={isLiked ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
            alt="like icon"
            onClick={handleLike}
            className="w-3 h-3 cursor-pointer"
          />
          <span className="mx-2 text-sm">{comment?.likes?.length}</span>
          <button
            className=" pr-2 pl-2"
            onClick={() => setReplyTo(comment._id)}
          >
            <Reply className="w-4 h-4 text-yellow-400" />
          </button>
          {currentUser?._id === comment?.author?._id && ( // Check if current user is the author of the comment
            <button className="pl-1" onClick={handleDeleteComment}>
              <img
                className="w-4 h-4"
                src={"/assets/icons/delete.svg"}
                alt="delte"
              />
            </button>
          )}
        </div>
      </div>
      
    </article>
  );
};

const CommentForm = ({
  postId,
  parentCommentId,
  createCommentMutation,
  setReplyTo,
  setReplyContent,
  replyContent,
}) => {
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (parentCommentId) {
      await createCommentMutation.mutateAsync({
        content: replyContent,
        parentCommentId,
      });
    } else {
      await createCommentMutation.mutateAsync(replyContent);
    }

    // Clear reply content after mutation
    setReplyContent("");
  };

  const textareaRef = useRef(null);

  useEffect(() => {
    if (parentCommentId) {
      textareaRef.current.focus();
    }
  }, [parentCommentId]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="">
        <div className="">
          <textarea
            ref={textareaRef}
            className="textarea textarea-bordered textarea-xs w-full max-w-xs"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={replyContent ? "" : "Add a comment..."} // Conditionally render placeholder text
            required
          />
        </div>
      </div>
      <div className="md:flex md:items-center">
        <div className="flex gap-3 pt-2">
          <button className="btn btn-primary" type="submit">
            {parentCommentId ? "Add Reply" : "Post Comment"}
          </button>
          {parentCommentId && (
            <button
              className="btn btn-ghost text-red-500 hover:text-red-700"
              type="button"
              onClick={() => setReplyTo(null)}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default CommentSection;
