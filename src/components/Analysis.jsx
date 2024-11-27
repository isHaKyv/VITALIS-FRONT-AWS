import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Analysis.css';
import BodyImage from '../assets/Cuerpo.png';

const Analysis = () => {
    const navigate = useNavigate();
    const [sensorData, setSensorData] = useState({
        peso: 0,
        altura: 0,
        temperaturaCorporal: 0,
        frecuenciaRespiratoria: 0,
    });
    const [isReceiving, setIsReceiving] = useState(true);
    const [savedData, setSavedData] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const wsPeso = new WebSocket('ws://192.168.134.91:8080');
        const wsOtros = new WebSocket('ws://192.168.134.179:8081');
        const wsRespiratoria = new WebSocket('ws://192.168.134.93:8082');

        const updateSensorData = (sensorType, value) => {
            setSensorData((prev) => ({
                ...prev,
                [sensorType]: value,
            }));
        };

        wsPeso.onmessage = (event) => {
            try {
                if (isReceiving) {
                    const data = JSON.parse(event.data);
                    if (data.sensorType === 'peso') {
                        updateSensorData('peso', data.value);
                    }
                }
            } catch (error) {
                console.error('Error processing data from wsPeso:', error);
            }
        };

        wsOtros.onmessage = (event) => {
            try {
                if (isReceiving) {
                    const data = JSON.parse(event.data);
                    if (data.sensorType === 'altura') {
                        updateSensorData('altura', data.value);
                    } else if (data.sensorType === 'temperatura') {
                        updateSensorData('temperaturaCorporal', data.value);
                    }
                }
            } catch (error) {
                console.error('Error processing data from wsOtros:', error);
            }
        };

        wsRespiratoria.onmessage = (event) => {
            try {
                if (isReceiving) {
                    const data = JSON.parse(event.data);
                    if (data.sensorType === 'frecuenciaRespiratoria') {
                        updateSensorData('frecuenciaRespiratoria', data.value);
                    }
                }
            } catch (error) {
                console.error('Error processing data from wsRespiratoria:', error);
            }
        };

        return () => {
            wsPeso.close();
            wsOtros.close();
            wsRespiratoria.close();
        };
    }, [isReceiving]);

    const evaluateAlerts = (data) => {
        const criticalAlerts = [];
        if (data.peso > 90) criticalAlerts.push('Peso elevado (> 90 kg)');
        if (data.temperaturaCorporal >= 38) criticalAlerts.push('Temperatura alta (>= 38°C)');
        if (data.frecuenciaRespiratoria > 20) criticalAlerts.push('Frecuencia respiratoria alta (> 20 RPM)');
        return criticalAlerts;
    };

    const handleSave = () => {
        setIsReceiving(false);
        setSavedData(sensorData);

        const criticalAlerts = evaluateAlerts(sensorData);
        if (criticalAlerts.length > 0) {
            setAlerts(criticalAlerts);
            setShowModal(true);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
    };

    const handleNext = () => {
        navigate('/add-data', { state: { savedData } });
    };

    return (
        <div className="analysis-container">
            <div className="analysis-box">
                <h2 className="analysis-title">Preliminary Analysis</h2>
                <div className="content-section">
                    <div className="body-section">
                        <img src={BodyImage} alt="Body" className="body-image" />
                    </div>
                    <div className="measurements-section">
                        <ul className="measurements-list">
                            <li className="measurement-item">
                                <div className="measurement-icon">⚖️</div>
                                <span className="measurement-value">Peso: {sensorData.peso} kg</span>
                            </li>
                            <li className="measurement-item">
                                <div className="measurement-icon">📏</div>
                                <span className="measurement-value">Altura: {sensorData.altura} cm</span>
                            </li>
                            <li className="measurement-item">
                                <div className="measurement-icon">🌡️</div>
                                <span className="measurement-value">Temperatura: {sensorData.temperaturaCorporal} °C</span>
                            </li>
                            <li className="measurement-item">
                                <div className="measurement-icon">💨</div>
                                <span className="measurement-value">Frecuencia Respiratoria: {sensorData.frecuenciaRespiratoria}</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="buttons-section">
                    <button className="save-button" onClick={handleSave}>Guardar</button>
                    <button className="next-button" onClick={handleNext}>Siguiente</button>
                </div>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Alertas Críticas</h3>
                        <ul>
                            {alerts.map((alert, index) => (
                                <li key={index}>{alert}</li>
                            ))}
                        </ul>
                        <button onClick={handleModalClose}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analysis;
