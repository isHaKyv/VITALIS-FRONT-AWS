import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = ({ setIsAuthenticated }) => {
    const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
    const [loading, setLoading] = useState(false); // Estado de carga
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async () => {
        setLoading(true); // Inicia la carga
        try {
            const response = await fetch('https://vitalis.3utilities.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Asumiendo que el token o el estado de autenticación se incluye en la respuesta
                alert('Login successful!');
                setIsAuthenticated(true); // Marca al usuario como autenticado
                navigate('/analisis'); // Redirige a la página deseada
            } else {
                alert(data.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Failed to login. Please try again later.');
        } finally {
            setLoading(false); // Finaliza la carga
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                    <label>Usuario</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button onClick={handleLogin} disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <button onClick={() => navigate('/register')}>Register</button>
            </form>
        </div>
    );
};

export default Login;
