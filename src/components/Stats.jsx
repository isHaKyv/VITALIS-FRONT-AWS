import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import '../styles/Statistics.css';


import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Stats = () => {
    const [sensorData, setSensorData] = useState({
        peso: [],
        altura: [],
        temperaturaCorporal: [],
        frecuenciaRespiratoria: [],
    });

    const [timestamps, setTimestamps] = useState([]);

    useEffect(() => {
        // WebSocket connections for each sensor
        const wsPeso = new WebSocket('ws://192.168.134.91:8080'); // ESP32-1
        const wsOtros = new WebSocket('ws://192.168.134.179:8081'); // ESP32-2
        const wsRespiratoria = new WebSocket('ws://192.168.1.75:8082'); // ESP32-3

        const updateData = (sensorType, value) => {
            setSensorData((prev) => ({
                ...prev,
                [sensorType]: [...prev[sensorType], value],
            }));

            if (sensorType === 'peso') {
                setTimestamps((prev) => [...prev, new Date().toLocaleTimeString()]);
            }
        };

        wsPeso.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.sensorType === 'peso') {
                    updateData('peso', data.value);
                }
            } catch (error) {
                console.error('Error parsing WebSocket data (ESP32-1):', error);
            }
        };

        wsOtros.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.sensorType === 'altura') {
                    updateData('altura', data.value);
                } else if (data.sensorType === 'temperatura') {
                    updateData('temperaturaCorporal', data.value);
                }
            } catch (error) {
                console.error('Error parsing WebSocket data (ESP32-2):', error);
            }
        };

        wsRespiratoria.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.sensorType === 'frecuenciaRespiratoria') {
                    updateData('frecuenciaRespiratoria', data.value);
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

    const generateChartData = (label, data, color) => ({
        labels: timestamps,
        datasets: [
            {
                label,
                data,
                borderColor: color,
                backgroundColor: `${color}33`, 
                borderWidth: 2,
                tension: 0.4, 
                fill: true, 
            },
        ],
    });

    return (
        <div className="statistics-container">
            <h1>Estadisticas Data de los Sensores</h1>
            <div className="chart-grid">
                <div className="chart-item">
                    <h2>Peso </h2>
                    <Line data={generateChartData('Peso (kg)', sensorData.peso, 'red')} />
                </div>
                <div className="chart-item">
                    <h2>Altura </h2>
                    <Line data={generateChartData('Altura (cm)', sensorData.altura, 'blue')} />
                </div>
                <div className="chart-item">
                    <h2>Temperatura Corporal </h2>
                    <Line
                        data={generateChartData('Temperatura (°C)', sensorData.temperaturaCorporal, 'green')}
                    />
                </div>
                <div className="chart-item">
                    <h2>Frecuencia Respiratoria </h2>
                    <Line
                        data={generateChartData(
                            'Frecuencia Respiratoria (bpm)',
                            sensorData.frecuenciaRespiratoria,
                            'orange'
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

export default Stats;
