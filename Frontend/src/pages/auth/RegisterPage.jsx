import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    firstName: "Aditya",
    lastName: "Sarse",
    email: "aditya@example.com",
    password: "Password123!",
    phone: "9876543210",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authService.register(form);
      const { user, accessToken } = res.data;
      login(user, accessToken);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
        <p className="text-xs text-zinc-400 mt-1">Join Élanor for exclusive luxury couture</p>
      </div>

      {error && <div className="rounded-lg bg-rose-950/60 border border-rose-800/60 p-3 text-xs font-semibold text-rose-300">{error}</div>}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First Name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          required
        />
        <Input
          label="Last Name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          required
        />
      </div>

      <Input
        label="Email Address"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <Input
        label="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
      />
      <Input
        label="Phone Number"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />

      <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
        {loading ? "Registering..." : "Create Account"}
      </Button>

      <div className="pt-2 text-center text-xs text-zinc-400">
        Already have an account?{" "}
        <Link to="/auth/login" className="font-semibold text-purple-400 hover:underline">
          Sign In
        </Link>
      </div>
    </form>
  );
};
