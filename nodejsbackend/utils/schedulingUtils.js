const classrooms = [
    '101', '102', '103', '104', '105',
    '201', '202', '203', '204', '205',
    '301', '302', '303', '304', '305',
    '401', '402', '403', '404', '405',
];

// Constants for configuration
const MAX_TEACHER_WORKLOAD = 8; // Maximum 8 lectures per week
const MAX_SUBJECT_LECTURES_PER_DAY = 1;
const MAX_CONSECUTIVE_LECTURES = 3; // Maximum consecutive lectures for a teacher

exports.getWorkingDays = (year, month) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const workingDays = [];

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();

        // Skip weekends
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            workingDays.push({
                date: date,
                dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
                weekNumber: Math.ceil(day / 7)
            });
        }
    }
    return workingDays;
};

exports.initializeSchedulingData = (teachers, subjects, workingDays) => {
    // Initialize Maps for tracking
    const teacherWorkload = new Map();
    const subjectWorkload = new Map();
    const dailySubjectCount = new Map();
    const teacherAvailability = new Map();
    const classroomAvailability = new Map();
    const semesterAvailability = new Map();

    // Initialize semester availability for all semesters (1-6)
    for (let semester = 1; semester <= 6; semester++) {
        const semesterSlots = new Map();
        workingDays.forEach(day => {
            semesterSlots.set(day.date.toISOString(), new Set());
        });
        semesterAvailability.set(semester.toString(), semesterSlots);
    }

    // Initialize teacher data
    teachers.forEach(teacher => {
        teacherWorkload.set(teacher.name, 0);
        const teacherSlots = new Map();
        workingDays.forEach(day => {
            teacherSlots.set(day.date.toISOString(), new Set());
        });
        teacherAvailability.set(teacher.name, teacherSlots);
    });

    // Initialize subject data for tracking daily occurrence
    subjects.forEach(subject => {
        if (!subject) return;
        
        subjectWorkload.set(subject, 0);
        const subjectSlots = new Map();
        workingDays.forEach(day => {
            subjectSlots.set(day.date.toISOString(), 0);
        });
        dailySubjectCount.set(subject, subjectSlots);
    });

    // Initialize classroom data
    classrooms.forEach(classroom => {
        const roomSlots = new Map();
        workingDays.forEach(day => {
            roomSlots.set(day.date.toISOString(), new Set());
        });
        classroomAvailability.set(classroom, roomSlots);
    });

    return {
        teacherWorkload,
        subjectWorkload,
        dailySubjectCount,
        teacherAvailability,
        classroomAvailability,
        semesterAvailability
    };
};

exports.isSlotAvailable = (semester, date, timeSlot, subject, schedulingData) => {
    try {
        const { 
            semesterAvailability, 
            dailySubjectCount,
            teacherAvailability,
            classroomAvailability 
        } = schedulingData;

        // Check semester slot availability
        const semesterSlots = semesterAvailability.get(semester.toString())?.get(date);
        if (!semesterSlots || semesterSlots.has(timeSlot)) {
            return false;
        }

        // Check subject daily limit
        const subjectCount = dailySubjectCount.get(subject)?.get(date) || 0;
        if (subjectCount >= MAX_SUBJECT_LECTURES_PER_DAY) {
            return false;
        }

        // Check if any classroom is available
        const hasAvailableClassroom = classrooms.some(room => {
            const roomSlots = classroomAvailability.get(room)?.get(date);
            return roomSlots && !roomSlots.has(timeSlot);
        });
        if (!hasAvailableClassroom) {
            return false;
        }

        // Check consecutive lectures constraint
        if (hasConsecutiveLectures(date, timeSlot, schedulingData)) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in isSlotAvailable:', error);
        return false;
    }
};

const hasConsecutiveLectures = (date, timeSlot, schedulingData) => {
    const timeSlots = [
        '09:00-10:00', '10:00-11:00', '11:00-12:00',
        '13:00-14:00', '14:00-15:00', '15:00-16:00'
    ];
    
    const currentIndex = timeSlots.indexOf(timeSlot);
    if (currentIndex === -1) return false;

    // Check previous consecutive slots
    let consecutiveCount = 1;
    for (let i = currentIndex - 1; i >= 0 && i >= currentIndex - MAX_CONSECUTIVE_LECTURES; i--) {
        if (schedulingData.semesterAvailability.get(date)?.has(timeSlots[i])) {
            consecutiveCount++;
        } else {
            break;
        }
    }

    // Check next consecutive slots
    for (let i = currentIndex + 1; i < timeSlots.length && i <= currentIndex + MAX_CONSECUTIVE_LECTURES; i++) {
        if (schedulingData.semesterAvailability.get(date)?.has(timeSlots[i])) {
            consecutiveCount++;
        } else {
            break;
        }
    }

    return consecutiveCount > MAX_CONSECUTIVE_LECTURES;
};

exports.markSlotAsOccupied = (semester, date, timeSlot, teacher, classroom, subject, schedulingData) => {
    try {
        const {
            semesterAvailability,
            teacherAvailability,
            classroomAvailability,
            dailySubjectCount,
            teacherWorkload
        } = schedulingData;

        // Update semester availability
        const semesterSlots = semesterAvailability.get(semester.toString())?.get(date);
        if (semesterSlots) {
            semesterSlots.add(timeSlot);
        }

        // Update teacher availability and workload
        const teacherSlots = teacherAvailability.get(teacher)?.get(date);
        if (teacherSlots) {
            teacherSlots.add(timeSlot);
            teacherWorkload.set(teacher, (teacherWorkload.get(teacher) || 0) + 1);
        }

        // Update classroom availability
        const classroomSlots = classroomAvailability.get(classroom)?.get(date);
        if (classroomSlots) {
            classroomSlots.add(timeSlot);
        }

        // Update daily subject count
        const subjectCountMap = dailySubjectCount.get(subject);
        if (subjectCountMap) {
            const currentCount = subjectCountMap.get(date) || 0;
            subjectCountMap.set(date, currentCount + 1);
        }
    } catch (error) {
        console.error('Error in markSlotAsOccupied:', error);
        throw error;
    }
};

exports.getAvailableTeacher = async (subject, date, timeSlot, teachers, schedulingData) => {
    try {
        const { teacherAvailability, teacherWorkload } = schedulingData;

        const eligibleTeachers = teachers.filter(teacher => {
            // Check if teacher teaches this subject
            if (!teacher.teaching_subjects.includes(subject)) {
                return false;
            }
            
            // Check teacher availability for this slot
            const teacherSlots = teacherAvailability.get(teacher.name)?.get(date);
            if (!teacherSlots || teacherSlots.has(timeSlot)) {
                return false;
            }
            
            // Check weekly workload
            const currentWorkload = teacherWorkload.get(teacher.name) || 0;
            if (currentWorkload >= MAX_TEACHER_WORKLOAD) {
                return false;
            }

            // Check consecutive lectures
            if (hasConsecutiveLectures(date, timeSlot, {
                ...schedulingData,
                semesterAvailability: teacherAvailability.get(teacher.name)
            })) {
                return false;
            }

            return true;
        });

        // Return teacher with lowest current workload
        return eligibleTeachers.sort((a, b) => 
            (teacherWorkload.get(a.name) || 0) - (teacherWorkload.get(b.name) || 0)
        )[0];
    } catch (error) {
        console.error('Error in getAvailableTeacher:', error);
        return null;
    }
};

exports.getAvailableClassroom = (date, timeSlot, schedulingData) => {
    try {
        const { classroomAvailability } = schedulingData;

        return classrooms.find(room => {
            const roomSlots = classroomAvailability.get(room)?.get(date);
            return roomSlots && !roomSlots.has(timeSlot);
        });
    } catch (error) {
        console.error('Error in getAvailableClassroom:', error);
        return null;
    }
};

// Export constants
exports.MAX_TEACHER_WORKLOAD = MAX_TEACHER_WORKLOAD;
exports.MAX_SUBJECT_LECTURES_PER_DAY = MAX_SUBJECT_LECTURES_PER_DAY;
exports.MAX_CONSECUTIVE_LECTURES = MAX_CONSECUTIVE_LECTURES;