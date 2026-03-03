import './App.css';
import UserProfile from './components/UserProfile';
import { useUserContext } from './context/UserContext';
import Login from './components/Login';
import UserList from './components/UserList';

function App() {
  const { currentUser, loadData, error } = useUserContext();

  return (
    <>
      <h1>Demo App</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!currentUser ? (
        <Login />
      ) : (
        <>
          <UserProfile />
          <button onClick={loadData}>Load user data</button>¬
          <button onClick={() => {}}>Log out</button>
          <UserList />
        </>
      )}
    </>
  );
}

export default App;
