import React, { useEffect, useState } from 'react';
import '../styles/Stats.css';


const calculateStats = (data) => {
    if (data.length === 0) return null;

    const mean =
        data.reduce((sum, value) => sum + value, 0) / data.length;
    const sortedData = [...data].sort((a, b) => a - b);
    const median =
        sortedData.length % 2 === 0
            ? (sortedData[sortedData.length / 2 - 1] + sortedData[sortedData.length / 2]) / 2
            : sortedData[Math.floor(sortedData.length / 2)];
    const mode =
        Object.entries(
            data.reduce((acc, value) => {
                acc[value] = (acc[value] || 0) + 1;
                return acc;
            }, {})
        ).sort((a, b) => b[1] - a[1])[0]?.[0] || "No mode";

    return { mean: mean.toFixed(2), median: median.toFixed(2), mode };
};

// Health prediction logic
const healthPrediction = (type, value) => {
    if (value == null) return 'No data available.';
    switch (type) {
        case 'peso':
            if (value > 100) return 'High weight - consider consulting a doctor.';
            if (value < 40) return 'Underweight - consider improving nutrition.';
            return 'Healthy weight.';
        case 'altura':
            if (value < 150) return 'Short stature - normal in some cases.';
            if (value > 200) return 'Tall stature - consider monitoring growth.';
            return 'Normal height.';
        case 'temperaturaCorporal':
            if (value > 38) return 'Fever - consult a doctor.';
            if (value < 36) return 'Low temperature - possible hypothermia.';
            return 'Normal temperature.';
        case 'frecuenciaRespiratoria':
            if (value > 20) return 'Rapid breathing - monitor carefully.';
            if (value < 12) return 'Slow breathing - consult a specialist.';
            return 'Normal breathing rate.';
        default:
            return 'No prediction available.';
    }
};

const Statistics = () => {
    const [sensorData, setSensorData] = useState({
        peso: [],
        altura: [],
        temperaturaCorporal: [],
        frecuenciaRespiratoria: [],
    });

    useEffect(() => {
       
        const wsPeso = new WebSocket('ws://192.168.134.91:8080'); // ESP32-1
        const wsOtros = new WebSocket('ws://192.168.134.179:8081'); // ESP32-2
        const wsRespiratoria = new WebSocket('ws://192.168.1.75:8082'); // ESP32-3

        const updateData = (sensorType, value) => {
            setSensorData((prev) => ({
                ...prev,
                [sensorType]: [...prev[sensorType], value],
            }));
        };

        wsPeso.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.sensorType === 'peso') {
                    updateData('peso', parseFloat(data.value));
                }
            } catch (error) {
                console.error('Error parsing WebSocket data (ESP32-1):', error);
            }
        };

        wsOtros.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.sensorType === 'altura') {
                    updateData('altura', parseFloat(data.value));
                } else if (data.sensorType === 'temperatura') {
                    updateData('temperaturaCorporal', parseFloat(data.value));
                }
            } catch (error) {
                console.error('Error parsing WebSocket data (ESP32-2):', error);
            }
        };

        wsRespiratoria.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.sensorType === 'frecuenciaRespiratoria') {
                    updateData('frecuenciaRespiratoria', parseFloat(data.value));
                }
            } catch (error) {
                console.error('Error parsing WebSocket data (ESP32-3):', error);
            }
        };

        // Cleanup WebSocket connections
        return () => {
            wsPeso.close();
            wsOtros.close();
            wsRespiratoria.close();
        };
    }, []);

    const statsPeso = calculateStats(sensorData.peso);
    const statsAltura = calculateStats(sensorData.altura);
    const statsTemperatura = calculateStats(sensorData.temperaturaCorporal);
    const statsRespiratoria = calculateStats(sensorData.frecuenciaRespiratoria);

    return (
        <div className="stats-container">
            <h1>Health Statistics</h1>
            <div className="stats-table">
                <table>
                    <thead>
                        <tr>
                        <th>Parámetro</th>
                            <th>Media</th>
                            <th>Mediana</th>
                            <th>Moda</th>
                            <th>Última lectura</th>
                            <th>Predicción de salud</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Peso </td>
                            <td>{statsPeso?.mean || 'No data'}</td>
                            <td>{statsPeso?.median || 'No data'}</td>
                            <td>{statsPeso?.mode || 'No data'}</td>
                            <td>{sensorData.peso.slice(-1)[0] || 'No data'}</td>
                            <td>{healthPrediction('peso', sensorData.peso.slice(-1)[0])}</td>
                        </tr>
                        <tr>
                            <td>Altura </td>
                            <td>{statsAltura?.mean || 'No data'}</td>
                            <td>{statsAltura?.median || 'No data'}</td>
                            <td>{statsAltura?.mode || 'No data'}</td>
                            <td>{sensorData.altura.slice(-1)[0] || 'No data'}</td>
                            <td>{healthPrediction('altura', sensorData.altura.slice(-1)[0])}</td>
                        </tr>
                        <tr>
                            <td>Temperatura Corporal </td>
                            <td>{statsTemperatura?.mean || 'No data'}</td>
                            <td>{statsTemperatura?.median || 'No data'}</td>
                            <td>{statsTemperatura?.mode || 'No data'}</td>
                            <td>{sensorData.temperaturaCorporal.slice(-1)[0] || 'No data'}</td>
                            <td>{healthPrediction('temperaturaCorporal', sensorData.temperaturaCorporal.slice(-1)[0])}</td>
                        </tr>
                        <tr>
                            <td>Frecuencia Respiratoria </td>
                            <td>{statsRespiratoria?.mean || 'No data'}</td>
                            <td>{statsRespiratoria?.median || 'No data'}</td>
                            <td>{statsRespiratoria?.mode || 'No data'}</td>
                            <td>{sensorData.frecuenciaRespiratoria.slice(-1)[0] || 'No data'}</td>
                            <td>{healthPrediction('frecuenciaRespiratoria', sensorData.frecuenciaRespiratoria.slice(-1)[0])}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Statistics;
