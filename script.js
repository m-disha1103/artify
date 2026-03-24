const canvas = new fabric.Canvas('canvas');

// Add Text
document.querySelectorAll("button")[0].onclick = () => {
  const text = new fabric.Textbox("Edit me", {
    left: 100,
    top: 100,
    fill: "black",
    fontSize: 24
  });
  canvas.add(text);
};

// Add Rectangle
document.querySelectorAll("button")[1].onclick = () => {
  const rect = new fabric.Rect({
    left: 150,
    top: 150,
    fill: "blue",
    width: 100,
    height: 100
  });
  canvas.add(rect);
};

// Clear Canvas
document.querySelectorAll("button")[2].onclick = () => {
  canvas.clear();
};