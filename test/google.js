import { translateWithGoogle } from '../utils/google.js';

const text = "Halo dunia!";
translateWithGoogle(text, 'ru').then(console.log);
