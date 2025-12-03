# Community Notes & Voting Features

## ✅ All Features Are Built and Working!

### 📝 Community Notes System

**What You Can Do:**
1. **Create Notes** - Students can create study notes for any course
2. **View All Notes** - Browse all community notes with sorting (recent/popular)
3. **View My Notes** - See all notes you've created
4. **Edit Notes** - Update your own notes
5. **Delete Notes** - Remove your own notes
6. **View Note Details** - See full note with all metadata

### 👍👎 Voting System (Fully Built!)

**Features:**
- ✅ **Upvote Notes** - Show appreciation for helpful notes
- ✅ **Downvote Notes** - Flag less helpful content
- ✅ **Vote Counts** - See upvote/downvote statistics
- ✅ **Score Calculation** - Notes ranked by popularity score
- ✅ **Toggle Votes** - Click again to remove your vote
- ✅ **Vote on Comments** - Can also vote on comments

**How It Works:**
- Each note tracks `upvotes` and `downvotes`
- Score = upvotes - downvotes (calculated automatically)
- Notes sorted by score for "popular" view
- Users can only vote once per note (can change vote)

### 💬 Comments System

**Features:**
- ✅ **Add Comments** - Comment on any note
- ✅ **View Comments** - See all comments for a note
- ✅ **Edit Comments** - Update your own comments
- ✅ **Delete Comments** - Remove your own comments
- ✅ **Comment Count** - Tracked on each note

### 📊 Additional Features

- ✅ **Pinning** - Reps/Admins can pin important notes
- ✅ **Reporting** - Users can report inappropriate content
- ✅ **Sorting** - Sort by recent or popular
- ✅ **Filtering** - Filter by course, author, tags
- ✅ **Search** - Search notes by title/content

---

## 🎯 API Endpoints

### Notes
- `POST /api/community-notes` - Create note
- `GET /api/community-notes` - Get all notes
- `GET /api/community-notes/me` - Get my notes ⭐ NEW!
- `GET /api/community-notes/user/:userId` - Get user's notes
- `GET /api/community-notes/course/:courseId` - Get course notes
- `GET /api/community-notes/:id` - Get note details
- `PUT /api/community-notes/:id` - Update note
- `DELETE /api/community-notes/:id` - Delete note

### Voting
- `POST /api/votes` - Cast vote (upvote/downvote)
- `DELETE /api/votes` - Remove vote
- `GET /api/votes/user` - Get my vote on entity
- `GET /api/votes/counts` - Get vote counts

### Comments
- `POST /api/comments/note/:noteId` - Add comment
- `GET /api/comments/note/:noteId` - Get comments
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

---

## 🖥️ Test UI Features

### Notes Tab (`http://localhost:5000`)

**1. Create Note Section**
- Enter title, course ID, and content
- Click "Create Note"
- Note is automatically added to "My Notes"

**2. My Notes Section** ⭐ NEW!
- Click "Load My Notes" to see all your notes
- Each note shows:
  - Upvotes/downvotes
  - Comment count
  - Score
  - Edit/Delete buttons

**3. All Community Notes**
- View all notes from all users
- Sort by "Recent" or "Popular"
- See vote counts and scores
- Click "Use This Note" to auto-fill ID fields

**4. View Note Details**
- Enter Note ID
- See full note with all metadata
- Auto-fills vote and comment fields

**5. Voting Section**
- Enter Note ID
- Click 👍 Upvote or 👎 Downvote
- See vote statistics
- Get real-time vote counts

**6. Comments Section**
- Enter Note ID
- Add comments
- View all comments for a note

---

## 📈 How Voting Affects Notes

### Score Calculation
```
Score = (Upvotes - Downvotes) + (Comments × 0.5) + (Saves × 2)
```

### Sorting
- **Popular**: Sorted by score (highest first)
- **Recent**: Sorted by creation date (newest first)
- **Pinned**: Always shown first

### Reputation Impact
- Creating notes: +5 reputation
- Getting upvotes: +2 per upvote
- Getting downvotes: -1 per downvote
- Comments on your notes: +1 per comment

---

## 🎨 UI Enhancements

### Visual Indicators
- 👍 Green badge for upvotes
- 👎 Red badge for downvotes
- 💬 Blue badge for comments
- ⭐ Orange badge for score
- 📌 Pin icon for pinned notes

### Interactive Features
- "Use This Note" button auto-fills ID fields
- Real-time vote count updates
- Auto-refresh after actions
- Success/error messages

---

## 🚀 Quick Start

1. **Create a Note:**
   ```
   1. Go to Notes tab
   2. Enter title, course ID, content
   3. Click "Create Note"
   ```

2. **Vote on a Note:**
   ```
   1. Get a Note ID (from "All Notes" or "My Notes")
   2. Enter it in "Vote on Notes" section
   3. Click 👍 Upvote or 👎 Downvote
   4. See vote counts update
   ```

3. **View Your Notes:**
   ```
   1. Click "Load My Notes"
   2. See all your notes with stats
   3. Edit or delete as needed
   ```

4. **Comment on Notes:**
   ```
   1. Enter Note ID
   2. Type your comment
   3. Click "Add Comment"
   4. View all comments
   ```

---

## ✅ Everything is Built!

- ✅ Note creation
- ✅ Note viewing (all, my, by course, by user)
- ✅ Note editing
- ✅ Note deletion
- ✅ Upvoting
- ✅ Downvoting
- ✅ Vote counts
- ✅ Score calculation
- ✅ Comments
- ✅ Sorting (recent/popular)
- ✅ Filtering
- ✅ Search
- ✅ Pinning (Rep/Admin)
- ✅ Reporting

**All features are fully functional and ready to use!** 🎉

---

## 💡 Tips

1. **Get Course IDs**: Use the Courses tab to find course IDs
2. **Copy Note IDs**: Click "Use This Note" to auto-fill fields
3. **Track Performance**: Check "My Notes" to see your note stats
4. **Engage**: Vote and comment to help the community
5. **Sort Smart**: Use "Popular" to find the best notes

---

**Happy Note-Taking! 📚✨**

