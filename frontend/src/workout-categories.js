export const WORKOUT_CATEGORIES = [
  'Running', 'Walking', 'Cycling', 'Strength', 'Yoga', 'HIIT', 'Swimming',
  'Circuit training', 'Hiking', 'Weight machines', 'Bike indoor', 'Treadmill',
  'Elliptical trainer', 'Dance', 'Core', 'Stretch',
];

export const workoutCategoryValue = category => category.toLowerCase().replaceAll(' ', '_');
