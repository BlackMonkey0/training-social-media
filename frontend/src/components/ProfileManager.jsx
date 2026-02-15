import React from 'react';
import { useAuthStore } from '../services/authStore';

function profileStorageKey(userId) {
  return `sc_profile_${userId}`;
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const DEFAULT_PROFILE = {
  age: '',
  gender: '',
  heightCm: '',
  weightKg: '',
  targetWeightKg: '',
  experienceLevel: 'beginner',
  activityLevel: 'moderate',
  goalType: 'health',
  targetDate: '',
  weeklySessionsGoal: '',
  weeklyDistanceGoalKm: '',
  weeklyTimeGoalMin: '',
  injuries: '',
  medicalNotes: '',
  sleepHours: '',
  hydrationLiters: '',
  nutritionStyle: '',
  motivation: '',
  notes: '',
};

function calculateBmi(heightCm, weightKg) {
  const h = parseFloat(heightCm);
  const w = parseFloat(weightKg);
  if (!h || !w) return null;
  const hm = h / 100;
  return w / (hm * hm);
}

export default function ProfileManager() {
  const user = useAuthStore((state) => state.user);
  const updateUserLocal = useAuthStore((state) => state.updateUserLocal);
  const [message, setMessage] = React.useState('');
  const [profile, setProfile] = React.useState(DEFAULT_PROFILE);
  const [identity, setIdentity] = React.useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    sportPreference: user?.sportPreference || 'running',
  });

  React.useEffect(() => {
    if (!user?.id) return;
    const stored = readJson(profileStorageKey(user.id), DEFAULT_PROFILE);
    setProfile({ ...DEFAULT_PROFILE, ...stored });
    setIdentity({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      sportPreference: user.sportPreference || 'running',
    });
  }, [user?.id, user?.firstName, user?.lastName, user?.sportPreference]);

  const bmi = calculateBmi(profile.heightCm, profile.weightKg);
  const bmiLabel = bmi == null
    ? 'Sin datos'
    : bmi < 18.5
      ? 'Bajo peso'
      : bmi < 25
        ? 'Saludable'
        : bmi < 30
          ? 'Sobrepeso'
          : 'Obesidad';

  const handleIdentityChange = (e) => {
    const { name, value } = e.target;
    setIdentity((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = (e) => {
    e.preventDefault();
    if (!user?.id) return;
    localStorage.setItem(profileStorageKey(user.id), JSON.stringify(profile));
    updateUserLocal(identity);
    setMessage('Perfil actualizado correctamente.');
  };

  return (
    <div className="space-y-6">
      <div className="panel-card">
        <h2 className="section-title">Perfil personalizado</h2>
        <p className="helper-text mb-4">
          Completa tus datos de condicion fisica y objetivos para adaptar la experiencia a tu perfil.
        </p>

        {message && <div className="info-banner">{message}</div>}

        <form onSubmit={saveProfile} className="form-stack">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="form-control"
              name="firstName"
              value={identity.firstName}
              onChange={handleIdentityChange}
              placeholder="Nombre"
            />
            <input
              className="form-control"
              name="lastName"
              value={identity.lastName}
              onChange={handleIdentityChange}
              placeholder="Apellido"
            />
            <input className="form-control" value={user?.username || ''} readOnly placeholder="Usuario" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              className="form-control"
              name="age"
              value={profile.age}
              onChange={handleProfileChange}
              placeholder="Edad"
              type="number"
              min="1"
            />
            <select className="form-control" name="gender" value={profile.gender} onChange={handleProfileChange}>
              <option value="">Genero</option>
              <option value="female">Mujer</option>
              <option value="male">Hombre</option>
              <option value="other">Otro</option>
            </select>
            <input
              className="form-control"
              name="heightCm"
              value={profile.heightCm}
              onChange={handleProfileChange}
              placeholder="Altura (cm)"
              type="number"
              min="1"
            />
            <input
              className="form-control"
              name="weightKg"
              value={profile.weightKg}
              onChange={handleProfileChange}
              placeholder="Peso actual (kg)"
              type="number"
              min="1"
              step="0.1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              className="form-control"
              name="targetWeightKg"
              value={profile.targetWeightKg}
              onChange={handleProfileChange}
              placeholder="Peso objetivo (kg)"
              type="number"
              min="1"
              step="0.1"
            />
            <select
              className="form-control"
              name="experienceLevel"
              value={profile.experienceLevel}
              onChange={handleProfileChange}
            >
              <option value="beginner">Nivel: Principiante</option>
              <option value="intermediate">Nivel: Intermedio</option>
              <option value="advanced">Nivel: Avanzado</option>
            </select>
            <select
              className="form-control"
              name="activityLevel"
              value={profile.activityLevel}
              onChange={handleProfileChange}
            >
              <option value="low">Actividad diaria: Baja</option>
              <option value="moderate">Actividad diaria: Media</option>
              <option value="high">Actividad diaria: Alta</option>
            </select>
            <select
              className="form-control"
              name="sportPreference"
              value={identity.sportPreference}
              onChange={handleIdentityChange}
            >
              <option value="running">Deporte principal: Running</option>
              <option value="cycling">Deporte principal: Ciclismo</option>
              <option value="swimming">Deporte principal: Natacion</option>
              <option value="gym">Deporte principal: Gimnasio</option>
              <option value="football">Deporte principal: Futbol</option>
              <option value="other">Deporte principal: Otro</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select className="form-control" name="goalType" value={profile.goalType} onChange={handleProfileChange}>
              <option value="health">Objetivo: Salud general</option>
              <option value="weight_loss">Objetivo: Bajar peso</option>
              <option value="muscle_gain">Objetivo: Ganar masa muscular</option>
              <option value="endurance">Objetivo: Mejorar resistencia</option>
              <option value="performance">Objetivo: Rendimiento competitivo</option>
            </select>
            <input
              className="form-control"
              name="targetDate"
              value={profile.targetDate}
              onChange={handleProfileChange}
              type="date"
            />
            <input
              className="form-control"
              name="weeklySessionsGoal"
              value={profile.weeklySessionsGoal}
              onChange={handleProfileChange}
              placeholder="Sesiones por semana"
              type="number"
              min="0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="form-control"
              name="weeklyDistanceGoalKm"
              value={profile.weeklyDistanceGoalKm}
              onChange={handleProfileChange}
              placeholder="Meta semanal distancia (km)"
              type="number"
              min="0"
              step="0.1"
            />
            <input
              className="form-control"
              name="weeklyTimeGoalMin"
              value={profile.weeklyTimeGoalMin}
              onChange={handleProfileChange}
              placeholder="Meta semanal tiempo (min)"
              type="number"
              min="0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="form-control"
              name="sleepHours"
              value={profile.sleepHours}
              onChange={handleProfileChange}
              placeholder="Sueno promedio (h)"
              type="number"
              min="0"
              max="24"
              step="0.5"
            />
            <input
              className="form-control"
              name="hydrationLiters"
              value={profile.hydrationLiters}
              onChange={handleProfileChange}
              placeholder="Hidratacion (L/dia)"
              type="number"
              min="0"
              step="0.1"
            />
            <input
              className="form-control"
              name="nutritionStyle"
              value={profile.nutritionStyle}
              onChange={handleProfileChange}
              placeholder="Estilo nutricional"
            />
          </div>

          <textarea
            className="form-control"
            name="injuries"
            value={profile.injuries}
            onChange={handleProfileChange}
            placeholder="Lesiones o limitaciones fisicas"
            rows="2"
          />
          <textarea
            className="form-control"
            name="medicalNotes"
            value={profile.medicalNotes}
            onChange={handleProfileChange}
            placeholder="Notas medicas importantes"
            rows="2"
          />
          <textarea
            className="form-control"
            name="motivation"
            value={profile.motivation}
            onChange={handleProfileChange}
            placeholder="Motivacion principal"
            rows="2"
          />
          <textarea
            className="form-control"
            name="notes"
            value={profile.notes}
            onChange={handleProfileChange}
            placeholder="Notas adicionales"
            rows="3"
          />

          <button className="primary-btn w-full" type="submit">
            Guardar perfil personalizado
          </button>
        </form>
      </div>

      <div className="panel-card">
        <h3 className="section-title">Resumen rapido</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="list-item">
            <p className="list-item-title">IMC estimado</p>
            <p className="list-item-meta">
              {bmi == null ? 'Completa altura y peso' : `${bmi.toFixed(1)} · ${bmiLabel}`}
            </p>
          </div>
          <div className="list-item">
            <p className="list-item-title">Objetivo</p>
            <p className="list-item-meta">{profile.goalType || 'No definido'}</p>
          </div>
          <div className="list-item">
            <p className="list-item-title">Carga semanal</p>
            <p className="list-item-meta">
              {profile.weeklySessionsGoal || 0} sesiones · {profile.weeklyTimeGoalMin || 0} min
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
