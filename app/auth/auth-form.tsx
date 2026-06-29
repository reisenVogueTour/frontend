"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneInput, type CountryIso2 } from "react-international-phone";
import "react-international-phone/style.css";
import { authApi } from "@/lib/api-client";
import { storeAuthSession } from "@/lib/auth-client";
import type { UserRole } from "@/lib/types/reisen";

export type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
};

type FieldErrors = Partial<
  Record<
    | "firstName"
    | "lastName"
    | "email"
    | "password"
    | "phone"
    | "role"
    | "businessName"
    | "description"
    | "location"
    | "businessAddress"
    | "companyEmail"
    | "companyPhone"
    | "cacNumber",
    string
  >
>;

const roleOptions: Array<{ label: string; value: Exclude<UserRole, "admin"> }> =
  [
    { label: "I want to travel", value: "customer" },
    { label: "I host experiences", value: "provider" },
  ];

const preferredCountries: CountryIso2[] = ["ng", "gh", "ke", "za", "gb", "us"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPostAuthPath(role?: UserRole): string {
  if (typeof window === "undefined") return "/";

  // Priority 1: Role-based redirect for providers and admins
  if (role === "provider") {
    return "/provider";
  }
  if (role === "admin") {
    return "/admin";
  }

  // Priority 2: Only allow 'next' parameter for customers (not for providers/admins)
  const next = new URLSearchParams(window.location.search).get("next");
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }

  // Priority 3: Default to home for customers
  return "/";
}

function validatePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return phone.startsWith("+") && digits.length >= 8 && digits.length <= 15;
}

export default function AuthForm({ mode, onModeChange }: AuthFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Exclude<UserRole, "admin">>("customer");

  // Provider-specific fields
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [cacNumber, setCacNumber] = useState("");

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isProviderSelected = role === "provider";

  function validateForm() {
    const nextErrors: FieldErrors = {};

    // Common validations for both login and register
    if (!emailPattern.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    // Register-specific validations
    if (mode === "register") {
      if (firstName.trim().length < 2) {
        nextErrors.firstName = "Enter your first name.";
      }

      if (lastName.trim().length < 2) {
        nextErrors.lastName = "Enter your last name.";
      }

      if (!validatePhone(phone)) {
        nextErrors.phone = "Enter a valid phone number with country code.";
      }

      if (!role) {
        nextErrors.role = "Choose how you want to use Reisen.";
      }

      // Validate provider fields
      if (isProviderSelected) {
        if (!businessName.trim()) {
          nextErrors.businessName = "Business name is required.";
        }
        if (!description.trim()) {
          nextErrors.description = "Business description is required.";
        }
        if (!location.trim()) {
          nextErrors.location = "Location is required.";
        }
        if (!businessAddress.trim()) {
          nextErrors.businessAddress = "Business address is required.";
        }
        if (!companyEmail.trim() || !emailPattern.test(companyEmail.trim())) {
          nextErrors.companyEmail = "Valid company email is required.";
        }
        if (!companyPhone.trim() || !validatePhone(companyPhone)) {
          nextErrors.companyPhone = "Valid company phone number is required.";
        }
        if (!cacNumber.trim()) {
          nextErrors.cacNumber = "CAC registration number is required.";
        }
      }
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
        const registerData: any = {
          email: email.trim().toLowerCase(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone,
          role,
        };

        // Add provider-specific data if provider
        if (isProviderSelected) {
          registerData.businessName = businessName.trim();
          registerData.description = description.trim();
          registerData.location = location.trim();
          registerData.businessAddress = businessAddress.trim();
          registerData.companyEmail = companyEmail.trim().toLowerCase();
          registerData.companyPhone = companyPhone.trim();
          registerData.cacNumber = cacNumber.trim();
        }

        const auth = await authApi.register(registerData);
        storeAuthSession(auth);
        setMessage("Account created. Redirecting...");
        router.replace(getPostAuthPath(role));
        return;
      }

      // Login
      const auth = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });
      storeAuthSession(auth);
      setMessage("You're logged in. Redirecting...");
      router.replace(getPostAuthPath(auth.user.role));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Authentication failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClassName =
    "h-12 w-full min-w-0 rounded-2xl border border-primary/50 bg-white-base px-4 text-body-regular outline-none transition focus:border-secondary";
  const invalidInputClassName =
    "h-12 w-full min-w-0 rounded-2xl border border-error bg-white-base px-4 text-body-regular outline-none transition focus:border-error";

  return (
    <section className="relative z-10  w-full min-w-0 max-w-lg rounded-[24px] border border-primary/40 bg-white-base/85 p-4 shadow-[0px_20px_80px_rgba(45,45,45,0.12)] backdrop-blur sm:p-5 sm:rounded-[32px] lg:p-8">
      <div className="grid grid-cols-2 rounded-[999px] bg-primary-50 p-1 text-small-medium">
        <button
          type="button"
          onClick={() => onModeChange("register")}
          className={`rounded-[999px] px-3 py-3 transition sm:px-4 ${
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
          className={`rounded-[999px] px-3 py-3 transition sm:px-4 ${
            mode === "login"
              ? "bg-white-base text-dark-base shadow-sm"
              : "text-body-dark hover:text-dark-base"
          }`}
        >
          Log in
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 flex min-w-0 flex-col gap-4 sm:mt-6"
      >
        {/* Email - shown for both login and register */}
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

        {/* Password - shown for both login and register */}
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
            minLength={8}
            placeholder="Enter your password"
            aria-invalid={Boolean(errors.password)}
            className={errors.password ? invalidInputClassName : inputClassName}
          />
          {errors.password ? (
            <span className="text-extra-small text-error">
              {errors.password}
            </span>
          ) : null}
        </label>

        {/* Register-specific fields */}
        {mode === "register" ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-small-medium text-dark-base">
                First name
                <input
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value);
                    setErrors((current) => ({
                      ...current,
                      firstName: undefined,
                    }));
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
                    setErrors((current) => ({
                      ...current,
                      lastName: undefined,
                    }));
                  }}
                  required
                  minLength={2}
                  placeholder="Balogun"
                  aria-invalid={Boolean(errors.lastName)}
                  className={
                    errors.lastName ? invalidInputClassName : inputClassName
                  }
                />
                {errors.lastName ? (
                  <span className="text-extra-small text-error">
                    {errors.lastName}
                  </span>
                ) : null}
              </label>
            </div>

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
                className={`reisen-phone-input ${errors.phone ? "reisen-phone-input-invalid" : ""}`}
                inputClassName="reisen-phone-input-field"
                countrySelectorStyleProps={{
                  buttonClassName: "reisen-phone-country-button",
                  dropdownStyleProps: {
                    className: "reisen-phone-country-dropdown",
                    listItemClassName: "reisen-phone-country-option",
                    listItemSelectedClassName:
                      "reisen-phone-country-option-selected",
                    listItemFocusedClassName:
                      "reisen-phone-country-option-focused",
                    listItemCountryNameClassName: "reisen-phone-country-name",
                    listItemDialCodeClassName: "reisen-phone-country-code",
                    preferredListDividerClassName:
                      "reisen-phone-country-divider",
                  },
                }}
              />
              {errors.phone ? (
                <span className="text-extra-small text-error">
                  {errors.phone}
                </span>
              ) : null}
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-small-medium text-dark-base py-2">
                What brings you here?
              </legend>
              <div className="grid gap-2 min-[430px]:grid-cols-2">
                {roleOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-2xl border p-3 text-center text-small-medium transition sm:p-4 ${
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
                        setErrors((current) => ({
                          ...current,
                          role: undefined,
                        }));
                      }}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {errors.role ? (
                <span className="text-extra-small text-error">
                  {errors.role}
                </span>
              ) : null}
            </fieldset>

            {/* Provider-specific fields - only shown when provider is selected */}
            {isProviderSelected && (
              <div className="space-y-4 border-t border-primary/20 pt-4 mt-2">
                <p className="text-small-medium text-dark-base">
                  Business Information
                </p>

                <label className="flex flex-col gap-2 text-small-medium text-dark-base">
                  Business Name
                  <input
                    value={businessName}
                    onChange={(event) => {
                      setBusinessName(event.target.value);
                      setErrors((current) => ({
                        ...current,
                        businessName: undefined,
                      }));
                    }}
                    placeholder="Your business name"
                    aria-invalid={Boolean(errors.businessName)}
                    className={
                      errors.businessName
                        ? invalidInputClassName
                        : inputClassName
                    }
                  />
                  {errors.businessName ? (
                    <span className="text-extra-small text-error">
                      {errors.businessName}
                    </span>
                  ) : null}
                </label>

                <label className="flex flex-col gap-2 text-small-medium text-dark-base">
                  Business Description
                  <textarea
                    value={description}
                    onChange={(event) => {
                      setDescription(event.target.value);
                      setErrors((current) => ({
                        ...current,
                        description: undefined,
                      }));
                    }}
                    placeholder="Describe your business and the experiences you offer"
                    rows={3}
                    className={`w-full min-w-0 rounded-2xl border border-primary/50 bg-white-base px-4 py-3 text-body-regular outline-none transition focus:border-secondary resize-y ${
                      errors.description ? "border-error" : ""
                    }`}
                    aria-invalid={Boolean(errors.description)}
                  />
                  {errors.description ? (
                    <span className="text-extra-small text-error">
                      {errors.description}
                    </span>
                  ) : null}
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-small-medium text-dark-base">
                    Location (City/Area)
                    <input
                      value={location}
                      onChange={(event) => {
                        setLocation(event.target.value);
                        setErrors((current) => ({
                          ...current,
                          location: undefined,
                        }));
                      }}
                      placeholder="Lagos, Nigeria"
                      aria-invalid={Boolean(errors.location)}
                      className={
                        errors.location ? invalidInputClassName : inputClassName
                      }
                    />
                    {errors.location ? (
                      <span className="text-extra-small text-error">
                        {errors.location}
                      </span>
                    ) : null}
                  </label>

                  <label className="flex flex-col gap-2 text-small-medium text-dark-base">
                    Business Address
                    <input
                      value={businessAddress}
                      onChange={(event) => {
                        setBusinessAddress(event.target.value);
                        setErrors((current) => ({
                          ...current,
                          businessAddress: undefined,
                        }));
                      }}
                      placeholder="Full business address"
                      aria-invalid={Boolean(errors.businessAddress)}
                      className={
                        errors.businessAddress
                          ? invalidInputClassName
                          : inputClassName
                      }
                    />
                    {errors.businessAddress ? (
                      <span className="text-extra-small text-error">
                        {errors.businessAddress}
                      </span>
                    ) : null}
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-small-medium text-dark-base">
                    Company Email
                    <input
                      type="email"
                      value={companyEmail}
                      onChange={(event) => {
                        setCompanyEmail(event.target.value);
                        setErrors((current) => ({
                          ...current,
                          companyEmail: undefined,
                        }));
                      }}
                      placeholder="business@example.com"
                      aria-invalid={Boolean(errors.companyEmail)}
                      className={
                        errors.companyEmail
                          ? invalidInputClassName
                          : inputClassName
                      }
                    />
                    {errors.companyEmail ? (
                      <span className="text-extra-small text-error">
                        {errors.companyEmail}
                      </span>
                    ) : null}
                  </label>

                  <div className="flex flex-col gap-2 text-small-medium text-dark-base">
                    Company Phone
                    <PhoneInput
                      defaultCountry="ng"
                      preferredCountries={preferredCountries}
                      forceDialCode
                      placeholder="Business phone"
                      value={companyPhone}
                      onChange={(value) => {
                        setCompanyPhone(value);
                        setErrors((current) => ({
                          ...current,
                          companyPhone: undefined,
                        }));
                      }}
                      inputProps={{
                        required: true,
                        name: "companyPhone",
                        autoComplete: "tel",
                        "aria-invalid": Boolean(errors.companyPhone),
                      }}
                      className={`reisen-phone-input ${
                        errors.companyPhone ? "reisen-phone-input-invalid" : ""
                      }`}
                      inputClassName="reisen-phone-input-field"
                      countrySelectorStyleProps={{
                        buttonClassName: "reisen-phone-country-button",
                        dropdownStyleProps: {
                          className: "reisen-phone-country-dropdown",
                          listItemClassName: "reisen-phone-country-option",
                          listItemSelectedClassName:
                            "reisen-phone-country-option-selected",
                          listItemFocusedClassName:
                            "reisen-phone-country-option-focused",
                          listItemCountryNameClassName:
                            "reisen-phone-country-name",
                          listItemDialCodeClassName:
                            "reisen-phone-country-code",
                          preferredListDividerClassName:
                            "reisen-phone-country-divider",
                        },
                      }}
                    />
                    {errors.companyPhone ? (
                      <span className="text-extra-small text-error">
                        {errors.companyPhone}
                      </span>
                    ) : null}
                  </div>
                </div>

                <label className="flex flex-col gap-2 text-small-medium text-dark-base">
                  CAC Registration Number
                  <input
                    value={cacNumber}
                    onChange={(event) => {
                      setCacNumber(event.target.value);
                      setErrors((current) => ({
                        ...current,
                        cacNumber: undefined,
                      }));
                    }}
                    placeholder="RC 1234567"
                    aria-invalid={Boolean(errors.cacNumber)}
                    className={
                      errors.cacNumber ? invalidInputClassName : inputClassName
                    }
                  />
                  {errors.cacNumber ? (
                    <span className="text-extra-small text-error">
                      {errors.cacNumber}
                    </span>
                  ) : null}
                </label>
              </div>
            )}
          </>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="primary-cta mt-2"
        >
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
    </section>
  );
}
