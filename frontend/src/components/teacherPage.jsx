import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock } from 'lucide-react';
import TimeTableDisplayTeacher from './TimetableDisplayTeacher';

export default function TeacherPage() {
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [timeTable, setTimeTable] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_LINK}/api/teachers`);
                if (!response.ok) {
                    throw new Error('Failed to fetch teachers');
                }
                const data = await response.json();
                setTeachers(data);
            } catch (error) {
                console.error('Error fetching teacher data:', error);
            }
        };

        fetchTeachers();
    }, []);

    const handleTeacherChange = (event) => {
        setSelectedTeacher(event.target.value);
    };

    const fetchTimetable = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_LINK}/api/teachers/getTimeTable/${selectedTeacher}`);
            if (!response.ok) {
                throw new Error('Failed to fetch timetable');
            }
            const timetableData = await response.json();
            setTimeTable(timetableData);
        } catch (error) {
            console.error('Error fetching timetable:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl text-center text-blue-800 mb-12 font-extrabold tracking-wide">
                    Teacher Dashboard
                </h1>

                <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
                    <label htmlFor="teacherSelect" className="block text-gray-700 text-lg font-semibold mb-2">Select Teacher:</label>
                    <select
                        id="teacherSelect"
                        value={selectedTeacher}
                        onChange={handleTeacherChange}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                        <option value="">-- Choose a Teacher --</option>
                        {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.name}>
                                {teacher.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300">
                        <div className="flex items-center mb-6">
                            <Calendar className="w-8 h-8 text-blue-500 mr-4" />
                            <h2 className="text-2xl text-gray-800 font-bold">View Timetable</h2>
                        </div>
                        <p className="text-gray-600 mb-6">Check your class schedule and timings for better planning.</p>
                        <button
                            onClick={fetchTimetable}
                            className="w-full py-3 px-6 text-white rounded-lg font-bold tracking-wider shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center"
                            disabled={!selectedTeacher}
                        >
                            <Clock className="w-5 h-5 mr-2" />
                            View Timetable
                        </button>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300">
                        <div className="flex items-center mb-6">
                            <Users className="w-8 h-8 text-purple-500 mr-4" />
                            <h2 className="text-2xl text-gray-800 font-bold">Student Details</h2>
                        </div>
                        <p className="text-gray-600 mb-6">Access comprehensive information about your students.</p>
                        <button
                            onClick={() => navigate("/studentUnderTeacherDataPage", { state: { teacherName: selectedTeacher } })}
                            className="w-full py-3 px-6 text-white rounded-lg font-bold tracking-wider shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center"
                            disabled={!selectedTeacher}
                        >
                            <Users className="w-5 h-5 mr-2" />
                            View Students
                        </button>
                    </div>
                </div>

                {timeTable && (
                    <div className="mt-12 bg-white rounded-xl shadow-xl p-8">
                        <h2 className="text-2xl text-gray-800 font-bold mb-6">Your Timetable</h2>
                        <TimeTableDisplayTeacher timetable={timeTable} />
                    </div>
                )}
            </div>
        </div>
    );
}