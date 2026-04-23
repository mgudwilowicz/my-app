import { useUserContext } from "../context/UserContext";

function UserList() {
  const { users } = useUserContext();

  return (
    <div>
      <h2>Users</h2>
      {users.map((user) => {
        return <p>{user.email}</p>;
      })}
    </div>
  );
}

export default UserList;
