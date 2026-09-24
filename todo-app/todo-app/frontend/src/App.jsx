import { useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "./api";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;
    api("/auth/me")
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setChecking(false));
  }, []);

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  if (checking) return <div className="center">Loading…</div>;
  return user ? <Todos user={user} onLogout={logout} /> : <Auth onAuth={setUser} />;
}

function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = isLogin
        ? await api("/auth/login", { method: "POST", form })
        : await api("/auth/register", { method: "POST", body: form });
      setToken(data.access_token);
      onAuth(await api("/auth/me"));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <main className="auth">
      <section className="auth-hero">
        <h1>Get the day out of your head.</h1>
        <p>Write it down, rank it, tick it off. Your tasks stay private to your account.</p>
      </section>
      <section className="auth-panel">
        <form onSubmit={submit} className="auth-form">
          <h2>{isLogin ? "Log in" : "Create your account"}</h2>
          <label>
            Username
            <input value={form.username} onChange={set("username")} autoComplete="username" required minLength={3} />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={6}
            />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn primary" disabled={busy}>
            {busy ? "Please wait…" : isLogin ? "Log in" : "Create account"}
          </button>
          <p className="switch">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <button type="button" className="link" onClick={() => { setMode(isLogin ? "register" : "login"); setError(""); }}>
              {isLogin ? "Create an account" : "Log in"}
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}

const FILTERS = [
  ["all", "All"],
  ["active", "To do"],
  ["done", "Done"],
];

function Todos({ user, onLogout }) {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fail = (err) => {
    if (err.message.startsWith("Session expired")) return onLogout();
    setError(err.message);
  };

  useEffect(() => {
    api("/todos").then(setTodos).catch(fail).finally(() => setLoading(false));
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const todo = await api("/todos", { method: "POST", body: { title, priority } });
      setTodos([todo, ...todos]);
      setTitle("");
      setError("");
    } catch (err) { fail(err); }
  };

  const toggle = async (t) => {
    try {
      const updated = await api(`/todos/${t.id}`, { method: "PATCH", body: { done: !t.done } });
      setTodos(todos.map((x) => (x.id === t.id ? updated : x)));
    } catch (err) { fail(err); }
  };

  const remove = async (t) => {
    try {
      await api(`/todos/${t.id}`, { method: "DELETE" });
      setTodos(todos.filter((x) => x.id !== t.id));
    } catch (err) { fail(err); }
  };

  const clearDone = async () => {
    const done = todos.filter((t) => t.done);
    try {
      await Promise.all(done.map((t) => api(`/todos/${t.id}`, { method: "DELETE" })));
      setTodos(todos.filter((t) => !t.done));
    } catch (err) { fail(err); }
  };

  const doneCount = todos.filter((t) => t.done).length;
  const percent = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;
  const visible = useMemo(
    () => todos.filter((t) => (filter === "all" ? true : filter === "done" ? t.done : !t.done)),
    [todos, filter]
  );

  return (
    <main className="app">
      <header className="topbar">
        <h1>Tasks</h1>
        <div className="who">
          <span>{user.username}</span>
          <button className="btn ghost" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <section className="progress" aria-label="Progress">
        <div className="progress-text">
          <strong>{doneCount} of {todos.length}</strong> done
        </div>
        <div className="bar"><div style={{ width: `${percent}%` }} /></div>
      </section>

      <form className="add" onSubmit={add}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          maxLength={200}
          aria-label="New task"
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Priority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button className="btn primary">Add task</button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      <nav className="filters">
        {FILTERS.map(([key, label]) => (
          <button key={key} className={filter === key ? "on" : ""} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
        {doneCount > 0 && <button className="clear" onClick={clearDone}>Delete completed</button>}
      </nav>

      {loading ? (
        <p className="empty">Loading your tasks…</p>
      ) : visible.length === 0 ? (
        <p className="empty">
          {todos.length === 0 ? "No tasks yet. Add your first one above." : "Nothing in this list."}
        </p>
      ) : (
        <ul className="list">
          {visible.map((t) => (
            <li key={t.id} className={t.done ? "item done" : "item"}>
              <label className="check">
                <input type="checkbox" checked={t.done} onChange={() => toggle(t)} />
                <span className="box" aria-hidden="true" />
                <span className="title">{t.title}</span>
              </label>
              <span className={`chip ${t.priority}`}>{t.priority}</span>
              <button className="del" onClick={() => remove(t)} aria-label={`Delete ${t.title}`}>×</button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
