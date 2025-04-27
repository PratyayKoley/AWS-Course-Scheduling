const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const Classroom = require('../models/Classroom');
const Timetable = require('../models/TimeTable');

exports.generateTimeTable = async (req, res) => {
  try {
    const subjects = await Subject.find();
    const teachers = await Teacher.find();
    const classrooms = await Classroom.find();

    // Clear existing timetable entries
    await Timetable.deleteMany({});

    const timetable = {};
    for (let semester = 1; semester <= 6; semester++) {
      timetable[semester] = await createSemesterTimetable(subjects, teachers, classrooms, semester);
    }

    res.json(timetable);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate timetable' });
  }
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function createSemesterTimetable(subjects, teachers, classrooms, semester) {
  const slots = Array.from({ length: 5 }, () => Array(6).fill(null));
  let semesterSubjects = subjects.filter(subject => subject.semester === semester);

  // Shuffle subjects to randomize order for each timetable generation
  semesterSubjects = shuffleArray(semesterSubjects);

  const teacherAssignments = new Map();
  const classroomAssignments = new Map();

  for (const subject of semesterSubjects) {
    let assignedSlots = 0;
    let maxAttempts = 30;

    while (assignedSlots < subject.classesPerWeek && maxAttempts > 0) {
      const [day, slot] = findAvailableSlot(slots, teachers, classrooms, subject, teacherAssignments, classroomAssignments);
      
      if (day !== -1 && slot !== -1) {
        const assignedTeacher = assignTeacher(teachers, subject, teacherAssignments, day, slot);
        const assignedClassroom = assignClassroom(classrooms, subject, classroomAssignments, day, slot);

        if (assignedTeacher && assignedClassroom) {
          slots[day][slot] = {
            subjectCode: subject.code,
            subjectName: subject.name,
            teacher: assignedTeacher.name,
            classroom: assignedClassroom.roomNumber
          };

          updateAssignmentTrackers(teacherAssignments, classroomAssignments, day, slot, assignedTeacher, assignedClassroom);

          await Timetable.create({
            branch: subject.branch,
            semester: semester,
            day: getDayName(day),
            timeSlot: slot + 1,
            subject: subject.code,
            subjectName: subject.name,
            teacher: assignedTeacher.name,
            classroom: assignedClassroom.roomNumber,
            isElective: subject.isElective || false,
            electiveGroup: subject.electiveGroup || null
          });

          assignedSlots++;
        }
      }
      maxAttempts--;
    }
  }

  return slots;
}

function findAvailableSlot(slots, teachers, classrooms, subject, teacherAssignments, classroomAssignments) {
  // Shuffle days and slots for more randomness
  const days = shuffleArray([0, 1, 2, 3, 4]);
  const timeSlots = shuffleArray([0, 1, 2, 3, 4, 5]);

  for (const day of days) {
    for (const slot of timeSlots) {
      if (isSlotAvailable(slots, day, slot, subject, teachers, classrooms, teacherAssignments, classroomAssignments)) {
        return [day, slot];
      }
    }
  }
  return [-1, -1];
}

function isSlotAvailable(slots, day, slot, subject, teachers, classrooms, teacherAssignments, classroomAssignments) {
  // Check if slot is already occupied
  if (slots[day][slot] !== null) return false;

  // Check if any suitable teacher is available in this slot
  const availableTeacher = findAvailableTeacher(teachers, subject, day, slot, teacherAssignments);
  if (!availableTeacher) return false;

  // Check if any suitable classroom is available in this slot
  const availableClassroom = findAvailableClassroom(classrooms, subject, day, slot, classroomAssignments);
  if (!availableClassroom) return false;

  return true;
}

function findAvailableTeacher(teachers, subject, day, slot, teacherAssignments) {
  return teachers.find(teacher => {
    if (!teacher.teaching_subjects.includes(subject.name)) return false;

    const teacherKey = teacher._id.toString();
    const teacherSlots = teacherAssignments.get(teacherKey) || [];
    return !teacherSlots.some(assignment => assignment.day === day && assignment.slot === slot);
  });
}

function findAvailableClassroom(classrooms, subject, day, slot, classroomAssignments) {
  return classrooms.find(classroom => {
    if (subject.requiresLab && !classroom.isLab) return false;
    if (classroom.capacity < subject.expectedCapacity) return false;

    const classroomKey = classroom._id.toString();
    const classroomSlots = classroomAssignments.get(classroomKey) || [];
    return !classroomSlots.some(assignment => assignment.day === day && assignment.slot === slot);
  });
}

function assignTeacher(teachers, subject, teacherAssignments, day, slot) {
  const availableTeacher = findAvailableTeacher(teachers, subject, day, slot, teacherAssignments);
  return availableTeacher ? { name: availableTeacher.name, _id: availableTeacher._id } : null;
}

function assignClassroom(classrooms, subject, classroomAssignments, day, slot) {
  const availableClassroom = findAvailableClassroom(classrooms, subject, day, slot, classroomAssignments);
  return availableClassroom ? { roomNumber: availableClassroom.roomNumber, _id: availableClassroom._id } : null;
}

function updateAssignmentTrackers(teacherAssignments, classroomAssignments, day, slot, teacherId, classroomId) {
  // Update teacher assignments
  const teacherKey = teacherId.toString();
  if (!teacherAssignments.has(teacherKey)) {
    teacherAssignments.set(teacherKey, []);
  }
  teacherAssignments.get(teacherKey).push({ day, slot });

  // Update classroom assignments
  const classroomKey = classroomId.toString();
  if (!classroomAssignments.has(classroomKey)) {
    classroomAssignments.set(classroomKey, []);
  }
  classroomAssignments.get(classroomKey).push({ day, slot });
}

function getDayName(dayIndex) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  return days[dayIndex];
}