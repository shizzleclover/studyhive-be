const mongoose = require('mongoose');
const config = require('../config');

// Import models
const Course = require('../modules/course/course.model');
const CommunityNote = require('../modules/community-note/communityNote.model');
const PastQuestion = require('../modules/past-question/pastQuestion.model');
const OfficialNote = require('../modules/official-note/officialNote.model');
const Quiz = require('../modules/quiz/quiz.model');
const User = require('../modules/user/user.model');

/**
 * Add text indexes to models for better search performance
 */
async function addSearchIndexes() {
  try {
    console.log('🔍 Adding search indexes to database...\n');

    // Connect to database
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Connected to MongoDB\n');

    // Add text index to Course model
    console.log('Adding text index to Course collection...');
    await Course.collection.createIndex({
      title: 'text',
      code: 'text',
      description: 'text',
      department: 'text',
    }, {
      weights: {
        code: 10,
        title: 5,
        department: 3,
        description: 1,
      },
      name: 'course_text_search',
    });
    console.log('✅ Course text index created\n');

    // Add text index to CommunityNote model
    console.log('Adding text index to CommunityNote collection...');
    await CommunityNote.collection.createIndex({
      title: 'text',
      content: 'text',
    }, {
      weights: {
        title: 5,
        content: 1,
      },
      name: 'note_text_search',
    });
    console.log('✅ CommunityNote text index created\n');

    // Add text index to PastQuestion model
    console.log('Adding text index to PastQuestion collection...');
    await PastQuestion.collection.createIndex({
      title: 'text',
      description: 'text',
    }, {
      weights: {
        title: 3,
        description: 1,
      },
      name: 'pastquestion_text_search',
    });
    console.log('✅ PastQuestion text index created\n');

    // Add text index to OfficialNote model
    console.log('Adding text index to OfficialNote collection...');
    await OfficialNote.collection.createIndex({
      title: 'text',
      description: 'text',
      category: 'text',
    }, {
      weights: {
        title: 3,
        category: 2,
        description: 1,
      },
      name: 'officialnote_text_search',
    });
    console.log('✅ OfficialNote text index created\n');

    // Add text index to Quiz model
    console.log('Adding text index to Quiz collection...');
    await Quiz.collection.createIndex({
      title: 'text',
      description: 'text',
    }, {
      weights: {
        title: 3,
        description: 1,
      },
      name: 'quiz_text_search',
    });
    console.log('✅ Quiz text index created\n');

    // Add text index to User model
    console.log('Adding text index to User collection...');
    await User.collection.createIndex({
      name: 'text',
      email: 'text',
    }, {
      weights: {
        name: 2,
        email: 1,
      },
      name: 'user_text_search',
    });
    console.log('✅ User text index created\n');

    console.log('🎉 All search indexes added successfully!');
    console.log('\n📊 Index Summary:');
    console.log('  - Course: title, code, description, department');
    console.log('  - CommunityNote: title, content');
    console.log('  - PastQuestion: title, description');
    console.log('  - OfficialNote: title, description, category');
    console.log('  - Quiz: title, description');
    console.log('  - User: name, email');
    console.log('\n✨ Search performance optimized!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding search indexes:', error);
    process.exit(1);
  }
}

// Run the script
addSearchIndexes();

