import { useEffect, useState } from 'react';
import useAuth from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Space from './pages/Space';


function App() {
  const [page, setPage] = useState("login"); // login, register, home, space
  const auth = useAuth();
  const [spaceUuid, setSpaceUuid] = useState();

  const openSpace = (uuid) => {
    setSpaceUuid(uuid);
    setPage("space");
  }

  useEffect(() => {
    if (auth.jwt) {
      setPage("home");
    } else {
      setPage("login");
    }
  }, [auth.jwt]);

  if (page ==  "login") {
    return (
      <Login auth={auth} setPage={setPage} />
    );
  }

  if (page == "register") {
    return (
      <Register auth={auth} setPage={setPage} />
    );
  }

  if (page == "home") {
    return (
      <Home auth={auth} openSpace={openSpace} />
    );
  }

  if (page == "space") {
    return (
      <Space auth={auth} spaceUuid={spaceUuid} setPage={setPage} />
    );
  }
}

export default App;
