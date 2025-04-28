import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function StudentEnrollment() {
    const [name, setName] = useState('');
    const [semester, setSemester] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [llc, setLlc] = useState('');
    const [elective1, setElective1] = useState('');
    const [elective2, setElective2] = useState('');
    const [openElective, setOpenElective] = useState('');
    const [availableElectives, setAvailableElectives] = useState([]);
    const [availableOpenElectives, setAvailableOpenElectives] = useState([]);
    const [availableLlc, setAvailableLlc] = useState([]);
    const [showLlc, setShowLlc] = useState(false);
    const [electiveCount, setElectiveCount] = useState(0);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const semesterSubjects = {
        '1': {
            subjects: ['Matrices and Differential Calculus', 'Engineering Physics', 'Engineering Graphics', 'Basic Electrical and Electronics Engineering', 'Innovation and Design Thinking', 'Essential Computing Skills for Engineers', 'Measuring Instruments and Testing Tools', 'Art of Communication'],
            llc: true,
        },
        '2': {
            subjects: ['Integral Calculus and Probability Theory', 'Engineering Chemistry', 'Programming Fundamentals', 'Human Health Systems', 'Digital Electronics', 'Essential Psychomotor Skills for Engineers', 'Creative Coding in Python', 'Indian knowledge System', 'Introduction to Emerging Technologies'],
            llc: true,
        },
        '3': {
            subjects: ['Discrete Maths and Statistics', 'Computer Organization and Architecture', 'Data Structures', 'Object Oriented Programming with JAVA', 'Law for engineers', 'Financial Planning, Taxation and Investment', 'Human Values and Professional Ethics', 'Community Engagement Project', 'Honors/Double Minor Course'],
            llc: true,
            electives: [
                { value: 'ml', label: 'Machine Learning' },
                { value: 'cloud', label: 'Cloud Computing' },
                { value: 'ai', label: 'Artificial Intelligence' },
            ],
            electiveCount: 2,
        },
        '4': {
            subjects: ['Linear Algebra and Business Statistics', 'Analysis of Algorithms', 'Database Management System', 'Data Analytics and Visualization', 'Emerging Technology and Law', 'Web Programming', 'Modern Indian Language', 'Technology Entrepreneurship', 'Technology Innovation for Sustainable Development', 'Honors/Double Minor Course'],
            llc: true,
            electives: [
                { value: 'iot', label: 'IoT' },
                { value: 'blockchain', label: 'Blockchain' },
            ],
            electiveCount: 1,
        },
        '5': {
            subjects: ['Operating System', 'Computer Network', 'Machine learning', 'Honors/Double Minor Course', 'Cryptography and Computer Security', 'Health, Wellness and Psychology', 'Public relation and Corporate Communication', 'Program Elective lab'],
            llc: false,
            electives: [
                { value: 'cloud', label: 'Cloud Computing' },
                { value: 'ai', label: 'Artificial Intelligence' },
            ],
            openElectives: [
                { value: 'fintech', label: 'FinTech' },
                { value: 'arvr', label: 'AR/VR' },
                { value: 'robotics', label: 'Robotics' },
            ],
            electiveCount: 1,
            openElectiveCount: 1,
        },
        '6': {
            subjects: ['Honors/Double Minor Course', 'Theoretical Computer Science', 'data Warehousing and mining', 'cloud Computing', 'Emotional and spiritual intelligence', 'Artificial intelligence', 'Programming Elective Lab A', 'Programming Elective Lab B', 'Deep Learning'],
            llc: false,
            electives: [
                { value: 'ml', label: 'Machine Learning' },
                { value: 'cybersec', label: 'Cyber Security' },
                { value: 'blockchain', label: 'Blockchain' },
            ],
            electiveCount: 2,
        },
    };

    const llcOptions = [
        { value: 'english', label: 'English' },
        { value: 'hindi', label: 'Hindi' },
        { value: 'french', label: 'French' },
        { value: 'german', label: 'German' },
    ];

    useEffect(() => {
        if (semester) {
            const semData = semesterSubjects[semester];
            setSubjects(semData?.subjects || []);
            setShowLlc(semData?.llc || false);
            setAvailableElectives(semData?.electives || []);
            setAvailableOpenElectives(semData?.openElectives || []);
            setElectiveCount(semData?.electiveCount || 0);
            setAvailableLlc(llcOptions);

            // Reset fields that are not applicable to the selected semester
            if (!semData?.llc) setLlc('');
            if (!semData?.electives) {
                setElective1('');
                setElective2('');
            }
            if (!semData?.openElectives) setOpenElective('');
        }
    }, [semester]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const studentData = { 
            name, 
            semester, 
            subjects, 
            ...(showLlc && { llc }),
            ...(electiveCount > 0 && { elective1 }),
            ...(electiveCount > 1 && { elective2 }),
            ...(availableOpenElectives.length > 0 && { openElective })
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_LINK}/api/students/enroll-student`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData),
            });

            if (!response.ok) {
                throw new Error('Failed to enroll student');
            }

            setNotification({ message: 'Student enrolled successfully!', type: 'success' });
        } catch (error) {
            console.error('Error:', error);
            setNotification({ message: 'Failed to enroll student. Please try again.', type: 'error' });
        }
    };

    return (
        <div className="min-h-screen p-8 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
            <form onSubmit={handleSubmit} className="bg-white bg-opacity-10 backdrop-blur-md p-10 rounded-3xl shadow-xl w-full max-w-4xl border border-white/30">
                <h2 className="text-4xl mb-8 text-center font-semibold text-white">Student Enrollment</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block mb-2 text-lg font-medium text-white">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-3 rounded-md bg-gray-800 bg-opacity-50 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-300 transition"
                            placeholder="Enter your name"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-lg font-medium text-white">Semester</label>
                        <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            required
                            className="w-full p-3 rounded-md bg-gray-800 bg-opacity-50 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-300 transition"
                        >
                            <option value="">Select Semester</option>
                            {Object.keys(semesterSubjects).map((sem) => (
                                <option key={sem} value={sem}>Sem {sem}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {subjects.length > 0 && (
                    <div className="mb-6">
                        <label className="block mb-2 text-lg font-medium text-white">Subjects</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subjects.map((subject, index) => (
                                <div key={index} className="p-3 rounded-md bg-gray-800 bg-opacity-50 text-white shadow-md">
                                    {subject}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {showLlc && (
                    <div className="mb-6">
                        <label className="block mb-2 text-lg font-medium text-white">LLC</label>
                        <select
                            value={llc}
                            onChange={(e) => setLlc(e.target.value)}
                            required
                            className="w-full p-3 rounded-md bg-gray-800 bg-opacity-50 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-300 transition"
                        >
                            <option value="">Select LLC course</option>
                            {availableLlc.map((llcOption) => (
                                <option key={llcOption.value} value={llcOption.value}>
                                    {llcOption.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {electiveCount > 0 && (
                    <div className="mb-6">
                        <label className="block mb-2 text-lg font-medium text-white">Elective(s)</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[...Array(electiveCount)].map((_, i) => (
                                <select
                                    key={i}
                                    value={i === 0 ? elective1 : elective2}
                                    onChange={(e) => i === 0 ? setElective1(e.target.value) : setElective2(e.target.value)}
                                    required
                                    className="w-full p-3 rounded-md bg-gray-800 bg-opacity-50 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-300 transition"
                                >
                                    <option value="">Select elective {i + 1}</option>
                                    {availableElectives.map((elective) => (
                                        <option key={elective.value} value={elective.value}>
                                            {elective.label}
                                        </option>
                                    ))}
                                </select>
                            ))}
                        </div>
                    </div>
                )}

                {availableOpenElectives.length > 0 && (
                    <div className="mb-6">
                        <label className="block mb-2 text-lg font-medium text-white">Open Elective</label>
                        <select
                            value={openElective}
                            onChange={(e) => setOpenElective(e.target.value)}
                            required
                            className="w-full p-3 rounded-md bg-gray-800 bg-opacity-50 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-300 transition"
                        >
                            <option value="">Select Open Elective</option>
                            {availableOpenElectives.map((oe) => (
                                <option key={oe.value} value={oe.value}>
                                    {oe.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full p-3 rounded-md bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition text-lg font-medium text-white"
                >
                    Enroll
                </button>

                {notification.message && (
                    <div className={`mt-4 p-3 rounded-md ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white flex items-center`}>
                        {notification.type === 'success' ? <CheckCircle className="mr-2" /> : <AlertCircle className="mr-2" />}
                        {notification.message}
                    </div>
                )}
            </form>
        </div>
    );
}