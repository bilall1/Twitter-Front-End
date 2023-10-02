import React from "react";
import FollowUser from "./FollowUser";

const RightBar = () => {
  return (
    <div className="w-1/3 h-full pt-14 mr-2 hidden lg:flex lg:flex-col">
      <div className="fixed">
        <div className="border-b-2 border-gray-500 opacity-50 pb-4">
          <span className="text-2xl "> People you may know</span>
        </div>

        <div className="pt-8">
          <FollowUser />
        </div>
      </div>
    </div>
  );
};

export default RightBar;
