import { navigate } from '../router.jsx';
import StudentHome from './StudentHome.jsx';

// Teacher-only: shows one student's pages without needing their PIN.
export default function StudentPreview({ student, rest }) {
  return (
    <StudentHome
      student={student}
      base={`/admin/preview/${student.rollNumber}`}
      rest={rest}
      preview
      exitLabel="Back to desk"
      onExit={() => navigate(`/admin/student/${student.rollNumber}`)}
    />
  );
}
