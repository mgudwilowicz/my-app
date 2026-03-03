import { useUserContext } from '../context/UserContext';

function UserProfile() {
  const { currentUser } = useUserContext();

  if (!currentUser) {
    return <p>User not found</p>;
  }

  return (
    <div>
      <h2>UserId: {currentUser.id}</h2>
      <p>Email: {currentUser.email}</p>
    </div>
  );
}

export default UserProfile;
