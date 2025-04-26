import { useContext, useState } from "react";
import { Search, FloorOption, Navbar } from "../components";
import { MapContext } from "../shared";
import ShowIOS from "./ShowIOS";
import Show from "./Show";

const Home = ({ isIOS }) => {
  const { selectedBlockOption, selectedFloorOption } = useContext(MapContext);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <FloorOption />
      <Search />
      {isIOS ? (
        <ShowIOS
          selectedFloorBlockOption={selectedFloorOption + selectedBlockOption}
        />
      ) : (
        <Show
          selectedFloorBlockOption={selectedFloorOption + selectedBlockOption}
        />
      )}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  );
};

export default Home;
