import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Search } from "lucide-react";
import { useInfiniteQuery } from "react-query";
import axios from "axios";
import useDebounce from "../../components/shared/useDebounce";
import Loader from "../../components/shared/Loader";
import UserCard from "../../components/shared/UserCard";

const SearchUser = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const inputBorderColor =
    theme === "light" ? "border-gray-300" : "border-gray-700";

  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchSearchResults = async ({ pageParam = 1 }) => {
    const { data } = await axios.get(
      `api/post/search?searchTerm=${debouncedSearchTerm}&page=${pageParam}&limit=10`
    );
    return data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(
      ["searchResults", debouncedSearchTerm],
      fetchSearchResults,
      {
        getNextPageParam: (lastPage, pages) => {
          if (lastPage.hasMore) return pages.length + 1;
        },
        enabled: debouncedSearchTerm !== "",
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: false,
      }
    );

  // console.log(data.pages.flatMap((page) => page.users));

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="mx-auto w-full">
      <div className="w-full  mx-auto mt-4 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            id="search"
            onChange={handleSearch}
            type="text"
            placeholder="Search..."
            className={`block w-full pl-10 pr-4 py-2 border ${inputBorderColor}  rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
        </div>
      </div>
      <div className="common-container">
        <div className="user-container">
          <h2 className="h3-bold md:h2-bold text-left w-full">Result</h2>
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <ul className="user-grid">
                {data && data.pages.flatMap((page) => page.users).length > 0 ? (
                  data.pages
                    .flatMap((page) => page.users)
                    .filter((user) => user._id !== currentUser._id) // Exclude your own user ID
                    .map((users) => (
                      <li
                        key={users?._id}
                        className="flex-1 min-w-[200px] w-full"
                      >
                        <UserCard user={users} />
                      </li>
                    ))
                ) : (
                  <div>No users found</div>
                )}
              </ul>

              {hasNextPage && (
                <button
                  className="btn btn-sm btn-outline btn-primary mt-3 flex justify-center items-center hover:text-white"
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
      </div>
    </div>
  );
};

export default SearchUser;
