// Constants for musical intervals, notes, and semitones
const circleOfFifths = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F']; // Ascending fifths order
const intervals = ['R', 'P5', 'M2', 'M6', 'M3', 'M7', 'P4', 'm2', 'm6', 'm3', 'm7', 'A4']; // Intervals in ascending fifths
const semitones = [0, 7, 2, 9, 4, 11, 5, 1, 8, 3, 10, 6]; // Semitones in ascending fifths

// Canvas setup
const canvas = document.getElementById('fretwheel-canvas');
if (!canvas) {
  console.error('Canvas element not found!');
  throw new Error('Canvas element is required for the app to function.');
}
const ctx = canvas.getContext('2d');
scaleCanvas(canvas);

function scaleCanvas(canvas) {
  const devicePixelRatio = window.devicePixelRatio || 1;
  const logicalWidth = canvas.width;
  const logicalHeight = canvas.height;

  canvas.width = logicalWidth * devicePixelRatio;
  canvas.height = logicalHeight * devicePixelRatio;

  ctx.scale(devicePixelRatio, devicePixelRatio);
}

// State variables
let rotationIndex = 0;
let displayMode = 'notes'; // Default to 'notes' mode
const radianWidthMultiplier = 1.2; // Slightly increase spacing

// Fetch styles from CSS
function fetchStyles() {
  const styles = getComputedStyle(document.documentElement);
  return {
    circleRadius: parseFloat(styles.getPropertyValue('--circle-radius')) || 20,
    circleBorderColor: styles.getPropertyValue('--circle-border-color') || '#000',
    circleBorderWidth: parseFloat(styles.getPropertyValue('--circle-border-width')) || 2,
    textFont: styles.getPropertyValue('--circle-text-font') || '14px Arial',
    textColor: styles.getPropertyValue('--circle-text-color') || '#000',
  };
}

// Function to map notes to intervals and semitones
function getNoteDetails(noteIndex) {
  const interval = intervals[noteIndex % intervals.length];
  const semitone = semitones[noteIndex % semitones.length];
  return { interval, semitone };
}

// Draw the fretwheel
function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calculate the center of the canvas
  const centerX = canvas.width / (2 * window.devicePixelRatio);
  const centerY = canvas.height / (2 * window.devicePixelRatio);

  const {
    circleRadius, circleBorderColor, circleBorderWidth, textFont, textColor
  } = fetchStyles();

  const RING_CONFIG = {
    TONIC: { radius: 300, offset: 0 },
    INNER1: { radius: 240, offset: -8 },
    INNER2: { radius: 180, offset: 5, rotationOffset: 0 },
    OUT1: { radius: 360, offset: 6 },
    BTW: { radius: 300, offset: 3, rotationOffset: Math.PI / intervals.length },
    BTWO: { radius: 360, offset: 8, rotationOffset: Math.PI / intervals.length },
    BTWI: { radius: 240, offset: 10, rotationOffset: Math.PI / intervals.length },
  };
  const rings = Object.values(RING_CONFIG);

  rings.forEach((ring) => {
    for (let i = 0; i < intervals.length; i++) {
      // Apply rotation offset for the ring
      const additionalRotation = ring.rotationOffset || 0;
      const angle = (i + rotationIndex) * (2 * Math.PI / intervals.length) - Math.PI / 2 + additionalRotation;

      const x = centerX + ring.radius * Math.cos(angle);
      const y = centerY + ring.radius * Math.sin(angle);

      // Get note details (interval and semitone)
      const fifthsIndex = (i + ring.offset + intervals.length) % intervals.length;
      const noteDetails = getNoteDetails(fifthsIndex);
      const displayText = displayMode === 'notes'
        ? circleOfFifths[fifthsIndex]
        : displayMode === 'intervals'
        ? noteDetails.interval
        : `${noteDetails.semitone}`;

      // Draw tonic circle
      ctx.beginPath();
      ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = circleBorderColor;
      ctx.lineWidth = circleBorderWidth;
      ctx.stroke();

      // Draw tonic text
      ctx.font = textFont;
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayText, x, y);
    }
  });
}

// Toggle between modes
function toggleNotesIntervals() {
  displayMode = displayMode === 'notes' ? 'intervals' : displayMode === 'intervals' ? 'semitones' : 'notes';
  drawWheel();
}

// Rotate the wheel
function rotateWheel(direction) {
  rotationIndex = (rotationIndex + (direction === 'left' ? -1 : 1) + intervals.length) % intervals.length;
  drawWheel();
}

// Event listeners
document.addEventListener('keydown', (e) => {
  if (e.key === 'n' || e.key === 'N') toggleNotesIntervals();
  if (e.key === 'ArrowLeft') rotateWheel('left');
  if (e.key === 'ArrowRight') rotateWheel('right');
});

// Initial draw
drawWheel();