import React, { useState } from 'react';
import '../styles/AddFile.css';

const AddFile = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        fechaNacimiento: '',
        edad: '',
        sexo: '',
        domicilio: '',
    });

    const [loading, setLoading] = useState(false); // Estado de carga

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        if (formData.nombre && formData.apellidos && formData.fechaNacimiento && formData.sexo && formData.domicilio) {
            const edad = new Date().getFullYear() - new Date(formData.fechaNacimiento).getFullYear();
            setLoading(true); // Inicia la carga
            try {
                const response = await fetch('https://vitalis.3utilities.com/api/pacientes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nombre: formData.nombre,
                        apellidos: formData.apellidos,
                        fecha_nacimiento: formData.fechaNacimiento,
                        edad: edad,
                        sexo: formData.sexo,
                        domicilio: formData.domicilio,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Paciente agregado exitosamente.');
                    // Limpia el formulario
                    setFormData({
                        nombre: '',
                        apellidos: '',
                        fechaNacimiento: '',
                        edad: '',
                        sexo: '',
                        domicilio: '',
                    });
                } else {
                    alert(data.message || 'Error al guardar el paciente.');
                }
            } catch (error) {
                console.error('Error al guardar el paciente:', error);
                alert('Hubo un error al conectar con el servidor.');
            } finally {
                setLoading(false); // Finaliza la carga
            }
        } else {
            alert('Por favor, rellena toda la información requerida.');
        }
    };

    return (
        <div className="add-file-container">
            <h2>Agregar Archivo de Paciente</h2>
            <form className="add-file-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                    <label>Nombre</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Apellidos</label>
                    <input
                        type="text"
                        name="apellidos"
                        value={formData.apellidos}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Fecha de Nacimiento</label>
                    <input
                        type="date"
                        name="fechaNacimiento"
                        value={formData.fechaNacimiento}
                        onChange={(e) => {
                            const fechaNacimiento = e.target.value;
                            const edad = new Date().getFullYear() - new Date(fechaNacimiento).getFullYear();
                            setFormData((prev) => ({ ...prev, fechaNacimiento, edad }));
                        }}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Edad</label>
                    <input type="number" value={formData.edad} readOnly />
                </div>
                <div className="form-group">
                    <label>Sexo</label>
                    <select
                        name="sexo"
                        value={formData.sexo}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Domicilio</label>
                    <textarea
                        name="domicilio"
                        value={formData.domicilio}
                        onChange={handleChange}
                        required
                    ></textarea>
                </div>

                <button type="button" onClick={handleSave} disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar'}
                </button>
            </form>
        </div>
    );
};

export default AddFile;
