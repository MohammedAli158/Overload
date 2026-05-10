import { useState } from 'react'
import {Routes, Route} from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import ExerciseDetailsPage from './pages/ExercisePage';

function App() {
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
