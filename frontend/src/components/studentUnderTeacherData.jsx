import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const StudentUnderTeacherTable = () => {
    const location = useLocation();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [studentsPerPage] = useState(10);
    const { teacherName } = location.state || {};

    useEffect(() => {
        const fetchStudentsUnderTeacher = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_LINK}/api/teachers/getStudentUnderTeacher/${teacherName}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch student data');
                }
                const data = await response.json();
                setStudents(data);
                setFilteredStudents(data);
            } catch (error) {
                console.error('Error fetching student data:', error);
            }
        };

        fetchStudentsUnderTeacher();
    }, [teacherName]);

    useEffect(() => {
        const results = students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredStudents(results);
        setCurrentPage(1);
    }, [searchTerm, students]);

    const downloadExcel = () => {
        const formattedStudents = filteredStudents.map((student) => ({
            ...student,
            subjects: student.subjects.join(', '),
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedStudents);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
        XLSX.writeFile(workbook, 'students_under_teacher.xlsx');
    };

    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen">
            <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
                Students Under {teacherName}
            </h2>

            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
                <div className="relative w-full sm:w-64 mb-4 sm:mb-0">
                    <input
                        type="text"
                        placeholder="Search students or subjects..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                </div>
                <button
                    onClick={downloadExcel}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow transition-all duration-300 flex items-center"
                >
                    <Download size={20} className="mr-2" />
                    Download Excel
                </button>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full table-auto">
                    <thead className="bg-blue-500 text-white">
                        <tr>
                            <th className="py-3 px-4 text-left">Name</th>
                            <th className="py-3 px-4 text-center">Sem</th>
                            <th className="py-3 px-4 text-left">Subjects</th>
                            <th className="py-3 px-4 text-center">Elective 1</th>
                            <th className="py-3 px-4 text-center">Elective 2</th>
                            <th className="py-3 px-4 text-center">Open Elective</th>
                            <th className="py-3 px-4 text-center">LLC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentStudents.map((student, index) => (
                            <tr key={index} className={`hover:bg-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                                <td className="py-3 px-4 border-b">{student.name}</td>
                                <td className="py-3 px-4 border-b text-center">{student.semester}</td>
                                <td className="py-3 px-4 border-b">{student.subjects.join(', ')}</td>
                                <td className="py-3 px-4 border-b text-center">{student.elective1}</td>
                                <td className="py-3 px-4 border-b text-center">{student.elective2}</td>
                                <td className="py-3 px-4 border-b text-center">{student.openElective}</td>
                                <td className="py-3 px-4 border-b text-center">{student.llc}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstStudent + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(indexOfLastStudent, filteredStudents.length)}</span> of{' '}
                        <span className="font-medium">{filteredStudents.length}</span> results
                    </p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-md bg-blue-500 text-white disabled:bg-gray-300"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={indexOfLastStudent >= filteredStudents.length}
                        className="px-3 py-1 rounded-md bg-blue-500 text-white disabled:bg-gray-300"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentUnderTeacherTable;