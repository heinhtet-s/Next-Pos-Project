import React, { useEffect } from "react";

import debounce from "lodash/debounce";
import { ChangeEventTypes } from "@/dto/form";
import { AiOutlineSearch } from "react-icons/ai";
import { Input } from "./input";

const SearchInput = ({
  setSearch,
}: {
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}) => {
  // State to keep track of the search query
  const [searchQuery, setSearchQuery] = React.useState("");

  // Function to perform the search (replace this with your anpm i --save-dev @types/lodashctual search implementation)

  // Debounced version of the search function with a delay of 500 milliseconds
  const debouncedSearch = React.useMemo(
    () => debounce((query: string) => setSearch(query), 500),
    []
  );

  // Handle changes in the search input
  const handleSearchChange = (event: ChangeEventTypes) => {
    const { value } = event.target;
    setSearchQuery(value);
    debouncedSearch(value); // This will trigger the debounced search
  };

  return (
    <Input
      placeholder="search"
      value={searchQuery}
      onChange={handleSearchChange}
    />
  );
};

export default SearchInput;
