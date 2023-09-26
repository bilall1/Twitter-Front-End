"use client";
import SideBar from "./SideBar";
import HomeRightBar from "./HomeRightBar";
import HomeMidSection from "./HomeMidSection";

export default function HomePage() {
  return (
    <div className="lg:flex md:flex sm:flex h-screen w-screen font-sans">
      <SideBar />
      <HomeMidSection />
      <HomeRightBar />
    </div>
  );
}
