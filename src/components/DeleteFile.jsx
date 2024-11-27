import React, { useState, useEffect } from 'react';
import '../styles/DeleteFile.css';

const DeleteFile = () => {
    const [patientFiles, setPatientFiles] = useState([]);
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null); // Estado de errores

    // Obtener pacientes al montar el componente
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch('https://vitalis.3utilities.com/api/pacientes');
                if (!response.ok) {
                    throw new Error('Error al obtener los registros de pacientes.');
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
    }, []);

    // Manejo para eliminar un paciente
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este paciente?');
        if (!confirmDelete) return;

        try {
            const response = await fetch(`https://vitalis.3utilities.com/api/pacientes/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el paciente.');
            }

            alert('Paciente eliminado exitosamente.');
            // Elimina el paciente del estado local
            setPatientFiles(patientFiles.filter((file) => file.id !== id));
        } catch (err) {
            console.error('Error al eliminar el paciente:', err);
            alert('Hubo un error al intentar eliminar el paciente.');
        }
    };

    if (loading) {
        return <p>Cargando registros...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="delete-file-container">
            <h2>Eliminar Archivo de Paciente</h2>
            {patientFiles.length > 0 ? (
                <ul>
                    {patientFiles.map((file) => (
                        <li key={file.id}>
                            <strong>Nombre:</strong> {file.nombre} {file.apellidos} <br />
                            <strong>Fecha de Nacimiento:</strong> {file.fecha_nacimiento} <br />
                            <button onClick={() => handleDelete(file.id)}>Eliminar</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No hay registros disponibles para eliminar.</p>
            )}
        </div>
    );
};

export default DeleteFile;
