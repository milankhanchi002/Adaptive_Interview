class DifficultyService {
  calculateNextDifficulty(currentScores, currentDifficulty) {
    if (currentScores.length === 0) return 'Medium';

    const recentScores = currentScores.slice(-3); // Last 3 answers
    const averageScore = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;

    // Difficulty adjustment logic
    if (averageScore >= 8) {
      // Move to harder difficulty
      if (currentDifficulty === 'Easy') return 'Medium';
      if (currentDifficulty === 'Medium') return 'Hard';
      return 'Hard'; // Stay at Hard if already there
    } else if (averageScore <= 3) {
      // Move to easier difficulty
      if (currentDifficulty === 'Hard') return 'Medium';
      if (currentDifficulty === 'Medium') return 'Easy';
      return 'Easy'; // Stay at Easy if already there
    } else {
      // Maintain current difficulty for average performance
      return currentDifficulty;
    }
  }

  shouldEndInterview(questionCount, totalScore) {
    // End after 8-10 questions or if performance is consistently poor
    if (questionCount >= 10) return true;
    
    if (questionCount >= 8 && totalScore / questionCount <= 2) {
      return true; // End early if performance is very poor
    }
    
    return false;
  }

  getDifficultyColor(difficulty) {
    const colors = {
      'Easy': '#10b981', // green
      'Medium': '#f59e0b', // amber
      'Hard': '#ef4444' // red
    };
    return colors[difficulty] || '#6b7280';
  }

  getDifficultyProgress(difficulty) {
    const progress = {
      'Easy': 33,
      'Medium': 66,
      'Hard': 100
    };
    return progress[difficulty] || 0;
  }
}

module.exports = new DifficultyService();
