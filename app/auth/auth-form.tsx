"use client";

import { FormEvent, useState } from "react";
import { PhoneInput, type CountryIso2 } from "react-international-phone";
import "react-international-phone/style.css";
import { authApi } from "@/lib/api-client";
import type { PublicUser, UserRole } from "@/lib/types/reisen";

export type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
};

type FieldErrors = Partial<
  Record<"firstName" | "lastName" | "email" | "password" | "phone" | "role", string>
>;

const roleOptions: Array<{ label: string; value: Exclude<UserRole, "admin"> }> = [
  { label: "I want to travel", value: "customer" },
  { label: "I host experiences", value: "provider" },
];

const preferredCountries: CountryIso2[] = ["ng", "gh", "ke", "za", "gb", "us"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  return phone.startsWith("+") && digits.length >= 8 && digits.length <= 15;
}

export default function AuthForm({ mode, onModeChange }: AuthFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Exclude<UserRole, "admin">>("customer");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm() {
    const nextErrors: FieldErrors = {};

    if (mode === "register" && firstName.trim().length < 2) {
      nextErrors.firstName = "Enter your first name.";
    }

    if (mode === "register" && lastName.trim().length < 2) {
      nextErrors.lastName = "Enter your last name.";
    }

    if (!emailPattern.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (mode === "register" && !validatePhone(phone)) {
      nextErrors.phone = "Enter a valid phone number with country code.";
    }

    if (mode === "register" && !role) {
      nextErrors.role = "Choose how you want to use Reisen.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);
    setMessage("");

    if (Object.keys(nextErrors).length > 0) {
      setMessage("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "register") {
        const auth = await authApi.register({
          email: email.trim().toLowerCase(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone,
          role,
        });
        localStorage.setItem("tc_token", auth.token);
        localStorage.setItem("tc_user", JSON.stringify(auth.user));
        setUser(auth.user);
        setMessage("Account created. You're logged in.");
        return;
      }

      const auth = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });
      localStorage.setItem("tc_token", auth.token);
      localStorage.setItem("tc_user", JSON.stringify(auth.user));
      setUser(auth.user);
      setMessage("You're logged in.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  const userDisplayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Your account";
  const inputClassName =
    "h-12 rounded-2xl border border-primary/50 bg-white-base px-4 text-body-regular outline-none transition focus:border-secondary";
  const invalidInputClassName =
    "h-12 rounded-2xl border border-error bg-white-base px-4 text-body-regular outline-none transition focus:border-error";

  return (
    <section className="w-full max-w-lg rounded-[32px] border border-primary/40 bg-white-base/80 p-5 shadow-[0px_20px_80px_rgba(45,45,45,0.12)] backdrop-blur lg:p-8">
      <div className="grid grid-cols-2 rounded-[999px] bg-primary-50 p-1 text-small-medium">
        <button
          type="button"
          onClick={() => onModeChange("register")}
          className={`rounded-[999px] px-4 py-3 transition ${
            mode === "register"
              ? "bg-white-base text-dark-base shadow-sm"
              : "text-body-dark hover:text-dark-base"
          }`}
        >
          Sign up
        </button>
        <button
          type="button"
          onClick={() => onModeChange("login")}
          className={`rounded-[999px] px-4 py-3 transition ${
            mode === "login"
              ? "bg-white-base text-dark-base shadow-sm"
              : "text-body-dark hover:text-dark-base"
          }`}
        >
          Log in
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {mode === "register" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-small-medium text-dark-base">
              First name
              <input
                value={firstName}
                onChange={(event) => {
                  setFirstName(event.target.value);
                  setErrors((current) => ({ ...current, firstName: undefined }));
                }}
                required
                minLength={2}
                placeholder="Ada"
                aria-invalid={Boolean(errors.firstName)}
                className={
                  errors.firstName ? invalidInputClassName : inputClassName
                }
              />
              {errors.firstName ? (
                <span className="text-extra-small text-error">
                  {errors.firstName}
                </span>
              ) : null}
            </label>

            <label className="flex flex-col gap-2 text-small-medium text-dark-base">
              Last name
              <input
                value={lastName}
                onChange={(event) => {
                  setLastName(event.target.value);
                  setErrors((current) => ({ ...current, lastName: undefined }));
                }}
                required
                minLength={2}
                placeholder="Balogun"
                aria-invalid={Boolean(errors.lastName)}
                className={errors.lastName ? invalidInputClassName : inputClassName}
              />
              {errors.lastName ? (
                <span className="text-extra-small text-error">
                  {errors.lastName}
                </span>
              ) : null}
            </label>
          </div>
        ) : null}

        <label className="flex flex-col gap-2 text-small-medium text-dark-base">
          Email address
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((current) => ({ ...current, email: undefined }));
            }}
            required
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            className={errors.email ? invalidInputClassName : inputClassName}
          />
          {errors.email ? (
            <span className="text-extra-small text-error">{errors.email}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2 text-small-medium text-dark-base">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({ ...current, password: undefined }));
            }}
            required
            minLength={6}
            placeholder="Enter your password"
            aria-invalid={Boolean(errors.password)}
            className={errors.password ? invalidInputClassName : inputClassName}
          />
          {errors.password ? (
            <span className="text-extra-small text-error">{errors.password}</span>
          ) : null}
        </label>

        {mode === "register" ? (
          <div className="flex flex-col gap-2 text-small-medium text-dark-base">
            Phone number
            <PhoneInput
              defaultCountry="ng"
              preferredCountries={preferredCountries}
              forceDialCode
              placeholder="Enter phone number"
              value={phone}
              onChange={(value) => {
                setPhone(value);
                setErrors((current) => ({ ...current, phone: undefined }));
              }}
              inputProps={{
                required: true,
                name: "phone",
                autoComplete: "tel",
                "aria-invalid": Boolean(errors.phone),
              }}
              className={`reisen-phone-input ${
                errors.phone ? "reisen-phone-input-invalid" : ""
              }`}
              inputClassName="reisen-phone-input-field"
              countrySelectorStyleProps={{
                buttonClassName: "reisen-phone-country-button",
                dropdownStyleProps: {
                  className: "reisen-phone-country-dropdown",
                  listItemClassName: "reisen-phone-country-option",
                  listItemSelectedClassName: "reisen-phone-country-option-selected",
                  listItemFocusedClassName: "reisen-phone-country-option-focused",
                  listItemCountryNameClassName: "reisen-phone-country-name",
                  listItemDialCodeClassName: "reisen-phone-country-code",
                  preferredListDividerClassName: "reisen-phone-country-divider",
                },
              }}
            />
            {errors.phone ? (
              <span className="text-extra-small text-error">{errors.phone}</span>
            ) : null}
          </div>
        ) : null}

        {mode === "register" ? (
          <fieldset className="flex flex-col gap-2">
            <legend className="text-small-medium text-dark-base py-2">
              What brings you here?
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {roleOptions.map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-2xl border p-4 text-small-medium transition ${
                    role === option.value
                      ? "border-secondary bg-primary text-dark-base"
                      : "border-primary/50 bg-white-base text-body-dark hover:border-secondary"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={role === option.value}
                    onChange={() => {
                      setRole(option.value);
                      setErrors((current) => ({ ...current, role: undefined }));
                    }}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {errors.role ? (
              <span className="text-extra-small text-error">{errors.role}</span>
            ) : null}
          </fieldset>
        ) : null}

        <button type="submit" disabled={isSubmitting} className="primary-cta mt-2">
          <span className="primary-cta-inner w-full">
            {isSubmitting
              ? "Please wait..."
              : mode === "register"
                ? "Create account"
                : "Log in"}
          </span>
        </button>
      </form>

      {message ? (
        <p className="mt-4 rounded-2xl bg-primary-50 p-4 text-small text-dark-base">
          {message}
        </p>
      ) : null}

      {user ? (
        <div className="mt-4 rounded-2xl border border-primary/40 bg-white-base p-4">
          <p className="text-small-medium text-dark-base">{userDisplayName}</p>
          <p className="mt-1 text-small text-body-dark">
            {user.email} · {user.role}
          </p>
        </div>
      ) : null}
    </section>
  );
}
