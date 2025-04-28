import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    Filler,
    PointElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    Filler,
    PointElement
);

export default function Component() {
    const [classrooms, setClassrooms] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const classroomResponse = await fetch(`${process.env.REACT_APP_BACKEND_LINK}/api/classrooms`);
                const studentResponse = await fetch(`${process.env.REACT_APP_BACKEND_LINK}/api/students`);
                const teacherResponse = await fetch(`${process.env.REACT_APP_BACKEND_LINK}/api/teachers`);
    
                const classroomData = await classroomResponse.json();
                const studentData = await studentResponse.json();
                const teacherData = await teacherResponse.json();
    
                setClassrooms(classroomData);
                setStudents(studentData);
                setTeachers(teacherData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        loadData();
    }, []);

    // Sample data for the charts
    const countStudentsBySem = (students) => {
        const counts = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0 };

        students.forEach(student => {
            if (counts[student.semester] !== undefined) {
                counts[student.semester]++;
            }
        });

        return counts;
    };

    const studentCounts = countStudentsBySem(students);

    // Generate teacher data
    const countTeachersBySubject = (teachers) => {
        const counts = {
            "Matrices and Differential Calculus": 0,
            "Engineering Physics": 0,
            "Engineering Graphics": 0,
            "Basic Electrical and Electronics Engineering": 0,
            "Innovation and Design Thinking": 0,
            "Essential Computing Skills for Engineers": 0,
            "Measuring Instruments and Testing Tools": 0,
            "Art of Communication": 0,
            "Integral Calculus and Probability Theory": 0,
            "Engineering Chemistry": 0,
            "Programming Fundamentals": 0,
            "Human Health Systems": 0,
            "Digital Electronics": 0,
            "Essential Psychomotor Skills for Engineers": 0,
            "Creative Coding in Python": 0,
            "Indian knowledge System": 0,
            "Introduction to Emerging Technologies": 0,
            "Discrete Maths and Statistics": 0,
            "Computer Organization and Architecture": 0,
            "Data Structures": 0,
            "Object Oriented Programming with JAVA": 0,
            "Law for engineers": 0,
            "Financial Planning Taxation and Investment": 0,
            "Human Values and Professional Ethics": 0,
            "Community Engagement Project": 0,
            "Linear Algebra and Business Statistics": 0,
            "Analysis of Algorithms": 0,
            "Database Management System": 0,
            "Data Analytics and Visualization": 0,
            "Emerging Technology and Law": 0,
            "Web Programming": 0,
            "Modern Indian Language": 0,
            "Technology Entrepreneurship": 0,
            "Technology Innovation for Sustainable Development": 0,
            "Theoretical Computer Science": 0,
            "data Warehousing and mining": 0,
            "cloud Computing": 0,
            "Emotional and spiritual intelligence": 0,
            "Artificial intelligence": 0,
            "Programming Elective Lab A": 0,
            "Programming Elective Lab B": 0,
            "Deep Learning": 0,
            "Operating System": 0,
            "Computer Network": 0,
            "Machine learning": 0,
            "german": 0,
            "french": 0,
            "hindi": 0,
            "english": 0,
            "arvr": 0,
            "fintech": 0,
            "robotics": 0,
            "ml": 0,
            "cloud": 0,
            "ai": 0,
            "iot": 0,
            "blockchain": 0,
            "cybersec": 0,
            "Honors/Double Minor Course": 0,
            "Cryptography and Computer Security": 0,
            "Health Wellness and Psychology": 0,
            "Public relation and Corporate Communication": 0,
            "Program Elective lab": 0
        };

        teachers.forEach(teacher => {
            teacher.teaching_subjects.forEach(subject => {
                if (counts[subject] !== undefined) {
                    counts[subject]++;
                }
            });
        });

        return counts;
    };

    const teacherCounts = countTeachersBySubject(teachers);

    // Generate classroom capacities
    const classroomCapacities = classrooms.map(classroom => classroom.capacity);

    const countStudentsBySubject = (students) => {
        // Define the subjects you want to count
        const subjects = [
            "Matrices and Differential Calculus",
            "Engineering Physics",
            "Engineering Graphics",
            "Basic Electrical and Electronics Engineering",
            "Innovation and Design Thinking",
            "Essential Computing Skills for Engineers",
            "Measuring Instruments and Testing Tools",
            "Art of Communication",
            "Integral Calculus and Probability Theory",
            "Engineering Chemistry",
            "Programming Fundamentals",
            "Human Health Systems",
            "Digital Electronics",
            "Essential Psychomotor Skills for Engineers",
            "Creative Coding in Python",
            "Indian knowledge System",
            "Introduction to Emerging Technologies",
            "Discrete Maths and Statistics",
            "Computer Organization and Architecture",
            "Data Structures",
            "Object Oriented Programming with JAVA",
            "Law for engineers",
            "Financial Planning Taxation and Investment",
            "Human Values and Professional Ethics",
            "Community Engagement Project",
            "Linear Algebra and Business Statistics",
            "Analysis of Algorithms",
            "Database Management System",
            "Data Analytics and Visualization",
            "Emerging Technology and Law",
            "Web Programming",
            "Modern Indian Language",
            "Technology Entrepreneurship",
            "Technology Innovation for Sustainable Development",
            "Theoretical Computer Science",
            "data Warehousing and mining",
            "cloud Computing",
            "Emotional and spiritual intelligence",
            "Artificial intelligence",
            "Programming Elective Lab A",
            "Programming Elective Lab B",
            "Deep Learning",
            "Operating System",
            "Computer Network",
            "Machine learning",
            "german",
            "french",
            "hindi",
            "english",
            "Honors/Double Minor Course",
            "Cryptography and Computer Security",
            "Health Wellness and Psychology",
            "Public relation and Corporate Communication",
            "Program Elective lab"
        ];

        // Initialize counts for each subject
        const subjectCounts = subjects.reduce((acc, subject) => {
            acc[subject] = 0; // Start each subject count at 0
            return acc;
        }, {});

        // Count students in each subject
        students.forEach(student => {
            const enrolledSubjects = student.subjects || student.llc; // Assuming 'subjects' is an array of subjects for the student
            enrolledSubjects.forEach(subject => {
                if (subjectCounts[subject] !== undefined) {
                    subjectCounts[subject]++;
                }
            });
        });

        // Create the data array for the chart from the subjectCounts object
        const data = subjects.map(subject => subjectCounts[subject]);

        return data;
    };

    // Usage in your component
    const studentSubjectCounts = countStudentsBySubject(students);

    const countStudentsByElective = (students) => {
        // Define the electives you want to count
        const electives = [
            "arvr",
            "fintech",
            "robotics",
            "ml",
            "cloud",
            "ai",
            "iot",
            "blockchain",
            "cybersec"
        ];

        // Initialize counts for each elective
        const electiveCounts = electives.reduce((acc, elective) => {
            acc[elective] = 0; // Start each elective count at 0
            return acc;
        }, {});

        // Count students in each elective
        students.forEach(student => {
            const enrolledElectives = student.elective1 || student.elective2 || student.openElective;

            if (electiveCounts[enrolledElectives] !== undefined) {
                electiveCounts[enrolledElectives]++;
            }
        });


        // Create the data array for the chart from the electiveCounts object
        const data = electives.map(elective => electiveCounts[elective]);

        return data;
    };

    // Usage in your component
    const studentElectiveCounts = countStudentsByElective(students);


    // Sample data for the Bar chart
    const studentData = {
        labels: ['Sem1', 'Sem2', 'Sem3', 'Sem4', 'Sem5', 'Sem6'],
        datasets: [
            {
                label: 'Students Enrolled',
                data: [
                    studentCounts[1], studentCounts[2],
                    studentCounts[3], studentCounts[4],
                    studentCounts[5], studentCounts[6]],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 206, 86, 0.6)', 'rgba(153, 102, 255, 0.6)',
                    'rgba(54, 162, 235, 0.6)', 'rgba(255, 159, 64, 0.6)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)', 'rgba(153, 102, 255, 1)',
                    'rgba(54, 162, 235, 1)', 'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    const teacherData = {
        labels: Object.keys(teacherCounts),
        datasets: [
            {
                label: 'Number of Teachers',
                data: Object.values(teacherCounts),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)', 'rgba(255, 159, 64, 0.6)',
                    'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)',
                    'rgba(54, 235, 162, 0.6)', 'rgba(235, 64, 159, 0.6)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)', 'rgba(255, 159, 64, 1)',
                    'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)',
                    'rgba(255, 99, 132, 1)', 'rgba(255, 206, 86, 1)',
                    'rgba(54, 235, 162, 1)', 'rgba(235, 64, 159, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    const classroomData = {
        labels: classrooms.map(classroom => classroom.roomNumber), // Assuming classrooms have a 'name' field
        datasets: [
            {
                label: 'Classroom Capacities',
                data: classroomCapacities,
                backgroundColor: ['rgba(255, 206, 86, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)'],
                borderColor: ['rgba(255, 206, 86, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)'],
                borderWidth: 1,
            },
        ],
    };

    // Sample distribution of subjects and electives
    const generateRandomColor = () => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        const a = 0.6; // Setting transparency to 0.6 for background colors
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    };

    // Now define subjectDistributionData first
    const subjectDistributionData = {
        labels: [
            "Matrices and Differential Calculus",
            "Engineering Physics",
            "Engineering Graphics",
            "Basic Electrical and Electronics Engineering",
            "Innovation and Design Thinking",
            "Essential Computing Skills for Engineers",
            "Measuring Instruments and Testing Tools",
            "Art of Communication",
            "Integral Calculus and Probability Theory",
            "Engineering Chemistry",
            "Programming Fundamentals",
            "Human Health Systems",
            "Digital Electronics",
            "Essential Psychomotor Skills for Engineers",
            "Creative Coding in Python",
            "Indian Knowledge System",
            "Introduction to Emerging Technologies",
            "Discrete Maths and Statistics",
            "Computer Organization and Architecture",
            "Data Structures",
            "Object Oriented Programming with JAVA",
            "Law for Engineers",
            "Financial Planning Taxation and Investment",
            "Human Values and Professional Ethics",
            "Community Engagement Project",
            "Linear Algebra and Business Statistics",
            "Analysis of Algorithms",
            "Database Management System",
            "Data Analytics and Visualization",
            "Emerging Technology and Law",
            "Web Programming",
            "Modern Indian Language",
            "Technology Entrepreneurship",
            "Technology Innovation for Sustainable Development",
            "Theoretical Computer Science",
            "Data Warehousing and Mining",
            "Cloud Computing",
            "Emotional and Spiritual Intelligence",
            "Artificial Intelligence",
            "Programming Elective Lab A",
            "Programming Elective Lab B",
            "Deep Learning",
            "Operating System",
            "Computer Network",
            "Machine Learning",
            "german",
            "french",
            "hindi",
            "english",
            "Honors/Double Minor Course",
            "Cryptography and Computer Security",
            "Health, Wellness, and Psychology",
            "Public Relations and Corporate Communication",
            "Program Elective Lab"
        ],
        datasets: [
            {
                label: 'Subjects Offered',
                data: studentSubjectCounts,
                backgroundColor: [], // Placeholder, will be filled in below
                borderColor: [], // Placeholder, will be filled in below
                borderWidth: 1,
            },
        ],
    };

    // Generate color arrays based on the number of subjects
    const subjectCount = subjectDistributionData.labels.length;
    const backgroundColors = Array.from({ length: subjectCount }, generateRandomColor);
    const borderColors = backgroundColors.map(color => color.replace(/0\.6\)$/, "1)")); // Convert transparency to 1 for borders

    // Apply generated background colors and border colors to subjectDistributionData
    subjectDistributionData.datasets[0].backgroundColor = backgroundColors;
    subjectDistributionData.datasets[0].borderColor = borderColors;


    // Update your electiveDistributionData with dynamic data
    const electiveDistributionData = {
        labels: [
            "arvr",
            "fintech",
            "robotics",
            "ml",
            "cloud",
            "ai",
            "iot",
            "blockchain",
            "cybersec",
        ],
        datasets: [
            {
                label: 'Electives Chosen',
                data: studentElectiveCounts, // Use the calculated counts
                backgroundColor: [
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 206, 86, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-8">
            <h2 className="text-4xl text-center text-gray-800 mb-12 font-extrabold tracking-tight">
                Admin Dashboard
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-xl p-6 transition duration-300 ease-in-out transform hover:scale-105">
                    <h3 className="text-2xl mb-4 font-bold text-gray-700">Student Enrollment by Semester</h3>
                    <Bar data={studentData} options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Student Distribution'
                            }
                        }
                    }} />
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 transition duration-300 ease-in-out transform hover:scale-105">
                    <h3 className="text-2xl mb-4 font-bold text-gray-700">Teacher Distribution by Subject</h3>
                    <Bar data={teacherData} options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Teacher Distribution'
                            }
                        }
                    }} />
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 transition duration-300 ease-in-out transform hover:scale-105">
                    <h3 className="text-2xl mb-4 font-bold text-gray-700">Classroom Capacity</h3>
                    <Bar data={classroomData} options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Classroom Capacities'
                            }
                        }
                    }} />
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 transition duration-300 ease-in-out transform hover:scale-105">
                    <h3 className="text-2xl mb-4 font-bold text-gray-700">Subjects Offered</h3>
                    <Pie data={subjectDistributionData} options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'right',
                            },
                            title: {
                                display: true,
                                text: 'Subject Distribution'
                            }
                        }
                    }} />
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 transition duration-300 ease-in-out transform hover:scale-105">
                    <h3 className="text-2xl mb-4 font-bold text-gray-700">Electives Chosen</h3>
                    <Pie data={electiveDistributionData} options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'right',
                            },
                            title: {
                                display: true,
                                text: 'Elective Distribution'
                            }
                        }
                    }} />
                </div>
            </div>
        </div>
    );
}