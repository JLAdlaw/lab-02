// Scroll reveal animation
const reveals = document.querySelectorAll(".reveal");

window.addEventListener("scroll", () => {
  reveals.forEach(el => {
    const top = el.getBoundingClientRect().top;
    const trigger = window.innerHeight * 0.85;
    if (top < trigger) el.classList.add("active");
  });
});

// Theme toggle functionality
document.addEventListener("DOMContentLoaded", () => {
  // Ensure no legacy theme classes are present on load
  document.body.classList.remove("dark", "grayscale", "split-dark");

  const toggle = document.getElementById("themeToggle");
  
  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "split-dark") {
    document.body.classList.add("split-dark");
    toggle.textContent = "☀️";
  }

  toggle.addEventListener("click", () => {
    const active = document.body.classList.toggle("split-dark");
    document.body.classList.remove("grayscale", "dark");
    toggle.textContent = active ? "☀️" : "🌙";
    
    // Save theme preference
    localStorage.setItem("theme", active ? "split-dark" : "light");
  });

  // Load and display submissions on page load
  displaySubmissions();
});

// Form submission handler
const contactForm = document.getElementById("contactForm");
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get form values
  const name = document.getElementById("formName").value.trim();
  const contact = document.getElementById("formContact").value.trim();
  const email = document.getElementById("formEmail").value.trim();
  const message = document.getElementById("formMessage").value.trim();

  // Validate fields
  if (!name || !contact || !email || !message) {
    alert("Please fill in all fields!");
    return;
  }

  // Create submission object
  const submission = {
    id: Date.now(),
    name,
    contact,
    email,
    message,
    timestamp: new Date().toLocaleString()
  };

  // Get existing submissions from localStorage
  let submissions = JSON.parse(localStorage.getItem("contactSubmissions")) || [];

  // Add new submission
  submissions.push(submission);

  // Save to localStorage
  localStorage.setItem("contactSubmissions", JSON.stringify(submissions));

  // Clear form
  contactForm.reset();

  // Show success message
  alert("Message sent successfully!");

  // Refresh submissions display
  displaySubmissions();
});

// Display submissions from localStorage
function displaySubmissions() {
  const submissions = JSON.parse(localStorage.getItem("contactSubmissions")) || [];
  const submissionsTable = document.getElementById("submissionsTable");
  const submissionsContainer = document.getElementById("submissionsContainer");

  // Show/hide container based on submissions
  if (submissions.length === 0) {
    submissionsContainer.classList.add("hidden");
    return;
  } else {
    submissionsContainer.classList.remove("hidden");
  }

  // Clear existing table rows
  submissionsTable.innerHTML = "";

  // Display each submission (newest first)
  submissions.reverse().forEach((submission, index) => {
    const row = document.createElement("tr");
    row.className = "hover:bg-gray-50 transition-colors";

    // Check if mobile view
    const isMobile = window.innerWidth < 640;

    row.innerHTML = `
      <td class="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">${escapeHtml(submission.name)}</td>
      <td class="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">${escapeHtml(submission.contact)}</td>
      <td class="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm hidden sm:table-cell">${escapeHtml(submission.email)}</td>
      <td class="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm hidden md:table-cell">${escapeHtml(submission.message).substring(0, 50)}${submission.message.length > 50 ? '...' : ''}</td>
      <td class="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm">
        <button onclick="viewSubmission(${submission.id})" class="text-blue-600 hover:text-blue-800 font-semibold mr-2 md:mr-3 text-xs md:text-sm">
          View
        </button>
        <button onclick="deleteSubmission(${submission.id})" class="text-red-600 hover:text-red-800 font-semibold text-xs md:text-sm">
          Delete
        </button>
      </td>
    `;

    submissionsTable.appendChild(row);
  });
}

// View full submission details (mobile-friendly modal)
function viewSubmission(id) {
  const submissions = JSON.parse(localStorage.getItem("contactSubmissions")) || [];
  const submission = submissions.find(sub => sub.id === id);

  if (!submission) return;

  // Create modal for viewing details
  const modal = document.createElement("div");
  modal.className = "mobile-detail-view";
  modal.style.display = "block";

  modal.innerHTML = `
    <div class="mobile-detail-content">
      <span class="mobile-detail-close" onclick="closeModal()">&times;</span>
      <h3 class="text-xl md:text-2xl font-bold mb-6 text-gray-900">Submission Details</h3>
      
      <div class="mobile-detail-field">
        <div class="mobile-detail-label">Name:</div>
        <div class="mobile-detail-value">${escapeHtml(submission.name)}</div>
      </div>

      <div class="mobile-detail-field">
        <div class="mobile-detail-label">Contact Number:</div>
        <div class="mobile-detail-value">${escapeHtml(submission.contact)}</div>
      </div>

      <div class="mobile-detail-field">
        <div class="mobile-detail-label">Email:</div>
        <div class="mobile-detail-value">${escapeHtml(submission.email)}</div>
      </div>

      <div class="mobile-detail-field">
        <div class="mobile-detail-label">Message:</div>
        <div class="mobile-detail-value">${escapeHtml(submission.message)}</div>
      </div>

      <div class="mobile-detail-field">
        <div class="mobile-detail-label">Submitted:</div>
        <div class="mobile-detail-value">${submission.timestamp}</div>
      </div>

      <div class="mt-6 flex gap-3">
        <button onclick="deleteSubmission(${submission.id}); closeModal();" class="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">
          Delete
        </button>
        <button onclick="closeModal()" class="flex-1 px-4 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors">
          Close
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

// Close modal
function closeModal() {
  const modal = document.querySelector(".mobile-detail-view");
  if (modal) {
    modal.remove();
  }
}

// Delete single submission
function deleteSubmission(id) {
  if (!confirm("Are you sure you want to delete this submission?")) return;

  let submissions = JSON.parse(localStorage.getItem("contactSubmissions")) || [];
  submissions = submissions.filter(sub => sub.id !== id);

  localStorage.setItem("contactSubmissions", JSON.stringify(submissions));
  displaySubmissions();

  alert("Submission deleted successfully!");
}

// Clear all submissions
const clearAllBtn = document.getElementById("clearAllBtn");
clearAllBtn.addEventListener("click", () => {
  if (!confirm("Are you sure you want to delete ALL submissions? This cannot be undone!")) return;

  localStorage.removeItem("contactSubmissions");
  displaySubmissions();

  alert("All submissions cleared!");
});

// Utility function to escape HTML and prevent XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Refresh display on window resize for responsive behavior
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    displaySubmissions();
  }, 250);
});

// Initialize reveal animations on page load
window.addEventListener("load", () => {
  reveals.forEach(el => {
    const top = el.getBoundingClientRect().top;
    const trigger = window.innerHeight * 0.85;
    if (top < trigger) el.classList.add("active");
  });
});