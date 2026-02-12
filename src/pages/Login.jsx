// src/pages/Login.jsx
import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { VideoCall, Security, Upload } from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      if (isLogin) {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
        setMessage('✅ Login successful! Redirecting...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        // Sign up
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage('✅ Account created! Please login.');
        setIsLogin(true); // Switch to login after signup
      }
    } catch (error) {
      let errorMsg = '';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMsg = 'Email already registered. Please login instead.';
          setIsLogin(true);
          break;
        case 'auth/user-not-found':
          errorMsg = 'User not found. Please sign up first.';
          setIsLogin(false);
          break;
        case 'auth/wrong-password':
          errorMsg = 'Incorrect password. Try again.';
          break;
        case 'auth/weak-password':
          errorMsg = 'Password should be at least 6 characters.';
          break;
        case 'auth/invalid-email':
          errorMsg = 'Invalid email address.';
          break;
        default:
          errorMsg = error.message;
      }
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    try {
      await signOut(auth);
      setMessage('✅ Logged out from test account.');
    } catch (error) {
      setMessage(`❌ Logout error: ${error.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <VideoCall style={styles.logo} />
          <h1 style={styles.title}>Shorts<span style={styles.highlight}>Safe</span></h1>
          <p style={styles.subtitle}>Short videos with cyberbullying protection</p>
        </div>

        {message && (
          <div style={{
            ...styles.message,
            background: message.includes('✅') ? '#e8f5e9' : '#ffebee',
            color: message.includes('✅') ? '#2e7d32' : '#c62828'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          <button
            type="submit"
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <div style={styles.spinner}></div>
            ) : (
              isLogin ? 'Login to ShortsSafe' : 'Create Account'
            )}
          </button>
        </form>

        <div style={styles.switchContainer}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={styles.switchButton}
            disabled={loading}
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>

        <div style={styles.features}>
          <div style={styles.feature}>
            <Upload style={styles.featureIcon} />
            <span>Upload short videos</span>
          </div>
          <div style={styles.feature}>
            <Security style={styles.featureIcon} />
            <span>Cyberbullying detection</span>
          </div>
          <div style={styles.feature}>
            <VideoCall style={styles.featureIcon} />
            <span>Safe community</span>
          </div>
        </div>

        <div style={styles.testSection}>
          <p style={styles.testText}>Testing account: test@example.com / password123</p>
          <button onClick={testLogout} style={styles.testButton}>
            Logout Test Account
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '450px',
    textAlign: 'center'
  },
  header: {
    marginBottom: '30px'
  },
  logo: {
    fontSize: '60px',
    color: '#764ba2',
    marginBottom: '10px'
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    margin: '10px 0',
    color: '#333'
  },
  highlight: {
    color: '#764ba2'
  },
  subtitle: {
    color: '#666',
    fontSize: '16px',
    marginBottom: '20px'
  },
  message: {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  form: {
    marginBottom: '20px'
  },
  inputGroup: {
    marginBottom: '20px',
    textAlign: 'left'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#555'
  },
  input: {
    width: '100%',
    padding: '14px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box'
  },
  submitButton: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50px'
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  switchContainer: {
    marginBottom: '30px'
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline'
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '30px'
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#555',
    fontSize: '14px'
  },
  featureIcon: {
    fontSize: '18px',
    color: '#764ba2'
  },
  testSection: {
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '10px',
    marginTop: '20px'
  },
  testText: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '10px'
  },
  testButton: {
    padding: '8px 16px',
    background: '#ff6b6b',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '12px',
    cursor: 'pointer'
  }
};

// Add CSS animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default Login;