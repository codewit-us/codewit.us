// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NavBar from '../components/nav/Nav';
import Home from '../pages/Home';
import Read from '../pages/Read';
import Create from '../pages/Create';
import NotFound from '../components/notfound/NotFound';
import ExerciseForms from '../pages/ExerciseForms';
import ModuleForm from '../pages/ModuleForm';
import ResourceForm from '../pages/ResourceForm';
import CourseForm from '../pages/CourseForm';
import DemoForms from '../pages/DemoForms';

import { Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <div className = "w-full h-screen bg-background-500">
      <NavBar />
      <Routes>
        <Route path="/" element={ <Home /> } />

        <Route path="/read/:uid" element={ <Read /> }/>

        <Route path="/create" element={<Create />}>
          <Route index element={<DemoForms />} />
          <Route path="" element={<DemoForms />} />
          <Route path="exercise" element={<ExerciseForms />} />
          <Route path="module" element={<ModuleForm />} />
          <Route path="resource" element={<ResourceForm />} />
          <Route path="course" element={<CourseForm />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
