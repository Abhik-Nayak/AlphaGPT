import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Spinner from "../ui/Spinner";
import "./AuthForm.scss";

const AuthForm: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__title">ChatGPT Clone</h1>
        <p className="auth__subtitle">
          {mode === "login" ? "Welcome back" : "Create a new account"}
        </p>

        <form onSubmit={onSubmit} className="auth__form">
          {mode === "register" && (
            <div className="auth__group">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth__group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth__group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              minLength={6}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="auth__error">{error}</div>}

          <button className="btn auth__submit" disabled={loading}>
            {loading ? <Spinner /> : mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        <button
          type="button"
          className="btn btn--ghost auth__toggle"
          onClick={() =>
            setMode((m) => (m === "login" ? "register" : "login"))
          }
        >
          {mode === "login"
            ? "Need an account? Register"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
