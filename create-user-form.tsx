import { useState, type CSSProperties, type Dispatch, type SetStateAction } from 'react';

interface CreateUserFormProps {
  setUserWasCreated: Dispatch<SetStateAction<boolean>>;
}

const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  if (password.length < 10) errors.push("Password must be at least 10 characters long");
  if (password.length > 24) errors.push("Password must be at most 24 characters long");
  if (!/\d/.test(password)) errors.push("Password must contain at least one number");
  if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter");
  if (/\s/.test(password)) errors.push("Password cannot contain spaces");
  return errors;
};

function CreateUserForm({ setUserWasCreated }: CreateUserFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [clientErrors, setClientErrors] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate password
    const errors = validatePassword(password);
    if (errors.length > 0) {
      setClientErrors(errors);
      return;
    }

    // Reset error messages
    setClientErrors([]);
    setErrorMessage(null);

    try {
      const response = await fetch(
        "https://api.challenge.hennge.com/password-validation-challenge-api/001/challenge-signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsidmlrcmFudGNoYXZhbjIwMEBnbWFpbC5jb20iXSwiaXNzIjoiaGVubmdlLWFkbWlzc2lvbi1jaGFsbGVuZ2UiLCJzdWIiOiJjaGFsbGVuZ2UifQ.bnzvAuW1aLOrjDyu1WcHIGV4WNS2I8lGzh05bxkp3Xo`
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (response.ok) {
        setSuccess(true);
        setUserWasCreated(true);
      } else {
        const data = await response.json();
        if (data.error === "password_not_allowed") {
          setErrorMessage("Sorry, the entered password is not allowed, please try a different one.");
        } else if (response.status === 401 || response.status === 403) {
          setErrorMessage("Not authenticated to access this resource.");
        } else {
          setErrorMessage("Something went wrong, please try again.");
        }
      }
    } catch (error) {
      setErrorMessage("Something went wrong, please try again.");
    }
  };

  return (
    <div style={formWrapper}>
      <form style={form} onSubmit={handleSubmit}>
        {/* Username */}
        <label style={formLabel}>Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={formInput}
          required
        />

        {/* Password */}
        <label style={formLabel}>Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={clientErrors.length > 0 ? "true" : "false"}
          style={formInput}
          required
        />

        {/* Password Validation Errors */}
        {clientErrors.length > 0 && (
          <ul style={{ color: "red" }}>
            {clientErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}

        {/* API Error Messages */}
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        {/* Success Message */}
        {success && <p style={{ color: "green" }}>User successfully created!</p>}

        {/* Submit Button */}
        <button style={formButton} disabled={!username || clientErrors.length > 0}>Create User</button>
      </form>
    </div>
  );
}

export { CreateUserForm };

const formWrapper: CSSProperties = {
  maxWidth: '500px',
  width: '80%',
  backgroundColor: '#efeef5',
  padding: '24px',
  borderRadius: '8px',
};

const form: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const formLabel: CSSProperties = {
  fontWeight: 700,
};

const formInput: CSSProperties = {
  outline: 'none',
  padding: '8px 16px',
  height: '40px',
  fontSize: '14px',
  backgroundColor: '#f8f7fa',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: '4px',
};

const formButton: CSSProperties = {
  outline: 'none',
  borderRadius: '4px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: '#7135d2',
  color: 'white',
  fontSize: '16px',
  fontWeight: 500,
  height: '40px',
  padding: '0 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '8px',
  alignSelf: 'flex-end',
  cursor: 'pointer',
};
