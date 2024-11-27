import React, { useEffect, useState } from 'react';
import '../styles/Alerts.css';

const Alerts = () => {
    const [patientFiles, setPatientFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalContent, setModalContent] = useState(null);

    // Fetch data from the API
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch('https://vitalis.3utilities.com/api/pacientes');
                if (!response.ok) {
                    throw new Error('Error fetching patient data');
                }
                const data = await response.json();
                setPatientFiles(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const checkAlerts = (patient) => {
        const reasons = [];
        if (patient.respiratoryRate > 20) {
            reasons.push('High respiratory rate (> 20 RPM)');
        }
        if (patient.weight > 90) {
            reasons.push('Overweight (weight > 90 kg)');
        }
        if (patient.temperature >= 38) {
            reasons.push('High temperature (>= 38°C)');
        }
        return reasons;
    };

    const alerts = patientFiles
        .map((patient) => ({
            ...patient,
            alertReasons: checkAlerts(patient),
        }))
        .filter((patient) => patient.alertReasons.length > 0);

    const openModal = (patient) => {
        setModalContent(patient);
    };

    const closeModal = () => {
        setModalContent(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="alerts-container">
            <h2>Alerts</h2>
            {alerts.length > 0 ? (
                <ul>
                    {alerts.map((alert) => (
                        <li key={alert.id}>
                            <strong>Name:</strong> {alert.fullName} <br />
                            <strong>Reason:</strong>{' '}
                            {alert.alertReasons.join(', ')} <br />
                            <button onClick={() => openModal(alert)}>
                                View Details
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No alerts available.</p>
            )}

            {modalContent && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Alert Details</h3>
                        <p>
                            <strong>Name:</strong> {modalContent.fullName}
                        </p>
                        <p>
                            <strong>Reasons:</strong>
                        </p>
                        <ul>
                            {modalContent.alertReasons.map((reason, index) => (
                                <li key={index}>{reason}</li>
                            ))}
                        </ul>
                        <button onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Alerts;
