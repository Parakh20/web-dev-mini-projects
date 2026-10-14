const BMI_DATA = {
  categories: [
    {
      category: "Underweight",
      range: "< 18.5",
      color: "#3498db",
      description: "A BMI below 18.5 indicates that you may be underweight. Consider consulting with a healthcare provider about healthy weight gain strategies.",
      recommendations: ["Increase caloric intake with nutrient-dense foods", "Consider strength training exercises", "Consult with a healthcare professional"]
    },
    {
      category: "Normal weight", 
      range: "18.5 - 24.9",
      color: "#27ae60",
      description: "A BMI between 18.5 and 24.9 indicates that you are at a healthy weight for your height. Maintain your current lifestyle.",
      recommendations: ["Continue balanced diet and regular exercise", "Maintain current healthy habits", "Regular health check-ups"]
    },
    {
      category: "Overweight",
      range: "25.0 - 29.9", 
      color: "#f39c12",
      description: "A BMI between 25 and 29.9 indicates that you may be overweight. Consider adopting healthier eating habits and increasing physical activity.",
      recommendations: ["Focus on portion control", "Increase physical activity", "Choose nutrient-dense, lower-calorie foods"]
    },
    {
      category: "Obese",
      range: "≥ 30.0",
      color: "#e74c3c", 
      description: "A BMI of 30 or higher indicates obesity. Consider consulting with a healthcare provider about weight management strategies.",
      recommendations: ["Consult with healthcare professional", "Consider structured weight loss program", "Focus on sustainable lifestyle changes"]
    }
  ],
  validation: {
    height_metric: {min: 50, max: 300, unit: "cm"},
    weight_metric: {min: 10, max: 500, unit: "kg"},
    height_imperial: {min: 20, max: 120, unit: "inches"}, 
    weight_imperial: {min: 22, max: 1100, unit: "lbs"}
  }
};

export default BMI_DATA;