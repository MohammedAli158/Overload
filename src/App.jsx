import { useState } from 'react'
import {Routes, Route} from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import ExerciseDetailsPage from './pages/ExercisePage';

function App() {
  const exercises = {
    'Chest': [
        {'name': 'flat-barbell', 'weight': 50, 'reps': 6},
        {'name': 'incline-dumbbell', 'weight': 15, 'reps': 12},
        {'name': 'flat-dumbell', 'weight': 20, 'reps': 10},
        {'name': 'incline-barbell', 'weight': 20, 'reps': 8}
    ],
    'Back': [
        {'name': 'pullup', 'weight': 0, 'reps': 0}
    ],
    'Legs': [
        {'name': 'squat', 'weight': 0, 'reps': 0}
    ],
    'Shoulders': [
        {'name': 'overhead-press', 'weight': 0, 'reps': 0}
    ],
    'Biceps': [
        {'name': 'barbell-curl', 'weight': 0, 'reps': 0}
    ],
    'Triceps': [
        {'name': 'triceps-pushdown', 'weight': 0, 'reps': 0}
    ],
    'Miscl': [
        {'name': 'plank', 'weight': 0, 'reps': 0},
        {'name': 'hyperextension', 'weight': 0, 'reps': 0}
    ]
}
  localStorage.setItem('progressiveOverload',JSON.stringify(exercises))
  return (
   <>
   <Routes>
      <Route path="/" element={<HomePage />} >
      </Route>
        <Route path="/exercises/:exerciseName" element={<ExerciseDetailsPage/>} />
   </Routes>
   </>
  )
}

export default App
