import React from "react";
import { useInfiniteQuery } from "react-query";
import Loader from "../../components/shared/Loader";
import axios from "axios";
import UserCard from "./UserCard";
import { useParams } from "react-router-dom";

const fetchfollowers = async ({ pageParam = 1, userId }) => {
  const { data } = await axios.get(
    `/api/user/${userId}/followers?page=${pageParam}&limit=10`
  );
  return data;
};

const Followers = () => {
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
    ["followers", id],
    ({ pageParam = 1 }) => fetchfollowers({ pageParam, userId: id }),
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
        <h2 className="h3-bold md:h2-bold text-left w-full">Followers</h2>
        {isLoading && !Followers ? (
          <Loader />
        ) : (
          <>
            <ul className="user-grid">
              {data.pages
                .flatMap((page) => page.followers)
                .map((follower) => (
                  <li
                    key={follower?._id}
                    className="flex-1 min-w-[200px] w-full  "
                  >
                    <UserCard user={follower} />
                  </li>
                ))}
            </ul>
            <div className="flex justify-center">
              <button
                className="btn btn-outline btn-sm font-medium hover:text-whiteInverted mt-3 mb-6 flex justify-center items-center relative"
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader />
                  </div>
                ) : hasNextPage ? (
                  "Load More"
                ) : (
                  <div>
                    <h1 className="font-bold">Nothing more to load</h1>
                  </div>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Followers;
