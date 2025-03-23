import { useState, type CSSProperties, type Dispatch, type SetStateAction } from 'react';

interface CreateUserFormProps {
  setUserWasCreated: Dispatch<SetStateAction<boolean>>;
}

const validatePassword = (password: string) => {
  const errors = [];
  if (password.length < 10) errors.push("Password must be at least 10 characters long");
  if (password.length > 24) errors.push("Password must be at most 24 characters long");
  if (!/\d/.test(password)) errors.push("Password must contain at least one number");
  if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter");
  if (/\s/.test(password)) errors.push("Password cannot contain spaces");
  return errors;
};

     
function CreateUserForm({ }: CreateUserFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ username?: string; password?: string[] }>({});
  const [success, setSuccess] = useState(false);
  const [_setErrorMessage] = useState<string | null>(null);


  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      username: e.target.value.trim() ? "" : "Enter your username.",
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      password: validatePassword(value),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newErrors: { username?: string; password?: string[] } = {};

    if (!username.trim()) newErrors.username = "Enter your username.";
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) newErrors.password = passwordErrors;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch(
        "https://api.challenge.hennge.com/password-validation-challenge-api/001/challenge-signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsidmlrcmFudGNoYXZhbjIwMEBnbWFpbC5jb20iXSwiaXNzIjoiaGVubmdlLWFkbWlzc2lvbi1jaGFsbGVuZ2UiLCJzdWIiOiJjaGFsbGVuZ2UifQ.bnzvAuW1aLOrjDyu1WcHIGV4WNS2I8lGzh05bxkp3Xo`,
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) {
          if (response.status === 401 || response.status === 403) 
            return setErrors({ username: "Not authenticated to access this resource." });
    
          if (response.status >= 500) 
            return setErrors({ username: "Something went wrong, please try again." });
    
          const result = await response.json().catch(() => null);
          return setErrors({
            password: result?.errors?.map((err: string) => 
              err === "not_allowed" ? "Sorry, the entered password is not allowed." : err
            ) || ["An unknown error occurred."]
          });
        }
    
        setSuccess(true);
        setErrors({});
      } catch {
        setErrors({ username: "Network error: Unable to reach the server." });
      }
    };

  return (
    <div style={formWrapper}>
      <form onSubmit={handleSubmit} style={form}>
        <label style={formLabel}>Username</label>
        <input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          aria-invalid={!!errors.username}
          style={formInput}
        />
        {errors.username && <p>{errors.username}</p>}

        <label style={formLabel}>Password</label>
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          aria-invalid={errors.password && errors.password.length > 0}
          style={formInput}
        />
        {errors.password && errors.password.length > 0 && (
          <ul>
            {errors.password.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}

        <button type="submit" style={formButton}>Create User</button>

        {_setErrorMessage ? <p>{_setErrorMessage}</p> : null}
        {success && <p style={{ color: "green" }}>User successfully created!</p>}
      </form>
    </div>
  );
}

export { CreateUserForm };

const formWrapper: CSSProperties = { maxWidth: '500px', width: '80%', backgroundColor: '#efeef5', padding: '24px', borderRadius: '8px' };
const form: CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };
const formLabel: CSSProperties = { fontWeight: 700 };
const formInput: CSSProperties = { outline: 'none', padding: '8px 16px', height: '40px', fontSize: '14px', backgroundColor: '#f8f7fa', border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: '4px' };
const formButton: CSSProperties = { outline: 'none', borderRadius: '4px', border: '1px solid rgba(0, 0, 0, 0.12)', backgroundColor: '#7135d2', color: 'white', fontSize: '16px', fontWeight: 500, height: '40px', padding: '0 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px', alignSelf: 'flex-end', cursor: 'pointer' };