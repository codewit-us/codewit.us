// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NavBar from '../components/nav/nav';
import Home from '../pages/home';
import Read from '../pages/read';
import Create from '../pages/create';
import NotFound from '../components/notfound/notfound';
import CreateExercise from '../pages/createExercise';
import CreateDemo from '../pages/createDemo';
import styles from './app.module.css';

import { Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <div className = "w-full h-screen bg-background-500">
      <NavBar />
      <Routes>
        <Route path="/" element={ <Home /> } />

        <Route path="/read/:uid" element={ <Read /> }/>

        <Route path="/create" element={<Create />}>
          <Route index element={<CreateDemo />} />
          <Route path="" element={<CreateDemo />} />
          <Route path="exercise" element={<CreateExercise />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
