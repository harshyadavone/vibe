import React from "react";
import { useInfiniteQuery } from "react-query";
import PostCard from "../../components/shared/PostCard";
import Loader from "../../components/shared/Loader";

const fetchPosts = async ({ pageParam = 1 }) => {
  const res = await fetch(
    `/api/post/getposts?startIndex=${(pageParam - 1) * 5}&limit=5`
  );
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  return res.json();
};

const Home = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery("posts", fetchPosts, {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.hasMore) return pages.length + 1;

        return false;
      },
      //give one minute of stale time
      staleTime: 60 * 1000,
    });

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2>
          {status === "loading" ? (
            <div className="flex flex-row items-center justify-center">
              <svg
                className="spinner-ring spinner-primary spinner-sm"
                viewBox="25 25 50 50"
                strokeWidth="5"
              >
                <circle cx="50" cy="50" r="20" />
              </svg>
              <span className="ml-2">Loading...</span>
            </div>
          ) : status === "error" ? (
            <div>Error fetching data</div>
          ) : (
            <>
              {data.pages.map((pageData, i) => (
                <React.Fragment key={i}>
                  {pageData.posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </React.Fragment>
              ))}
              <div className="flex justify-center">
                <button
                  className="btn btn-outline btn-sm font-medium hover:text-whiteInverted mt-3 mb-6 flex justify-center items-center"
                  onClick={() => fetchNextPage()}
                  disabled={!hasNextPage || isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <Loader />
                  ) : hasNextPage ? (
                    "Load More"
                  ) : (
                    <div>
                      <h1 className="font-bold ">Nothing more to load</h1>
                    </div>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
