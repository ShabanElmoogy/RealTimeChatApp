import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import TextField from "../components/TextField";
import AuthImagePattern from "../components/AuthImagePattern";
import { toast } from "react-hot-toast";
import Logo from "../components/Logo";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signUp, isSigningUp } = useAuthStore();

  const validateForm = () => {
    //check one by one
    if (!formData.fullName.trim()) {
      toast.error("Full Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    //check email with regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }

    //check password lenght
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    if (!formData.password.trim()) {
      toast.error("Password is required");
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success) {
      await signUp(formData);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* LOGO */}

          <Logo
            title="Create Account"
            subtitle="Get started with your free account"
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <TextField
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              icon={User}
            />

            <TextField
              label="Email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              icon={Mail}
            />

            <TextField
              label="Password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              type="password"
              icon={Lock}
              showToggle={true}
              onToggle={() => setShowPassword(!showPassword)}
              isPasswordVisible={showPassword}
            />

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* right side */}

      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  );
};

export default SignUpPage;
