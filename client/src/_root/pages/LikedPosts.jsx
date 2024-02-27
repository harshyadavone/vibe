import { useInfiniteQuery } from "react-query";
import axios from "axios";
import GridPostList from "../../components/shared/GridPostList";
import Loader from "../../components/shared/Loader";

const fetchLikedPosts = async ({ pageParam = 1, userId }) => {
  const { data } = await axios.get(
    `/api/user/getlikedposts/${userId}?page=${pageParam}&limit=3`
  );
  return data;
};

const LikedPosts = ({ currentUser }) => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ["likedPosts", currentUser._id],
    ({ pageParam = 1 }) =>
      fetchLikedPosts({ pageParam, userId: currentUser._id }),
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
    <>
      {data.pages.flatMap((page) => page.likedPosts).length === 0 && (
        <p className="text-light-4">No liked posts</p>
      )}

      <GridPostList
        posts={data.pages.flatMap((page) => page.likedPosts)}
        showStats={false}
      />

      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
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
  );
};

export default LikedPosts;
