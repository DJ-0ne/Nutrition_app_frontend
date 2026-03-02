import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateIDDSPDF = (
  selectedDate,
  iddsScores,
  iddsGroups,
  userName,
  meals,
) => {
  const doc = new jsPDF();
  let y = 22;

  // Title
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text("Individual Dietary Diversity Score (IDDS) Report", 14, y);
  y += 10;

  // User info and date
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text(`User: ${userName || "N/A"}`, 14, y);
  y += 6;
  const formattedDate = new Date(selectedDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Date: ${formattedDate}`, 14, y);
  y += 8;

  // ---- Meals Logged section ----
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text("Meals Logged", 14, y);
  y += 6;

  const mealData = meals || {};
  const mealTypeLabels = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snacks: "Snacks",
  };

  if (Object.keys(mealData).length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("No meals logged for this day.", 14, y);
    y += 8;
  } else {
    // Sort meals in a logical order (breakfast, lunch, dinner, snacks)
    const mealOrder = ["breakfast", "lunch", "dinner", "snacks"];
    const sortedMeals = mealOrder.filter((m) => mealData[m]?.length > 0);

    sortedMeals.forEach((mealType, index) => {
      const items = mealData[mealType];
      if (!items || items.length === 0) return;

      // Meal category header with background
      doc.setFillColor(255, 237, 213); // amber-100
      doc.rect(14, y - 4, 180, 8, "F");
      doc.setFontSize(12);
      doc.setTextColor(146, 64, 14); // amber-800
      doc.text(mealTypeLabels[mealType] || mealType, 18, y);
      y += 8;

      // List each food item
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      items.forEach((item) => {
        const status = item.finished ? "(Finished)" : "(Not finished)";
        // Bullet point
        doc.text("•", 20, y - 2);
        doc.text(`${item.food} ${status}`, 26, y - 2);
        y += 5;
      });

      // Add a small separator between meal categories (except last)
      if (index < sortedMeals.length - 1) {
        doc.setDrawColor(245, 158, 11); // amber-600
        doc.setLineWidth(0.5);
        doc.line(14, y, 190, y);
        y += 4;
      }
    });
  }

  y += 5; // extra space before table
  // Total IDDS score
  const score = Object.values(iddsScores).filter(Boolean).length;
  doc.setFontSize(14);
  doc.setTextColor(245, 158, 11); // amber-600
  doc.text(`Total IDDS Score: ${score}/13`, 14, y);
  y += 10;

  // ---- IDDS table ----
  const tableData = iddsGroups.map((g) => [
    g.name,
    iddsScores[g.id] ? "YES" : "NO",
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Food Group", "Consumed"]],
    body: tableData,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [245, 158, 11] }, // amber-600
    margin: { left: 14, right: 14 },
  });

  doc.save(`${userName || "User"}'s IDDS Report ${selectedDate}.pdf`);
};
