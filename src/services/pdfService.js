// src/services/pdfService.js

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const generateNutritionReport = (
  user,
  anthroData,
  logs
) => {
  const doc = new jsPDF();
  const primaryColor = [22, 163, 74]; // Green-600

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('ABCDE Smart Diet App', 15, 20);
  doc.setFontSize(12);
  doc.text('Nutritional Assessment Report - Premium Tier', 15, 30);

  // User Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Patient/User Profile', 15, 50);
  doc.setFontSize(10);
  doc.text(`Name: ${user.name}`, 15, 60);
  doc.text(`Date of Report: ${new Date().toLocaleDateString()}`, 15, 65);
  
  if (anthroData) {
    const bmi = anthroData.weightKg / ((anthroData.heightCm / 100) ** 2);
    doc.text(`Height: ${anthroData.heightCm} cm`, 15, 75);
    doc.text(`Weight: ${anthroData.weightKg} kg`, 15, 80);
    doc.text(`BMI: ${bmi.toFixed(1)}`, 15, 85);
    doc.text(`Age: ${anthroData.age} | Sex: ${anthroData.sex}`, 15, 90);
  } else {
    doc.text('Anthropometric data not available. Please complete your profile.', 15, 75);
  }

  // Dietary Analysis
  doc.setFontSize(14);
  doc.text('Dietary Intake Analysis (90-Day View)', 15, 105);
  
  // Calculate Totals and Averages
  const totalCalories = logs.reduce((s, l) => s + l.nutrients.calories, 0);
  const avgCalories = logs.length > 0 ? totalCalories / logs.length : 0;
  
  const nutrientAverages = {
    protein: logs.reduce((s, l) => s + (l.nutrients.protein || 0), 0) / (logs.length || 1),
    carbs: logs.reduce((s, l) => s + (l.nutrients.carbs || 0), 0) / (logs.length || 1),
    fat: logs.reduce((s, l) => s + (l.nutrients.fat || 0), 0) / (logs.length || 1),
    fiber: logs.reduce((s, l) => s + (l.nutrients.fiber || 0), 0) / (logs.length || 1),
  };

  // Summary Table
  autoTable(doc, {
    startY: 115,
    head: [['Metric', 'Average Value (Per Log)', 'Status']],
    body: [
      ['Calories', `${avgCalories.toFixed(0)} kcal`, 'Analyzed'],
      ['Protein', `${nutrientAverages.protein.toFixed(1)} g`, 'Analyzed'],
      ['Carbohydrates', `${nutrientAverages.carbs.toFixed(1)} g`, 'Analyzed'],
      ['Total Fat', `${nutrientAverages.fat.toFixed(1)} g`, 'Analyzed'],
      ['Fiber', `${nutrientAverages.fiber.toFixed(1)} g`, 'Analyzed'],
    ],
    headStyles: { fillColor: primaryColor },
  });

  // Recent Logs Table
  doc.setFontSize(12);
  const tableY = doc.lastAutoTable.finalY + 15;
  doc.text('Detailed Food History (Most Recent Logs)', 15, tableY);

  const tableRows = logs.slice(-10).reverse().map(log => [
    new Date(log.date).toLocaleDateString(),
    log.foodName,
    log.portionName,
    log.grams + 'g',
    log.nutrients.calories.toFixed(0) + ' kcal'
  ]);

  autoTable(doc, {
    startY: tableY + 5,
    head: [['Date', 'Food Item', 'Portion', 'Weight', 'Calories']],
    body: tableRows,
    headStyles: { fillColor: primaryColor },
  });

  // Footer Disclaimer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Disclaimer: This report is generated based on user-logged dietary data. It is for information only and does not constitute a clinical diagnosis.', 15, pageHeight - 15);
  doc.text('Consult a licensed nutritionist in Kenya for professional dietary advice.', 15, pageHeight - 10);

  doc.save(`ABCDE_Nutrition_Report_${user.name.replace(/\s/g, '_')}.pdf`);
};

export { generateNutritionReport };