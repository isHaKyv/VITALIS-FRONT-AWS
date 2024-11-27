import React, { useState, useEffect } from 'react';
import '../styles/Records.css';

const Records = () => {
    const [patientFiles, setPatientFiles] = useState([]);
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null); // Estado de errores

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch('https://vitalis.3utilities.com/api/pacientes');
                if (!response.ok) {
                    throw new Error('Error fetching patient records');
                }
                const data = await response.json();
                setPatientFiles(data); // Asume que el endpoint devuelve un array de pacientes
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []); // Se ejecuta una sola vez al montar el componente

    if (loading) {
        return <p>Loading records...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="records-container">
            <h2>Patient Records</h2>
            {patientFiles.length > 0 ? (
                <ul>
                    {patientFiles.map((file) => (
                        <li key={file.id}>
                            <strong>Nombre:</strong> {file.nombre} {file.apellidos} <br />
                            <strong>Fecha de Nacimiento:</strong> {file.fecha_nacimiento} <br />
                            <strong>Edad:</strong> {file.edad} <br />
                            <strong>Sexo:</strong> {file.sexo} <br />
                            <strong>Dirección:</strong> {file.domicilio}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No hay registros disponibles.</p>
            )}
        </div>
    );
};

export default Records;
