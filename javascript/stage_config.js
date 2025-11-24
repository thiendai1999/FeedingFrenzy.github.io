window.GAME_STAGES = {
  chapters: [
    {
      id: 1,
      name: "Angel Reef",
      icon: "images/map/angel_reef.png",
      unlockedByDefault: true,

      stages: [
        {
          id: 1,
          mode: "normal",
          background: "images/backgrounds/reef.png",
          targetScore: 180,
          spawn: { small: 0.70, medium: 0.20, large: 0.08, shark: 0.02 },
          speed: { min: 40, max: 90 },
          quizCount: 6
        },
        {
          id: 2,
          mode: "normal",
          targetScore: 200,
          spawn: { small: 0.55, medium: 0.30, large: 0.12, shark: 0.03 },
          speed: { min: 50, max: 100 },
          quizCount: 6
        },
        {
          id: 3,
          mode: "hunting",
          timeLimit: 90,
          spawn: { small: 0.70, medium: 0.20, large: 0.10, shark: 0.00 },
          speed: { min: 50, max: 120 },
          targetScore: 100,
          quizCount: 0
        },
        {
          id: 4,
          mode: "normal",
          targetScore: 210,
          spawn: { small: 0.50, medium: 0.35, large: 0.12, shark: 0.03 },
          speed: { min: 60, max: 120 },
          quizCount: 7
        },
        {
          id: 5,
          mode: "super",
          timeLimit: 75,
          targetScore: 250,
          spawn: { small: 0.40, medium: 0.35, large: 0.20, shark: 0.05 },
          speed: { min: 70, max: 150 },
          quizCount: 8
        }
      ]
    }
  ]
};
