"use client";
import SideBar from "./SideBar";
import HomeRightBar from "./HomeRightBar";
import HomeMidSection from "./HomeMidSection";

export default function HomePage() {
  return (
    <div className="lg:flex md:flex sm:flex h-screen w-screen font-sans max-w-[2000px] 2xl:mx-auto">
      <SideBar />
      
      <HomeMidSection  />
      {/* <HomeRightBar /> */}
    </div>
  );
}
