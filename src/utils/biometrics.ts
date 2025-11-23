export interface BiometricInput {
  gender: 'male' | 'female';
  age: number;
  weight: number;
  height: number;
  skinfolds: {
    triceps?: number;
    biceps?: number;
    subscapular?: number;
    chest?: number;
    axillary?: number;
    suprailiac?: number;
    abdominal?: number;
    thigh?: number;
    calf?: number;
  };
}

export const calculateBiometrics = (data: BiometricInput) => {
  const { gender, age, skinfolds, weight, height } = data;
  let bodyDensity = 0;
  let bodyFat = 0;
  let leanMass = 0;
  let fatMass = 0;
  let bmi = 0;

  // 1. Cálculo de IMC
  if (weight && height) {
    const hM = height / 100;
    bmi = parseFloat((weight / (hM * hM)).toFixed(2));
  }

  // 2. Protocolo Pollock
  const sum3Men = (skinfolds.chest || 0) + (skinfolds.abdominal || 0) + (skinfolds.thigh || 0);
  const sum3Women = (skinfolds.triceps || 0) + (skinfolds.suprailiac || 0) + (skinfolds.thigh || 0);

  const sum7 = 
    (skinfolds.chest || 0) + (skinfolds.axillary || 0) + (skinfolds.triceps || 0) + 
    (skinfolds.subscapular || 0) + (skinfolds.abdominal || 0) + 
    (skinfolds.suprailiac || 0) + (skinfolds.thigh || 0);

  // Consideramos 7 dobras se pelo menos 7 campos tiverem valor maior que 0
  const has7Folds = Object.values(skinfolds).filter(v => v && Number(v) > 0).length >= 7;

  if (gender === 'male') {
    if (has7Folds) {
      bodyDensity = 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7 * sum7) - (0.00028826 * age);
    } else {
      bodyDensity = 1.10938 - (0.0008267 * sum3Men) + (0.0000016 * sum3Men * sum3Men) - (0.0002574 * age);
    }
  } else {
    if (has7Folds) {
      bodyDensity = 1.097 - (0.00046971 * sum7) + (0.00000056 * sum7 * sum7) - (0.00012828 * age);
    } else {
      bodyDensity = 1.0994921 - (0.0009929 * sum3Women) + (0.0000023 * sum3Women * sum3Women) - (0.0001392 * age);
    }
  }

  if (bodyDensity > 0) {
    bodyFat = parseFloat(((4.95 / bodyDensity) - 4.50) * 100).toFixed(2) as any;
  }

  if (bodyFat > 0 && weight > 0) {
    fatMass = weight * (bodyFat / 100);
    leanMass = weight - fatMass;
  }

  return {
    bmi,
    bodyFat: parseFloat(bodyFat as any),
    leanMass: parseFloat(leanMass.toFixed(2)),
    fatMass: parseFloat(fatMass.toFixed(2)),
    protocol: has7Folds ? 'Pollock 7 Dobras' : 'Pollock 3 Dobras'
  };
};

export const classifyBMI = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-400' };
  if (bmi < 24.9) return { label: 'Peso normal', color: 'text-green-400' };
  if (bmi < 29.9) return { label: 'Sobrepeso', color: 'text-yellow-400' };
  return { label: 'Obesidade', color: 'text-red-400' };
};

// --- CÁLCULO DE PORCENTAGEM REAL (25 CAMPOS) ---
export const calculateCompletion = (form: any) => {
  let filledCount = 0;
  const totalFields = 25;

  // Helper para verificar se o campo tem valor válido
  const isValid = (val: any) => val !== '' && val !== null && val !== undefined && Number(val) >= 0;

  // 1. Dados Básicos (5 campos)
  if (form.date) filledCount++;
  if (isValid(form.weight)) filledCount++;
  if (isValid(form.height)) filledCount++;
  if (isValid(form.age)) filledCount++;
  if (form.gender) filledCount++;

  // 2. Dobras Cutâneas (9 campos)
  const s = form.skinfolds;
  if (isValid(s.triceps)) filledCount++;
  if (isValid(s.biceps)) filledCount++;
  if (isValid(s.subscapular)) filledCount++;
  if (isValid(s.chest)) filledCount++;
  if (isValid(s.axillary)) filledCount++;
  if (isValid(s.suprailiac)) filledCount++;
  if (isValid(s.abdominal)) filledCount++;
  if (isValid(s.thigh)) filledCount++;
  if (isValid(s.calf)) filledCount++;

  // 3. Perímetros (11 campos)
  const c = form.circumferences;
  if (isValid(c.shoulder)) filledCount++;
  if (isValid(c.chest)) filledCount++;
  if (isValid(c.arm_right)) filledCount++;
  if (isValid(c.arm_left)) filledCount++;
  if (isValid(c.waist)) filledCount++;
  if (isValid(c.abdomen)) filledCount++;
  if (isValid(c.hips)) filledCount++;
  if (isValid(c.thigh_right)) filledCount++;
  if (isValid(c.thigh_left)) filledCount++;
  if (isValid(c.calf_right)) filledCount++;
  if (isValid(c.calf_left)) filledCount++;

  // Cálculo da porcentagem
  const percentage = Math.round((filledCount / totalFields) * 100);
  
  return Math.min(percentage, 100);
};