import React, { useEffect } from "react";
import { useInfiniteQuery } from "react-query";
import GridPostList from "../../components/shared/GridPostList";
import { useSelector } from "react-redux";
import Loader from "../../components/shared/Loader";
import axios from "axios";

const fetchSavedPosts = async ({ pageParam = 1, userId }) => {
  const { data } = await axios.get(
    `/api/user/${userId}/savedPosts?page=${pageParam}&limit=3`
  );
  return data;
};

const Saved = () => {
  const { currentUser } = useSelector((state) => state.user);



  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    status,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ["savedPosts", currentUser._id],
    ({ pageParam = 1 }) =>
      fetchSavedPosts({ pageParam, userId: currentUser._id }),
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
    }
  );

  if (isLoading)
    return (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
        <Loader />
      </div>
    );

  if (error)
    return (
      <div className="flex-center w-full h-full">
        An error has occurred: {error.message}
      </div>
    );

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <img src="/assets/icons/save.svg" width={36} height={36} alt="edit" />
        <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
      </div>

      {status === "loading" ? (
        <div>
          <Loader />
        </div>
      ) : status === "error" ? (
        <span>Error: {error.message}</span>
      ) : (
        <>
          {data.pages.flatMap((page) => page.savedPosts).length === 0 && (
            <p className="text-light-4">No Saved posts</p>
          )}
          <div className="w-full flex justify-center max-w-5xl gap-9">
            <GridPostList
              posts={data.pages.flatMap((page) => page.savedPosts)}
            />
          </div>
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <Loader />
              ) : hasNextPage ? (
                "Load More"
              ) : (
                "Nothing more to load"
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Saved;
