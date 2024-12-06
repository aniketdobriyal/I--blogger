let debounceTimeout;
const resultsPerPage = 1;
let currentPage = 1;
let filteredData = []; // Store filtered data to be used for pagination
let allData = []; // Store original data
let lastQuery = '';
let lastCategory = '';

const searchBox = document.getElementById('search-box');
const categoryFilter = document.getElementById('category-filter');
const resultsDiv = document.getElementById('results');
const paginationDiv = document.getElementById('pagination');

// Fetch data from the JSON file
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    allData = data; // Store the original data
    filteredData = data; // Initialize filtered data with all data

    // Debounce function to limit the number of times filtering is called
    function debounce(func, delay) {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(func, delay);
    }

    // Function to highlight the search term in the text
    function highlightText(text, searchTerm) {
      if (!searchTerm) return text;
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      return text.replace(regex, '<span class="highlight">$1</span>');
    }

    // Render an individual result item
    function renderResultItem(item) {
      return `
        <div class="result">
          <h1>${highlightText(item.title, searchBox.value)}</h1>
          <p><strong>Category:</strong> ${item.category}</p>
          <img src="${item.image}" alt="${item.title}" class="result-img">
          <p>${highlightText(item.snippet, searchBox.value)}</p><br><br>
            <p><strong>Date:</strong> ${item.date}</p>
        </div>
      `;
    }

    // Render results for the current page
    function renderResults(results) {
      resultsDiv.innerHTML = ''; // Clear previous results
      const startIndex = (currentPage - 1) * resultsPerPage;
      const endIndex = startIndex + resultsPerPage;
      const paginatedResults = results.slice(startIndex, endIndex);

      if (paginatedResults.length === 0) {
        resultsDiv.innerHTML = '<p>No results found.</p>';
        return;
      }

      // Accumulate HTML content and update DOM once
      const htmlContent = paginatedResults.map(renderResultItem).join('');
      resultsDiv.innerHTML = htmlContent;
    }

    // Render pagination buttons with dynamic page range
    function renderPagination(results) {
      paginationDiv.innerHTML = ''; // Clear existing buttons
      const totalPages = Math.ceil(results.length / resultsPerPage);
      const pageRange = 5; // Display 5 pages at a time

      // Determine the start and end pages for the pagination range
      let startPage = Math.floor((currentPage - 1) / pageRange) * pageRange + 1;
      let endPage = startPage + pageRange - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
      }

      // Create buttons for the page range
      const paginationButtons = [];
      for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.toggle('active', i === currentPage);
        button.addEventListener('click', () => {
          currentPage = i;
          renderResults(filteredData); // Re-render filtered data based on page change
          renderPagination(filteredData); // Re-render pagination
          window.scrollTo(0, 0); // Scroll to the top of the page
        });
        paginationButtons.push(button);
      }

      // Append all pagination buttons at once
      paginationDiv.append(...paginationButtons);

      // Display the "Next" button if more pages exist
      if (endPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => {
          currentPage = endPage + 1;
          renderResults(filteredData);
          renderPagination(filteredData);
        });
        paginationDiv.appendChild(nextButton);
      }

      // Display the "Previous" button if previous pages exist
      if (startPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => {
          currentPage = startPage - 1;
          renderResults(filteredData);
          renderPagination(filteredData);
        });
        paginationDiv.prepend(prevButton);
      }
    }

    // Function to filter results based on search and category
    function filterResults() {
      const query = searchBox.value.toLowerCase();
      const category = categoryFilter.value;

      // Prevent unnecessary filtering if the query/category hasn't changed
      if (query === lastQuery && category === lastCategory) return;

      // Filter the data based on both search term and category
      filteredData = allData.filter(item => {
        return (
          (item.title.toLowerCase().includes(query) || item.snippet.toLowerCase().includes(query)) &&
          (category === '' || item.category === category)
        );
      });

      lastQuery = query; // Save the query
      lastCategory = category; // Save the selected category

      currentPage = 1; // Reset to the first page after filter
      renderResults(filteredData);
      renderPagination(filteredData);
    }

    // Listen for changes to search box and category filter
    searchBox.addEventListener('input', () => {
      debounce(() => filterResults(), 300); // Pass a function reference
    });
    categoryFilter.addEventListener('change', filterResults);

    // Initial render of all results
    renderResults(allData);
    renderPagination(allData);
  })
  .catch(error => console.error('Error loading data:', error));
