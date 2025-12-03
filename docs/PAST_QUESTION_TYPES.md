# Past Question Types Feature

## ✅ Overview

The past questions system now supports **7 different types** of academic materials, allowing users to categorize their uploads more precisely.

---

## 📋 Available Types

Users can now select from the following past question types:

1. **📝 Past Exam** (`past-exam`)
   - Final examinations
   - End-of-semester tests

2. **📋 Past Mid Semester** (`past-mid-semester`)
   - Mid-semester examinations
   - Mid-term tests

3. **📊 Past Quiz** (`past-quiz`)
   - Quiz papers
   - Short assessments

4. **📄 Past Assignment** (`past-assignment`)
   - Individual assignments
   - Homework submissions

5. **✏️ Past Class Work** (`past-class-work`)
   - In-class exercises
   - Class activities

6. **👥 Past Group Project** (`past-group-project`)
   - Group project submissions
   - Collaborative work

7. **💼 Past Project** (`past-project`)
   - Individual projects
   - Capstone projects

---

## 🔧 Implementation Details

### Database Schema

```javascript
{
  type: {
    type: String,
    enum: [
      'past-exam',
      'past-mid-semester',
      'past-quiz',
      'past-assignment',
      'past-class-work',
      'past-group-project',
      'past-project'
    ],
    required: true,
    index: true
  }
}
```

### API Endpoints

#### Create Past Question
```http
POST /api/past-questions
Body: {
  course: "course_id",
  year: 2024,
  semester: "First",
  type: "past-exam",  // ← NEW REQUIRED FIELD
  title: "Final Exam 2024",
  description: "...",
  fileKey: "...",
  fileUrl: "...",
  fileName: "...",
  fileSize: 12345,
  fileType: "application/pdf"
}
```

#### Filter by Type
```http
GET /api/past-questions?type=past-exam
GET /api/past-questions?course=course_id&type=past-quiz
GET /api/past-questions/course/:courseId?type=past-assignment
```

---

## 🎨 User Interface

### Upload Form

The test UI now includes:
- **Type Dropdown** - Select from 7 types
- **Year Input** - Enter academic year
- **Semester Select** - First or Second semester

Fields are shown/hidden based on resource type selection.

### Display

Past questions now display:
- ✅ Type with emoji icon
- ✅ Year and semester
- ✅ Course information
- ✅ Download count

Example:
```
📝 Past Exam
Year: 2024 | Semester: First
Course: CS101
Downloads: 45
```

---

## 🔍 Filtering & Search

### Filter by Type
```javascript
// Get all past exams
GET /api/past-questions?type=past-exam

// Get all quizzes for a course
GET /api/past-questions/course/:courseId?type=past-quiz

// Combine filters
GET /api/past-questions?course=course_id&type=past-assignment&year=2024
```

### Database Indexes

Optimized queries with compound indexes:
- `{ course: 1, type: 1 }` - Fast course + type filtering
- `{ type: 1 }` - Fast type-only filtering

---

## 📊 Validation

### Required Fields
- ✅ `type` - Must be one of the 7 valid types
- ✅ `course` - Course ID
- ✅ `year` - Between 2000 and current year
- ✅ `semester` - "First" or "Second"
- ✅ `title` - Resource title

### Validation Rules
```javascript
type: Joi.string()
  .valid(
    'past-exam',
    'past-mid-semester',
    'past-quiz',
    'past-assignment',
    'past-class-work',
    'past-group-project',
    'past-project'
  )
  .required()
```

---

## 🚀 Usage Examples

### Create Past Exam
```javascript
POST /api/past-questions
{
  "course": "507f1f77bcf86cd799439011",
  "year": 2024,
  "semester": "First",
  "type": "past-exam",
  "title": "CS101 Final Exam 2024",
  "fileKey": "...",
  "fileUrl": "...",
  "fileName": "cs101-final-2024.pdf",
  "fileSize": 1024000,
  "fileType": "application/pdf"
}
```

### Get All Quizzes
```javascript
GET /api/past-questions?type=past-quiz&page=1&limit=20
```

### Get Assignments for Course
```javascript
GET /api/past-questions/course/507f1f77bcf86cd799439011?type=past-assignment
```

---

## 📝 Swagger Documentation

All endpoints are fully documented in Swagger:

- **Create** - Shows `type` as required field with enum values
- **List** - Includes `type` as query parameter
- **Filter** - Type filtering examples

Visit: `http://localhost:5000/api-docs`

---

## ✅ Benefits

1. **Better Organization** - Categorize materials by type
2. **Improved Search** - Filter by specific material types
3. **User Experience** - Clear categorization for students
4. **Analytics** - Track which types are most popular
5. **Flexibility** - Support various academic materials

---

## 🔄 Migration Notes

### Existing Data
- Old past questions without `type` will need to be updated
- Default type can be set during migration: `past-exam`

### Backward Compatibility
- Type field is **required** for new uploads
- Existing queries work with type filter (optional)

---

## 🧪 Testing

### Test UI
1. Go to `http://localhost:5000`
2. Navigate to **Resources** tab
3. Select "Past Question" as resource type
4. Fill in Type, Year, Semester
5. Upload file
6. View with type displayed

### API Testing
```bash
# Create past exam
curl -X POST http://localhost:5000/api/past-questions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course": "COURSE_ID",
    "year": 2024,
    "semester": "First",
    "type": "past-exam",
    "title": "Test Exam",
    ...
  }'

# Filter by type
curl "http://localhost:5000/api/past-questions?type=past-exam"
```

---

## 📚 Constants

All types are defined in `src/shared/utils/constants.js`:

```javascript
const PAST_QUESTION_TYPES = {
  EXAM: 'past-exam',
  MID_SEMESTER: 'past-mid-semester',
  QUIZ: 'past-quiz',
  ASSIGNMENT: 'past-assignment',
  CLASS_WORK: 'past-class-work',
  GROUP_PROJECT: 'past-group-project',
  PROJECT: 'past-project',
};
```

---

**Last Updated**: December 2024

