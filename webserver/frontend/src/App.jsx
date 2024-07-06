import axios from "axios";
import { useEffect, useState } from "react";
import EntryList from "./layout/entryList/EntryList";

function App() {
  const [data, setData] = useState([]);

  const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_API;
  useEffect(() => {
    axios.get(backendUrl + "/data").then((response) => {
      console.log(response.data);
      setData(response.data);
    });
  }, []);

  return <EntryList data={data} setData={setData} />;
}

export default App;
