import React from "react";
import { useInfiniteQuery } from "react-query";
import Loader from "../../components/shared/Loader";
import axios from "axios";
import UserCard from "./UserCard";
import { useParams } from "react-router-dom";

const fetchfollowing = async ({ pageParam = 1, userId }) => {
  const { data } = await axios.get(
    `/api/user/${userId}/following?page=${pageParam}&limit=3`
  );
  return data;
};

const Following = () => {
  const { id } = useParams();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
    status,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ["following", id],
    ({ pageParam = 1 }) => fetchfollowing({ pageParam, userId: id }),
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
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">Following</h2>
        {isLoading && !Following ? (
          <Loader />
        ) : (
          <>
            <ul className="user-grid">
              {data.pages
                .flatMap((page) => page.following)
                .map((following) => (
                  <li
                    key={following?._id}
                    className="flex-1 min-w-[200px] w-full  "
                  >
                    <UserCard user={following} />
                  </li>
                ))}
            </ul>
            {hasNextPage && (
              <div className="">
                <button
                  className="btn btn-sm"
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Following;
