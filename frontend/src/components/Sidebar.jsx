import { NavLink } from 'react-router-dom';

export default function Sidebar({ user, onLogout }) {
  return (
    <aside className="sidebar">
      <h1>Mountain Library</h1>
      <nav>
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/books">Books</NavLink>
        <NavLink to="/transactions">Transactions</NavLink>
        <NavLink to="/users">Users</NavLink>
      </nav>
      <div className="sidebar-user">
        <p>Signed in as <strong>{user.name}</strong></p>
        <button type="button" onClick={onLogout}>Logout</button>
      </div>
    </aside>
  );
}
