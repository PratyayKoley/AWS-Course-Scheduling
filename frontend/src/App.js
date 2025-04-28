import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Main from './components/main';
import StudentEnrollment from './components/studentPage';
import AdminPanel from './components/adminPage';
import StudentData from './components/studentDataPage';
import StudentUnderTeacherData from './components/studentUnderTeacherData';
import GenerateTimetable from './components/generateTable';
import TeacherPanel from './components/teacherPage';
import ViewData from './components/viewData';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/adminpage" element={<AdminPanel />} />
          <Route path="/studentPage" element={<StudentEnrollment />} />
          <Route path='/teacherPage' element={<TeacherPanel />} />
          <Route path="/studentData" element={<StudentData />} />
          <Route path="/studentUnderTeacherDataPage" element={<StudentUnderTeacherData />} />
          <Route path="/generateTimeTable" element={<GenerateTimetable />} />
          <Route path="/viewData" element={<ViewData />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
