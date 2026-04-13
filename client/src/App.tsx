import UserProfile from './components/UserProfile';
import { useUserContext } from './context/UserContext';
import Login from './components/Login';
import { useEffect, useState } from 'react';
import type { Family } from './types/Family';

const API_HOST = import.meta.env.VITE_PUBLIC_API_HOST;

function App() {
  const { currentUser, loadData, token, error } = useUserContext();
  const [families, setFamilies] = useState<Family[]>([]);

  useEffect(() => {
    const loadFamilies = async () => {
      try {
        const response = await fetch(`${API_HOST}/families`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Fehler');
        }
        const data = await response.json();
        setFamilies(data);
      } catch (err) {
        alert(err);
      }
    };
    if (currentUser) {
      loadFamilies();
    }
  }, [currentUser, token]);

  return (
    <main className="p-8">
      <h1>Demo App</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!currentUser ? (
        <Login />
      ) : (
        <>
          <UserProfile />
          <div className="flex flex-col gap-2">
            <button onClick={loadData}>Load user data</button>
            <button onClick={() => {}}>Log out</button>
          </div>
          <h2>Meine Familien</h2>
          <ul>
            {families.map((family) => {
              return (
                <li key={family.id}>
                  {family.name}{' '}
                  {family.admin_id === currentUser.id ? 'ADMIN' : 'MEMBER'}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </main>
  );
}

export default App;
